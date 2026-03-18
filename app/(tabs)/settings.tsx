import PrintContainersSheet, {
  PrintContainersSheetHandle,
} from "@/components/print/PrintContainersSheet";
import PrinterSheet from "@/components/print/PrinterSheet";
import LabelFormatSheet, {
  LabelFormatSheetHandle,
} from "@/components/print/LabelFormatSheet";
import TMBButton from "@/components/ui/TMBButton";
import { Colors } from "@/constants/colors";
import { labelsPerSheet } from "@/services/labelFormats";
import { useContainerStore } from "@/stores/useContainerStore";
import { usePrinterStore } from "@/stores/usePrinterStore";
import { useQRSettingsStore } from "@/stores/useQRSettingsStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Updates from "expo-updates";
import { Stack, useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";


// ─── Setting row ──────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  hint,
  right,
  onPress,
  last,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const inner = (
    <View style={[s.row, last && s.rowLast]}>
      <View style={s.rowLeft}>
        <View style={[s.iconBox, { backgroundColor: iconBg }]}>
          <Icon name={icon as any} size={18} colors={[iconColor]} weight="medium" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowLabel}>{label}</Text>
          {hint ? <Text style={s.rowHint} numberOfLines={2}>{hint}</Text> : null}
        </View>
      </View>
      <View style={s.rowRight}>
        {right ?? (
          onPress
            ? <Icon name="chevron.right" size={13} colors={[Colors.grey[400]]} weight="medium" />
            : null
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => pressed && { opacity: 0.7 }} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function SettingInfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowBorder]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Default format fallback (avoids importing DEFAULT_FORMAT directly here) ──
const FALLBACK_FORMAT = {
  id: "a4-full", name: "A4 – Pleine page", isCustom: false,
  paperWidth: 210, paperHeight: 297,
  cols: 1, rows: 1,
  labelWidth: 190, labelHeight: 277,
  marginTop: 10, marginLeft: 10,
  gapH: 0, gapV: 0,
} as const;

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { printerStatus, printerMode, connectedDevice } = usePrinterStore();
  const { containers, fetchContainers } = useContainerStore();
  const { load: loadQR } = useQRSettingsStore();

  const [advancedMode,   setAdvancedMode]   = useState(false);
  const [thirdPartyMode, setThirdPartyMode] = useState(true);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    if (!Updates.isEnabled) {
      Alert.alert("Mises à jour", "Les mises à jour OTA ne sont pas actives en mode développement.");
      return;
    }
    setCheckingUpdate(true);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          "Mise à jour disponible",
          "Une nouvelle version a été téléchargée. Redémarrer l'app pour l'appliquer.",
          [
            { text: "Plus tard", style: "cancel" },
            { text: "Redémarrer", onPress: () => Updates.reloadAsync() },
          ]
        );
      } else {
        Alert.alert("À jour", "Vous utilisez déjà la dernière version.");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de vérifier les mises à jour.");
    } finally {
      setCheckingUpdate(false);
    }
  };

  // Sheet refs
  const printerSheetRef = useRef<BottomSheetModal>(null);
  const formatSheetRef  = useRef<LabelFormatSheetHandle>(null);
  const printSheetRef   = useRef<PrintContainersSheetHandle>(null);

  // Hidden QR node lives here (owned by PrintContainersSheet via callback)
  const [hiddenQRNode, setHiddenQRNode] = useState<React.ReactNode>(null);

  useEffect(() => {
    fetchContainers();
    loadQR();
  }, []);

  const isConnected = printerStatus === "connected" || printerStatus === "printing";

  const printerHint = printerMode === "ble"
    ? isConnected
      ? `Connectée · ${connectedDevice?.name ?? "MX06"}`
      : printerStatus === "scanning" ? "Recherche en cours…" : "Non connectée"
    : "AirPrint / Wi-Fi / USB";

  // Re-read hint every render so it stays fresh after format changes
  const activeFormat = formatSheetRef.current?.activeFormat ?? FALLBACK_FORMAT;
  const formatHint   = `${activeFormat.name} · ${labelsPerSheet(activeFormat)} étiq./page`;

  return (
    <View style={s.screen}>
      {/* Hidden QR node for batch print — must stay in view tree */}
      {hiddenQRNode}

      {/* Bottom sheets (portaled via BottomSheetModalProvider in _layout) */}
      <PrinterSheet ref={printerSheetRef} />
      <LabelFormatSheet ref={formatSheetRef} />
      <PrintContainersSheet
        ref={printSheetRef}
        getActiveFormat={() => formatSheetRef.current?.activeFormat ?? FALLBACK_FORMAT}
        onRequestHiddenNode={setHiddenQRNode}
      />

      <Stack.Screen
        options={{
          title: "Réglages",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Impression ────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Impression</Text>
        <View style={s.card}>
          <SettingRow
            icon="printer.fill"
            iconBg={isConnected ? Colors.status.successLight : Colors.navy.ghost}
            iconColor={isConnected ? Colors.status.success : Colors.primary}
            label={printerMode === "ble" ? "Imprimante BLE" : "Imprimante système"}
            hint={printerHint}
            onPress={() => printerSheetRef.current?.present()}
          />
          <SettingRow
            icon="doc.text"
            iconBg={Colors.status.infoLight}
            iconColor={Colors.status.info}
            label="Format d'étiquettes"
            hint={formatHint}
            onPress={() => formatSheetRef.current?.present()}
          />
          <SettingRow
            icon="printer"
            iconBg={Colors.navy.ghost}
            iconColor={Colors.primary}
            label={`Imprimer (${containers.length} carton${containers.length !== 1 ? "s" : ""})`}
            hint="Choisir les cartons et lancer l'impression"
            onPress={() => printSheetRef.current?.present()}
            last
          />
        </View>

        {/* ── Organisation ──────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Organisation</Text>
        <View style={s.card}>
          <SettingRow
            icon="rectangle.3.group.fill"
            iconBg={Colors.navy.ghost}
            iconColor={Colors.primary}
            label="Gérer les pièces"
            hint="Créer et organiser les pièces de départ et d'arrivée"
            onPress={() => router.push('/rooms' as any)}
            last
          />
        </View>

        {/* ── QR Code ───────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>QR Code</Text>
        <View style={s.card}>
          <SettingRow
            icon="qrcode"
            iconBg={Colors.navy.ghost}
            iconColor={Colors.primary}
            label="Personnaliser le QR Code"
            hint="Couleurs, pixels, coins, cadre"
            onPress={() => router.push('/settings/qr' as any)}
            last
          />
        </View>

        {/* ── Modules ───────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Modules</Text>
        <View style={s.card}>
          <SettingRow
            icon="puzzlepiece.fill"
            iconBg={Colors.status.infoLight}
            iconColor={Colors.status.info}
            label="Mode avancé"
            hint="Photos, valeurs estimées, catégories"
            right={
              <Switch
                value={advancedMode}
                onValueChange={setAdvancedMode}
                trackColor={{ false: Colors.grey[300], true: Colors.status.success }}
                thumbColor={Colors.surface}
              />
            }
          />
          <SettingRow
            icon="person.2.fill"
            iconBg={Colors.status.warningLight}
            iconColor={Colors.status.warning}
            label="Je garde ça pour quelqu'un"
            hint="Gérer les objets d'autres personnes"
            last
            right={
              <Switch
                value={thirdPartyMode}
                onValueChange={setThirdPartyMode}
                trackColor={{ false: Colors.grey[300], true: Colors.status.success }}
                thumbColor={Colors.surface}
              />
            }
          />
        </View>

        {/* ── À propos ──────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>À propos</Text>
        <View style={s.card}>
          <SettingInfoRow label="Version" value="1.0.0" />
          <SettingInfoRow label="Build" value="2026.03" />
          <SettingRow
            icon="arrow.down.circle.fill"
            iconBg={Colors.navy.ghost}
            iconColor={Colors.primary}
            label={checkingUpdate ? "Vérification…" : "Vérifier les mises à jour"}
            onPress={checkingUpdate ? undefined : handleCheckUpdate}
            last
          />
        </View>

        {/* ── Données ───────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Données</Text>
        <View style={s.card}>
          <View style={s.dataRow}>
            <TMBButton
              title="Exporter"
              onPress={() => Alert.alert("Export", "Export en cours…")}
              variant="secondary"
              icon="download-outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <TMBButton
              title="Importer"
              onPress={() => Alert.alert("Import", "Import en cours…")}
              variant="secondary"
              icon="cloud-upload-outline"
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },

  sectionTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text.secondary,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 8, marginTop: 24, marginLeft: 12,
  },

  card: {
    backgroundColor: Colors.surface, borderRadius: 16, borderCurve: "continuous",
    borderWidth: 1, borderColor: Colors.borderLight,
    paddingHorizontal: 16, overflow: "hidden",
  },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  rowLast:  { borderBottomWidth: 0 },
  rowLeft:  { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 10 },
  rowRight: { flexShrink: 0 },
  iconBox:  {
    width: 34, height: 34, borderRadius: 9, borderCurve: "continuous",
    alignItems: "center", justifyContent: "center",
  },
  rowLabel: { fontSize: 16, fontWeight: "500", color: Colors.text.primary },
  rowHint:  { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },

  infoRow:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel:     { fontSize: 16, color: Colors.text.primary },
  infoValue:     { fontSize: 16, color: Colors.text.secondary },

  dataRow: { flexDirection: "row", gap: 12, paddingVertical: 12 },

});

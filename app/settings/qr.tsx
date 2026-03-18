import { Colors } from "@/constants/colors";
import { getEyeProps, getModuleProps } from "@/services/qrShapes";
import {
  QRContainerShape,
  QREyeShape,
  QRModuleShape,
  useQRSettingsStore,
} from "@/stores/useQRSettingsStore";
import { Stack } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import QRCode from "react-native-qrcode-styled";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Data ─────────────────────────────────────────────────────────────────────
const QR_FG_COLORS = [
  "#000000", "#1A1A1A", "#007AFF", "#34C759", "#FF3B30", "#5856D6",
];
const QR_BG_COLORS = [
  "#FFFFFF", "#F2F2F7", "#E3F2FD", "#E8F5E9", "#FFF8E1",
];

const MODULE_SHAPES: { key: QRModuleShape; label: string }[] = [
  { key: "square",  label: "Carré" },
  { key: "rounded", label: "Arrondi" },
  { key: "dots",    label: "Points" },
  { key: "diamond", label: "Losange" },
  { key: "star",    label: "Étoile" },
];

const EYE_SHAPES: { key: QREyeShape; label: string }[] = [
  { key: "square",          label: "Carré" },
  { key: "rounded",         label: "Arrondi" },
  { key: "dots",            label: "Points" },
  { key: "classic",         label: "Classique" },
  { key: "classic-rounded", label: "Cl. arrondi" },
];

const CONTAINER_SHAPES: { key: QRContainerShape; label: string }[] = [
  { key: "square",  label: "Carré" },
  { key: "rounded", label: "Arrondi" },
  { key: "circle",  label: "Cercle" },
];

// ─── Module shape preview ──────────────────────────────────────────────────────
function ModulePreview({ shape, color }: { shape: QRModuleShape; color: string }) {
  const base: any = { width: 20, height: 20, backgroundColor: color };
  if (shape === "rounded")  return <View style={[base, { borderRadius: 5 }]} />;
  if (shape === "dots")     return <View style={[base, { borderRadius: 10 }]} />;
  if (shape === "diamond")  return <View style={[base, { transform: [{ rotate: "45deg" }], width: 16, height: 16 }]} />;
  if (shape === "star")     return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: 20, height: 9,  backgroundColor: color, borderRadius: 2 }} />
      <View style={{ position: "absolute", width: 9,  height: 20, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ position: "absolute", width: 14, height: 14, backgroundColor: color, transform: [{ rotate: "45deg" }] }} />
    </View>
  );
  return <View style={base} />;
}

// ─── Eye shape preview ────────────────────────────────────────────────────────
function EyePreview({ shape, color }: { shape: QREyeShape; color: string }) {
  const outerR = shape === "rounded" || shape === "classic-rounded" ? 7
               : shape === "dots"    ? 11 : 0;
  const innerR = shape === "rounded" || shape === "classic-rounded" ? 4
               : shape === "dots"    ? 8  : 0;
  return (
    <View style={{ width: 22, height: 22, borderWidth: 3, borderColor: color, borderRadius: outerR }}>
      <View style={{ position: "absolute", inset: 3, backgroundColor: color, borderRadius: innerR }} />
    </View>
  );
}

// ─── Frame shape preview ──────────────────────────────────────────────────────
function FramePreview({ shape, color }: { shape: QRContainerShape; color: string }) {
  const r = shape === "rounded" ? 8 : shape === "circle" ? 11 : 0;
  return <View style={{ width: 22, height: 22, backgroundColor: color, borderRadius: r }} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function QRSettingsScreen() {
  const {
    fgColor, bgColor, showLogo,
    moduleShape, eyeShape, containerShape,
    update,
  } = useQRSettingsStore();

  const containerBR =
    containerShape === "rounded" ? 16 :
    containerShape === "circle"  ? 90 : 0;

  return (
    <View style={s.screen}>
      <Stack.Screen
        options={{
          title: "QR Code",
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

        {/* ── Aperçu live ───────────────────────────────────────────── */}
        <View style={s.previewCard}>
          <View style={[s.qrFrame, { backgroundColor: bgColor, borderRadius: containerBR }]}>
            <QRCode
              data="TMB-PREVIEW-123"
              size={160}
              style={{ backgroundColor: bgColor }}
              color={fgColor}
              {...getModuleProps(moduleShape)}
              outerEyesOptions={getEyeProps(eyeShape).outer}
              innerEyesOptions={getEyeProps(eyeShape).inner}
            />
          </View>
          <Text style={s.previewHint}>Aperçu en temps réel</Text>
        </View>

        {/* ── Couleurs ──────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Couleurs</Text>
        <View style={s.card}>

          <View style={s.colorRow}>
            <View style={s.colorRowLabel}>
              <Icon name="qrcode" size={16} colors={[Colors.primary]} weight="medium" />
              <Text style={s.colorLabel}>Couleur des modules</Text>
            </View>
            <View style={s.swatches}>
              {QR_FG_COLORS.map((hex) => (
                <TouchableOpacity
                  key={hex}
                  style={[s.swatch, { backgroundColor: hex }, fgColor === hex && s.swatchOn]}
                  onPress={() => update({ fgColor: hex })}
                />
              ))}
            </View>
          </View>

          <View style={[s.colorRow, s.colorRowLast]}>
            <View style={s.colorRowLabel}>
              <Icon name="square.fill" size={16} colors={[Colors.grey[400]]} weight="medium" />
              <Text style={s.colorLabel}>Fond</Text>
            </View>
            <View style={s.swatches}>
              {QR_BG_COLORS.map((hex) => (
                <TouchableOpacity
                  key={hex}
                  style={[s.swatch, { backgroundColor: hex }, s.swatchBorder, bgColor === hex && s.swatchOn]}
                  onPress={() => update({ bgColor: hex })}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── Style des pixels ──────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Style des pixels</Text>
        <View style={s.card}>
          <View style={s.chipRow}>
            {MODULE_SHAPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.chip, moduleShape === key && s.chipOn]}
                onPress={() => update({ moduleShape: key })}
              >
                <ModulePreview shape={key} color={moduleShape === key ? Colors.primary : Colors.grey[500]} />
                <Text style={[s.chipLabel, moduleShape === key && s.chipLabelOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Style des coins ───────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Style des coins</Text>
        <View style={s.card}>
          <View style={s.chipRow}>
            {EYE_SHAPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.chip, eyeShape === key && s.chipOn]}
                onPress={() => update({ eyeShape: key })}
              >
                <EyePreview shape={key} color={eyeShape === key ? Colors.primary : Colors.grey[500]} />
                <Text style={[s.chipLabel, eyeShape === key && s.chipLabelOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Forme du cadre ────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Forme du cadre</Text>
        <View style={s.card}>
          <View style={[s.chipRow, { justifyContent: "flex-start" }]}>
            {CONTAINER_SHAPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.chip, containerShape === key && s.chipOn]}
                onPress={() => update({ containerShape: key })}
              >
                <FramePreview shape={key} color={containerShape === key ? Colors.primary : Colors.grey[500]} />
                <Text style={[s.chipLabel, containerShape === key && s.chipLabelOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Options ───────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Options</Text>
        <View style={s.card}>
          <View style={s.optionRow}>
            <View style={s.optionLeft}>
              <View style={[s.iconBox, { backgroundColor: Colors.status.infoLight }]}>
                <Icon name="seal.fill" size={18} colors={[Colors.status.info]} weight="medium" />
              </View>
              <View>
                <Text style={s.optionLabel}>Icône au centre</Text>
                <Text style={s.optionHint}>Affiche le type de carton au centre</Text>
              </View>
            </View>
            <Switch
              value={showLogo}
              onValueChange={(v) => update({ showLogo: v })}
              trackColor={{ false: Colors.grey[300], true: Colors.status.success }}
              thumbColor={Colors.surface}
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
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 60 },

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

  // ── Preview ────────────────────────────────────────────────────
  previewCard: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: Colors.surface,
    borderRadius: 20, borderCurve: "continuous",
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  qrFrame: { padding: 12 },
  previewHint: {
    marginTop: 14,
    fontSize: 12, fontWeight: "500",
    color: Colors.text.secondary,
  },

  // ── Colors ─────────────────────────────────────────────────────
  colorRow: {
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  colorRowLast: { borderBottomWidth: 0 },
  colorRowLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorLabel: { fontSize: 15, fontWeight: "500", color: Colors.text.primary },
  swatches:   { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  swatch:     { width: 30, height: 30, borderRadius: 15 },
  swatchBorder: { borderWidth: 1, borderColor: Colors.border },
  swatchOn:     { borderWidth: 3, borderColor: Colors.primary },

  // ── Chips ──────────────────────────────────────────────────────
  chipRow: {
    flexDirection: "row", flexWrap: "wrap",
    paddingVertical: 14, gap: 10,
  },
  chip: {
    alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderCurve: "continuous",
    borderWidth: 1.5, borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  chipOn:       { borderColor: Colors.primary, backgroundColor: Colors.navy.ghost },
  chipLabel:    { fontSize: 11, fontWeight: "500", color: Colors.text.secondary },
  chipLabelOn:  { color: Colors.primary },

  // ── Option row ─────────────────────────────────────────────────
  optionRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 10 },
  iconBox: {
    width: 34, height: 34, borderRadius: 9, borderCurve: "continuous",
    alignItems: "center", justifyContent: "center",
  },
  optionLabel: { fontSize: 16, fontWeight: "500", color: Colors.text.primary },
  optionHint:  { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },
});

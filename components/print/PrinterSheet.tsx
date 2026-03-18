import TMBButton from "@/components/ui/TMBButton";
import { Colors } from "@/constants/colors";
import { usePrinterStore } from "@/stores/usePrinterStore";
import { BLEDevice } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { SymbolView as Icon } from "expo-symbols";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Signal bars ──────────────────────────────────────────────────────────────
function SignalBars({ rssi }: { rssi?: number }) {
  const level = !rssi ? 0 : rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={sig.row}>
      {[1, 2, 3, 4].map(b => (
        <View key={b} style={[sig.bar, { height: 4 + b * 3 }, b <= level ? sig.on : sig.off]} />
      ))}
    </View>
  );
}
const sig = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 4, borderRadius: 2 },
  on:  { backgroundColor: Colors.status.success },
  off: { backgroundColor: Colors.grey[200] },
});

// ─── Device row ───────────────────────────────────────────────────────────────
function DeviceRow({ device, onConnect }: { device: BLEDevice; onConnect: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.deviceRow, pressed && { opacity: 0.7 }]}
      onPress={onConnect}
    >
      <View style={s.deviceLeft}>
        <View style={s.deviceIcon}>
          <Icon name="printer" size={15} colors={[Colors.primary]} weight="medium" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.deviceName}>{device.name ?? "Appareil inconnu"}</Text>
          <Text style={s.deviceId} numberOfLines={1}>{device.id}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <SignalBars rssi={device.rssi} />
        <Icon name="chevron.right" size={13} colors={[Colors.grey[400]]} weight="medium" />
      </View>
    </Pressable>
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────
const SNAP_POINTS = ["50%", "85%"];

const PrinterSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const {
    printerStatus, printerMode,
    connectedDevice, availableDevices, error,
    setMode, startScan, stopScan, connectToDevice, disconnect, clearError,
  } = usePrinterStore();

  const dotAnim = useRef(new Animated.Value(1)).current;

  const isScanning   = printerStatus === "scanning";
  const isConnecting = printerStatus === "connecting";
  const isConnected  = printerStatus === "connected" || printerStatus === "printing";

  useEffect(() => {
    if (isScanning) {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
        ]),
      );
      a.start();
      return () => a.stop();
    }
    dotAnim.setValue(1);
  }, [isScanning]);

  useEffect(() => {
    if (error) Alert.alert("Bluetooth", error, [{ text: "OK", onPress: clearError }]);
  }, [error]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={s.sheetBg}
      handleIndicatorStyle={s.handle}
    >
      <BottomSheetScrollView contentContainerStyle={s.content}>

        {/* Title */}
        <Text style={s.title}>Imprimante</Text>

        {/* Mode toggle */}
        <View style={s.modeToggle}>
          {(["ble", "system"] as const).map(mode => {
            const active = printerMode === mode;
            return (
              <Pressable
                key={mode}
                style={[s.modeBtn, active && s.modeBtnActive]}
                onPress={() => setMode(mode)}
              >
                <Icon
                  name={mode === "ble" ? "dot.radiowaves.left.and.right" : "printer"}
                  size={15}
                  colors={[active ? Colors.surface : Colors.text.secondary]}
                  weight="medium"
                />
                <Text style={[s.modeBtnText, active && s.modeBtnTextActive]}>
                  {mode === "ble" ? "Thermique BLE" : "Imprimante système"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── BLE ────────────────────────────────────────────────────── */}
        {printerMode === "ble" && (
          <View style={s.card}>

            {/* Status */}
            <View style={s.statusRow}>
              <View style={s.statusLeft}>
                <View style={[s.iconBox, { backgroundColor: Colors.navy.ghost }]}>
                  <Icon name="printer.fill" size={20} colors={[Colors.primary]} weight="medium" />
                </View>
                <View>
                  <Text style={s.statusLabel}>
                    {isConnected   ? connectedDevice?.name ?? "Imprimante"
                     : isScanning  ? "Recherche en cours…"
                     : isConnecting ? "Connexion…"
                     : "Aucune imprimante BLE"}
                  </Text>
                  <Text style={s.statusHint}>
                    {isConnected  ? "MX06 · Connectée"
                     : isScanning  ? `${availableDevices.length} appareil${availableDevices.length !== 1 ? "s" : ""} trouvé${availableDevices.length !== 1 ? "s" : ""}`
                     : "MX06 / Compatible BLE ESC-POS"}
                  </Text>
                </View>
              </View>
              <Animated.View
                style={[s.dot, {
                  opacity: isScanning ? dotAnim : 1,
                  backgroundColor: isConnected
                    ? Colors.status.success
                    : isScanning || isConnecting ? Colors.status.warning
                    : Colors.grey[300],
                }]}
              />
            </View>

            {/* Connected info */}
            {isConnected && (
              <View style={s.connectedRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon name="checkmark.circle.fill" size={14} colors={[Colors.status.success]} />
                  <Text style={s.connectedId}>{connectedDevice?.id?.slice(0, 8)}…</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [s.disconnectBtn, pressed && { opacity: 0.7 }]}
                  onPress={() =>
                    Alert.alert("Déconnecter", "Déconnecter l'imprimante ?", [
                      { text: "Annuler", style: "cancel" },
                      { text: "Déconnecter", style: "destructive", onPress: disconnect },
                    ])
                  }
                >
                  <Text style={s.disconnectText}>Déconnecter</Text>
                </Pressable>
              </View>
            )}

            {/* Connecting indicator */}
            {isConnecting && (
              <View style={s.connectingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={s.connectingText}>Connexion à l'imprimante…</Text>
              </View>
            )}

            {/* Scan button */}
            {!isConnected && (
              <TMBButton
                title={isScanning ? "Arrêter la recherche" : "Rechercher des appareils"}
                onPress={() => (isScanning ? stopScan() : startScan())}
                variant={isScanning ? "danger" : "secondary"}
                icon={isScanning ? "stop-circle-outline" : "bluetooth-outline"}
                size="sm"
                style={{ marginTop: 12, marginBottom: 4 }}
              />
            )}

            {/* Device list */}
            {(isScanning || availableDevices.length > 0) && !isConnected && !isConnecting && (
              <View style={s.deviceList}>
                <View style={s.deviceListHeader}>
                  <Text style={s.deviceListTitle}>Appareils détectés</Text>
                  {isScanning && <ActivityIndicator size="small" color={Colors.primary} />}
                </View>
                {availableDevices.length === 0 ? (
                  <Text style={s.noDevicesText}>
                    Allumez l'imprimante et approchez-la de votre téléphone.
                  </Text>
                ) : (
                  availableDevices.map((device, i) => (
                    <View key={device.id}>
                      {i > 0 && <View style={s.divider} />}
                      <DeviceRow device={device} onConnect={() => connectToDevice(device)} />
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ── System ─────────────────────────────────────────────────── */}
        {printerMode === "system" && (
          <View style={s.card}>
            <View style={s.statusRow}>
              <View style={s.statusLeft}>
                <View style={[s.iconBox, { backgroundColor: Colors.status.infoLight }]}>
                  <Icon name="printer.fill" size={20} colors={[Colors.status.info]} weight="medium" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.statusLabel}>AirPrint / Wi-Fi / USB</Text>
                  <Text style={s.statusHint}>
                    La boîte de dialogue système gère automatiquement l'imprimante et le format papier
                  </Text>
                </View>
              </View>
              <Icon name="checkmark.circle.fill" size={18} colors={[Colors.status.success]} />
            </View>
          </View>
        )}

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

PrinterSheet.displayName = "PrinterSheet";
export default PrinterSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.background },
  handle:  { backgroundColor: Colors.grey[300], width: 36 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },

  title: {
    fontSize: 20, fontWeight: "700", color: Colors.text.primary,
    marginBottom: 16, marginTop: 4,
  },

  modeToggle: { flexDirection: "row", gap: 8, marginBottom: 16 },
  modeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14, borderCurve: "continuous",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight,
  },
  modeBtnActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeBtnText:       { fontSize: 13, fontWeight: "600", color: Colors.text.secondary },
  modeBtnTextActive: { color: Colors.surface },

  card: {
    backgroundColor: Colors.surface, borderRadius: 16, borderCurve: "continuous",
    borderWidth: 1, borderColor: Colors.borderLight,
    paddingHorizontal: 16, paddingVertical: 8,
  },

  statusRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12,
  },
  statusLeft:  { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 12 },
  iconBox:     { width: 36, height: 36, borderRadius: 10, borderCurve: "continuous", alignItems: "center", justifyContent: "center" },
  statusLabel: { fontSize: 16, fontWeight: "500", color: Colors.text.primary },
  statusHint:  { fontSize: 13, color: Colors.text.secondary, marginTop: 2, flexShrink: 1 },
  dot:         { width: 10, height: 10, borderRadius: 5 },

  connectedRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  connectedId:    { fontSize: 12, color: Colors.text.secondary, fontFamily: "monospace" },
  disconnectBtn:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.status.errorLight },
  disconnectText: { fontSize: 13, color: Colors.status.error, fontWeight: "600" },

  connectingRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  connectingText: { fontSize: 14, color: Colors.text.secondary },

  deviceList:       { marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 8 },
  deviceListHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  deviceListTitle:  { fontSize: 13, fontWeight: "600", color: Colors.text.secondary },
  noDevicesText:    { fontSize: 13, color: Colors.text.muted, textAlign: "center", paddingVertical: 16 },

  deviceRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  deviceLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  deviceIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.navy.ghost, alignItems: "center", justifyContent: "center" },
  deviceName: { fontSize: 15, fontWeight: "500", color: Colors.text.primary },
  deviceId:   { fontSize: 11, color: Colors.text.muted, marginTop: 1 },

  divider: { height: 1, backgroundColor: Colors.borderLight },
});

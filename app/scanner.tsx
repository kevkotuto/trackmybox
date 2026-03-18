import TMBButton from "@/components/ui/TMBButton";
import TMBInput from "@/components/ui/TMBInput";
import { Colors } from "@/constants/colors";
import { useContainerStore } from "@/stores/useContainerStore";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import { Audio } from "expo-av";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SCAN_SIZE = 260;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { getContainerByQR } = useContainerStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.Sound.createAsync(require("../assets/sounds/beep.wav"))
      .then(({ sound }) => { soundRef.current = sound; })
      .catch(() => {});
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playBeep = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch {}
  }, []);

  // Reset scan state when screen comes into focus, block when it leaves
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setIsSearching(false);
      return () => {
        setScanned(true);
      };
    }, [])
  );

  // Animated scan line
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_SIZE - 3],
  });

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isSearching) return;
    setScanned(true);
    setIsSearching(true);

    // Haptic impact + bip dès la détection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playBeep();

    try {
      const container = await getContainerByQR(data);
      if (container) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.push(`/container/${container.id}`);
      } else {
        Alert.alert(
          "Introuvable",
          `Ce QR code ne correspond à aucun carton.\n\nCode lu :\n${data.trim()}`,
          [{ text: "Scanner à nouveau", style: "cancel", onPress: () => setScanned(false) }]
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      Alert.alert("Erreur", `Impossible de lire ce code.\n\n${msg}`, [
        { text: "Réessayer", onPress: () => setScanned(false) },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const container = await getContainerByQR(manualCode.trim());
      if (container) {
        router.push(`/container/${container.id}`);
        setManualCode("");
        setShowManual(false);
      } else {
        Alert.alert("Introuvable", "Aucun carton avec ce code.");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de trouver ce carton.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{ title: "Scanner", headerLargeTitle: true, headerTransparent: true }}
        />
        <View style={styles.permissionIconBg}>
          <Icon name="camera.viewfinder" size={44} colors={[Colors.primary]} weight="regular" />
        </View>
        <Text style={styles.permissionTitle}>Caméra requise</Text>
        <Text style={styles.permissionSubtitle}>
          Autorisez l'accès à la caméra pour scanner les QR codes de vos cartons.
        </Text>
        <TMBButton
          title="Autoriser la caméra"
          onPress={requestPermission}
          icon="camera-outline"
          style={{ marginTop: 28 }}
        />
      </View>
    );
  }


  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        {/* Top section */}
        <View style={styles.topDark}>
          <Pressable
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Icon name="xmark" size={18} colors={[Colors.surface]} weight="semibold" />
          </Pressable>
          <View style={styles.topContent}>
            <Text style={styles.topTitle}>Scanner un carton</Text>
            <Text style={styles.topSubtitle}>Pointez sur le QR code du sticker</Text>
          </View>
        </View>

        {/* Middle row with scan frame */}
        <View style={styles.middleRow}>
          <View style={styles.sideDark} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {!isSearching && (
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
              />
            )}

            {isSearching && (
              <View style={styles.searchingOverlay}>
                <View style={styles.searchingPulse} />
              </View>
            )}
          </View>
          <View style={styles.sideDark} />
        </View>

        {/* Bottom section */}
        <View style={styles.bottomDark}>
          <Text style={styles.scanHint}>
            {isSearching ? "Recherche du carton..." : "Placez le QR code dans le cadre"}
          </Text>
          <View style={styles.controls}>
            <Pressable
              style={({ pressed }) => [styles.controlBtn, pressed && styles.pressed]}
              onPress={() => setFlashOn(v => !v)}
            >
              <View style={[styles.controlIconBg, flashOn && styles.controlIconBgOn]}>
                <Icon
                  name={flashOn ? "bolt.fill" : "bolt.slash.fill"}
                  size={22}
                  colors={[flashOn ? Colors.primary : Colors.surface]}
                  weight="medium"
                />
              </View>
              <Text style={styles.controlLabel}>Flash</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.controlBtn, pressed && styles.pressed]}
              onPress={() => setShowManual(true)}
            >
              <View style={styles.controlIconBg}>
                <Icon name="keyboard" size={22} colors={[Colors.surface]} weight="medium" />
              </View>
              <Text style={styles.controlLabel}>Manuel</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Manual entry overlay */}
      {showManual && (
        <KeyboardAvoidingView
          style={styles.manualOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={styles.manualBackdrop} onPress={() => setShowManual(false)} />
          <View style={styles.manualSheet}>
            <View style={styles.manualHandle} />
            <View style={styles.manualHeader}>
              <View style={styles.manualIconBg}>
                <Icon name="keyboard" size={24} colors={[Colors.primary]} weight="medium" />
              </View>
              <Pressable onPress={() => setShowManual(false)} style={styles.manualCloseBtn} hitSlop={10}>
                <Icon name="xmark" size={16} colors={[Colors.text.secondary]} weight="semibold" />
              </Pressable>
            </View>
            <Text style={styles.manualTitle}>Code du carton</Text>
            <Text style={styles.manualSubtitle}>
              Entrez le code QR affiché sur le sticker du carton
            </Text>
            <TMBInput
              label="Code"
              placeholder="Entrez le code manuellement..."
              icon="text.cursor"
              value={manualCode}
              onChangeText={setManualCode}
              autoFocus
              containerStyle={{ marginTop: 16 }}
            />
            <TMBButton
              title="Rechercher"
              onPress={handleManualEntry}
              icon="search-outline"
              disabled={!manualCode.trim()}
              loading={isSearching}
              style={{ marginTop: 14, width: "100%" }}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },

  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingText: { fontSize: 15, color: Colors.text.secondary },
  permissionIconBg: {
    width: 90,
    height: 90,
    borderRadius: 26,
    backgroundColor: Colors.navy.ghost,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },

  overlay: { ...StyleSheet.absoluteFillObject },

  topDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)" },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 32,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  topContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: Colors.surface, marginBottom: 4 },
  topSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.55)" },

  middleRow: { flexDirection: "row", height: SCAN_SIZE },
  sideDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)" },

  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    overflow: "hidden",
  },
  corner: { position: "absolute", width: 28, height: 28, borderColor: Colors.surface },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
  },

  searchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchingPulse: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.surface,
  },

  bottomDark: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 28,
  },
  scanHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  controls: {
    flexDirection: "row",
    gap: 44,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 32,
  },
  controlBtn: { alignItems: "center", gap: 8 },
  pressed: { opacity: 0.7 },
  controlIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlIconBgOn: { backgroundColor: Colors.surface },
  controlLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600" },

  manualOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 20,
  },
  manualBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  manualSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  manualHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  manualCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navy.ghost,
    alignItems: "center",
    justifyContent: "center",
  },
  manualIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.navy.ghost,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  manualSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

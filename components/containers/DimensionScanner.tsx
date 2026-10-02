import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export interface Dimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
}

interface DimensionScannerProps {
  onCapture: (dims: Dimensions) => void;
  onClose: () => void;
}

// Safe top-level import of VisionCamera (requires react-native-worklets-core)
let VisionCamera: any = null;
try {
  require('react-native-worklets-core');
  VisionCamera = require('react-native-vision-camera');
} catch {}

function DimBadge({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.dimBadge}>
      <Text style={styles.dimLabel}>{label}</Text>
      <Text style={styles.dimValue}>{value.toFixed(1)}</Text>
      <Text style={styles.dimUnit}>cm</Text>
    </View>
  );
}

/**
 * Wrapper that can call VisionCamera hooks unconditionally.
 * Only rendered when VisionCamera is available.
 */
function LiDARView({ onCapture, onSwitchManual }: {
  onCapture: (d: Dimensions) => void;
  onSwitchManual: () => void;
}) {
  const device = VisionCamera.useCameraDevice('back');
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<Dimensions | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const frameProcessor = VisionCamera.useFrameProcessor((frame: any) => {
    'worklet';
    try {
      const result = (global as any).measureBox(frame);
      if (result) { (global as any).__lidarResult = result; }
    } catch {}
  }, []);

  const startScan = () => {
    setScanning(true);
    setDetected(null);
    (global as any).__lidarResult = null;
    pollRef.current = setInterval(() => {
      const r = (global as any).__lidarResult;
      if (r) {
        clearInterval(pollRef.current!);
        (global as any).__lidarResult = null;
        setScanning(false);
        setDetected({ widthCm: r.w, heightCm: r.h, depthCm: r.d });
      }
    }, 500);
  };

  const stopScan = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setScanning(false);
  };

  if (!device) {
    return (
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.status.warning} />
        <Text style={styles.bannerText}>Caméra arrière indisponible.{'\n'}
          <Text onPress={onSwitchManual} style={styles.bannerLink}>Saisir manuellement</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.body}>
      <View style={styles.cameraWrap}>
        <VisionCamera.Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={scanning}
          frameProcessor={frameProcessor}
        />
        <View style={styles.overlay}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        {scanning && (
          <View style={styles.scanningBadge}>
            <ActivityIndicator size="small" color={Colors.surface} />
            <Text style={styles.scanningText}>Scan LiDAR en cours…</Text>
          </View>
        )}
      </View>

      {detected ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Dimensions détectées</Text>
          <View style={styles.dimRow}>
            <DimBadge label="L" value={detected.widthCm} />
            <DimBadge label="H" value={detected.heightCm} />
            <DimBadge label="P" value={detected.depthCm} />
          </View>
          <View style={styles.resultBtns}>
            <Pressable style={styles.retryBtn} onPress={() => { setDetected(null); startScan(); }}>
              <Text style={styles.retryBtnText}>Réessayer</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={() => onCapture(detected)}>
              <Ionicons name="checkmark" size={18} color={Colors.surface} />
              <Text style={styles.confirmBtnText}>Utiliser</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Pressable style={[styles.scanBtn, scanning && styles.scanBtnActive]} onPress={scanning ? stopScan : startScan}>
            <Ionicons name={scanning ? 'stop-circle-outline' : 'scan-outline'} size={22}
              color={scanning ? Colors.status.error : Colors.surface} />
            <Text style={[styles.scanBtnText, scanning && { color: Colors.status.error }]}>
              {scanning ? 'Arrêter' : 'Scanner le carton'}
            </Text>
          </Pressable>
          <Pressable onPress={onSwitchManual} style={styles.manualLink}>
            <Text style={styles.manualLinkText}>Saisir manuellement</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function ManualView({ onCapture, onSwitchLidar, lidarAvailable }: {
  onCapture: (d: Dimensions) => void;
  onSwitchLidar: () => void;
  lidarAvailable: boolean;
}) {
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [d, setD] = useState('');

  const valid = !!parseFloat(w) && !!parseFloat(h) && !!parseFloat(d);

  return (
    <View style={styles.body}>
      {lidarAvailable && (
        <View style={styles.banner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.status.info} />
          <Text style={styles.bannerText}>
            Saisie manuelle.{' '}
            <Text onPress={onSwitchLidar} style={styles.bannerLink}>Utiliser le LiDAR</Text>
          </Text>
        </View>
      )}

      {(['Largeur', 'Hauteur', 'Profondeur'] as const).map((label, i) => {
        const val = [w, h, d][i];
        const setter = [setW, setH, setD][i];
        return (
          <View key={label} style={styles.inputRow}>
            <Text style={styles.inputLabel}>{label} (cm)</Text>
            <TextInput
              style={styles.input}
              value={val}
              onChangeText={setter}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor={Colors.grey[400]}
            />
          </View>
        );
      })}

      <Pressable
        style={[styles.confirmBtn, !valid && { opacity: 0.4 }]}
        onPress={() => valid && onCapture({ widthCm: parseFloat(w), heightCm: parseFloat(h), depthCm: parseFloat(d) })}
        disabled={!valid}
      >
        <Ionicons name="checkmark" size={18} color={Colors.surface} />
        <Text style={styles.confirmBtnText}>Enregistrer les dimensions</Text>
      </Pressable>
    </View>
  );
}

export default function DimensionScanner({ onCapture, onClose }: DimensionScannerProps) {
  const lidarAvailable = !!VisionCamera && Platform.OS === 'ios';
  const [mode, setMode] = useState<'lidar' | 'manual'>(lidarAvailable ? 'lidar' : 'manual');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.text.secondary} />
        </Pressable>
        <Text style={styles.title}>Dimensions du carton</Text>
        <View style={{ width: 34 }} />
      </View>

      {mode === 'lidar' && lidarAvailable
        ? <LiDARView onCapture={onCapture} onSwitchManual={() => setMode('manual')} />
        : <ManualView onCapture={onCapture} onSwitchLidar={() => setMode('lidar')} lidarAvailable={lidarAvailable} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.grey[100], alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  body: { flex: 1, padding: 16 },

  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.status.warningLight, borderRadius: 12,
    padding: 12, marginBottom: 20,
  },
  bannerText: { flex: 1, fontSize: 14, color: Colors.text.secondary, lineHeight: 20 },
  bannerLink: { color: Colors.primary, fontWeight: '600', textDecorationLine: 'underline' },

  cameraWrap: {
    height: 260, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#000', marginBottom: 16, position: 'relative',
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  corner: {
    position: 'absolute', top: 20, left: 20, width: 28, height: 28,
    borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.surface, borderRadius: 2,
  },
  cornerTR: { left: undefined, right: 20, borderLeftWidth: 0, borderRightWidth: 3 },
  cornerBL: { top: undefined, bottom: 20, borderTopWidth: 0, borderBottomWidth: 3 },
  cornerBR: { top: undefined, bottom: 20, left: undefined, right: 20, borderTopWidth: 0, borderLeftWidth: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanningBadge: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  scanningText: { fontSize: 13, color: Colors.surface, fontWeight: '600' },

  resultCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.borderLight, padding: 16, marginBottom: 16,
  },
  resultTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, textAlign: 'center' },
  dimRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  dimBadge: {
    alignItems: 'center', backgroundColor: Colors.navy.ghost,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, minWidth: 70,
  },
  dimLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimValue: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  dimUnit: { fontSize: 11, color: Colors.text.muted },

  resultBtns: { flexDirection: 'row', gap: 10 },
  retryBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  retryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text.secondary },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: Colors.surface },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, marginBottom: 12,
  },
  scanBtnActive: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.status.error },
  scanBtnText: { fontSize: 16, fontWeight: '700', color: Colors.surface },
  manualLink: { alignItems: 'center', paddingVertical: 8 },
  manualLinkText: { fontSize: 14, color: Colors.text.muted, textDecorationLine: 'underline' },

  inputRow: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 18, fontWeight: '600', color: Colors.text.primary,
  },
});

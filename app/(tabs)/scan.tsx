import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import TMBButton from '@/components/ui/TMBButton';
import TMBInput from '@/components/ui/TMBInput';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    // Navigate to container detail based on scanned QR
    Alert.alert('Code scann\u00e9', data, [
      {
        text: 'Voir le conteneur',
        onPress: () => {
          router.push(`/container/${data}`);
          setScanned(false);
        },
      },
      {
        text: 'Scanner \u00e0 nouveau',
        style: 'cancel',
        onPress: () => setScanned(false),
      },
    ]);
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) return;
    router.push(`/container/${manualCode.trim()}`);
    setManualCode('');
    setShowManual(false);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={Colors.grey[300]} />
        <Text style={styles.permissionTitle}>Acc\u00e8s cam\u00e9ra requis</Text>
        <Text style={styles.permissionText}>
          Autorisez l\u2019acc\u00e8s \u00e0 la cam\u00e9ra pour scanner les QR codes.
        </Text>
        <TMBButton
          title="Autoriser la cam\u00e9ra"
          onPress={requestPermission}
          icon="camera-outline"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  if (showManual) {
    return (
      <View style={styles.manualContainer}>
        <View style={styles.manualHeader}>
          <TouchableOpacity onPress={() => setShowManual(false)}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.manualTitle}>Saisie manuelle</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.manualForm}>
          <TMBInput
            label="Code QR"
            placeholder="Entrez le code du conteneur..."
            icon="qr-code-outline"
            value={manualCode}
            onChangeText={setManualCode}
            autoFocus
          />
          <TMBButton
            title="Rechercher"
            onPress={handleManualEntry}
            icon="search-outline"
            disabled={!manualCode.trim()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top */}
        <View style={styles.overlayDark} />

        {/* Middle row with scan frame */}
        <View style={styles.middleRow}>
          <View style={styles.overlayDark} />
          <View style={styles.scanFrame}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlayDark} />
        </View>

        {/* Bottom */}
        <View style={[styles.overlayDark, styles.bottomOverlay]}>
          <Text style={styles.scanHint}>
            Placez le QR code dans le cadre
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons
                name={flashOn ? 'flash' : 'flash-outline'}
                size={24}
                color={Colors.text.inverse}
              />
              <Text style={styles.controlLabel}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setShowManual(true)}
            >
              <Ionicons name="keypad-outline" size={24} color={Colors.text.inverse} />
              <Text style={styles.controlLabel}>Manuel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.text.inverse,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  bottomOverlay: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
  scanHint: {
    fontSize: 15,
    color: Colors.text.inverse,
    fontWeight: '600',
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    gap: 50,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 6,
  },
  controlLabel: {
    fontSize: 12,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  manualContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  manualForm: {
    padding: 20,
  },
});

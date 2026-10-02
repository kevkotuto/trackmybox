import React, { useState, useRef } from 'react';
import {
  Text, StyleSheet, Pressable, ScrollView,
  Alert, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '@/constants/colors';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import * as Device from 'expo-device';

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<'join' | 'reconnect'>('reconnect');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const deviceName = Device.deviceName || 'Mon appareil';

  const handleSubmit = async (codeOverride?: string) => {
    const finalCode = (codeOverride ?? code).trim().toUpperCase();
    if (finalCode.length !== 6) { Alert.alert('Erreur', 'Saisissez le code à 6 caractères.'); return; }
    if (pin.length < 4) { Alert.alert('Erreur', 'Saisissez un PIN de 4 à 6 chiffres.'); return; }
    setLoading(true);
    try {
      if (mode === 'reconnect') {
        const result = await authApi.loginDevice(finalCode, pin);
        setAuth(result.token, result.householdId, result.code, deviceName);
      } else {
        const result = await authApi.joinHousehold(finalCode, deviceName, pin);
        setAuth(result.token, result.householdId, finalCode, deviceName);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Code invalide ou erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission requise', "Autorisez l'accès à la caméra pour scanner le QR code.");
        return;
      }
    }
    scannedRef.current = false;
    setScanning(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanning(false);

    const match = data.match(/^tmb-household:([A-Z0-9]{6})$/);
    if (match) {
      setCode(match[1]);
    } else if (/^[A-Z0-9]{6}$/.test(data.trim().toUpperCase())) {
      setCode(data.trim().toUpperCase());
    } else {
      Alert.alert('QR invalide', "Ce QR code n'est pas un code de foyer TrackMyBox.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>Rejoindre un foyer</Text>

        {/* Mode toggle */}
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, mode === 'reconnect' && styles.toggleBtnActive]}
            onPress={() => setMode('reconnect')}
          >
            <Ionicons
              name="refresh-circle-outline"
              size={16}
              color={mode === 'reconnect' ? Colors.surface : Colors.text.secondary}
            />
            <Text style={[styles.toggleBtnText, mode === 'reconnect' && styles.toggleBtnTextActive]}>
              Se reconnecter
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mode === 'join' && styles.toggleBtnActive]}
            onPress={() => setMode('join')}
          >
            <Ionicons
              name="person-add-outline"
              size={16}
              color={mode === 'join' ? Colors.surface : Colors.text.secondary}
            />
            <Text style={[styles.toggleBtnText, mode === 'join' && styles.toggleBtnTextActive]}>
              Nouvel appareil
            </Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          {mode === 'reconnect'
            ? 'Saisissez le code de votre foyer et votre PIN existant.'
            : 'Scannez le QR code d\'un foyer ou saisissez le code à 6 caractères, puis créez un PIN pour cet appareil.'}
        </Text>

        {/* QR scanner (join mode only) */}
        {mode === 'join' && (
          scanning ? (
            <View style={styles.scannerWrap}>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarCodeScanned}
              />
              <View style={styles.overlay} pointerEvents="none">
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
              </View>
              <Pressable style={styles.cancelScan} onPress={() => setScanning(false)}>
                <Ionicons name="close" size={20} color={Colors.surface} />
                <Text style={styles.cancelScanText}>Annuler</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.scanBtn} onPress={handleScanPress}>
              <Ionicons name="qr-code-outline" size={24} color={Colors.primary} />
              <Text style={styles.scanBtnText}>Scanner le QR code du foyer</Text>
            </Pressable>
          )
        )}

        {mode === 'join' && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <Text style={styles.label}>Code du foyer</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
          placeholder="AB3Z9K"
          placeholderTextColor={Colors.grey[400]}
          autoCapitalize="characters"
          maxLength={6}
        />

        <Text style={styles.label}>
          {mode === 'reconnect' ? 'Votre PIN existant' : 'Créer votre PIN (4–6 chiffres)'}
        </Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••"
          placeholderTextColor={Colors.grey[400]}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
          onPress={() => handleSubmit()}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.surface} />
            : <>
                <Ionicons
                  name={mode === 'reconnect' ? 'refresh-circle-outline' : 'enter-outline'}
                  size={20}
                  color={Colors.surface}
                />
                <Text style={styles.btnText}>
                  {mode === 'reconnect' ? 'Se reconnecter' : 'Rejoindre'}
                </Text>
              </>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, marginBottom: 16 },
  subtitle: { fontSize: 15, color: Colors.text.secondary, marginBottom: 24, lineHeight: 22 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  toggleBtnTextActive: {
    color: Colors.surface,
  },

  // QR scanner
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.navy.ghost, borderRadius: 16, paddingVertical: 18,
    borderWidth: 1.5, borderColor: Colors.primary, marginBottom: 8,
  },
  scanBtnText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  scannerWrap: {
    height: 260, borderRadius: 20, overflow: 'hidden',
    position: 'relative', marginBottom: 8,
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute', top: 24, left: 24,
    width: 28, height: 28,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderColor: Colors.surface, borderRadius: 2,
  },
  cTR: { left: undefined, right: 24, borderLeftWidth: 0, borderRightWidth: 3 },
  cBL: { top: undefined, bottom: 24, borderTopWidth: 0, borderBottomWidth: 3 },
  cBR: { top: undefined, bottom: 24, left: undefined, right: 24, borderTopWidth: 0, borderLeftWidth: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  cancelScan: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  cancelScanText: { fontSize: 14, fontWeight: '600', color: Colors.surface },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontSize: 13, color: Colors.text.muted, fontWeight: '500' },

  // Form
  label: {
    fontSize: 13, fontWeight: '600', color: Colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: Colors.text.primary, marginBottom: 16,
  },
  codeInput: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 8 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, marginTop: 8,
  },
  btnText: { fontSize: 17, fontWeight: '700', color: Colors.surface },
});

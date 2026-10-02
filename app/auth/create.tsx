import React, { useState } from 'react';
import {
  Text, StyleSheet, Pressable, ScrollView,
  Alert, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import * as Device from 'expo-device';

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [householdName, setHouseholdName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const deviceName = Device.deviceName || 'Mon appareil';

  const handleCreate = async () => {
    if (!householdName.trim()) { Alert.alert('Erreur', 'Saisissez un nom de foyer.'); return; }
    if (pin.length < 4) { Alert.alert('Erreur', 'Le PIN doit avoir au moins 4 chiffres.'); return; }
    if (pin !== confirmPin) { Alert.alert('Erreur', 'Les PINs ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const result = await authApi.createHousehold(householdName.trim(), deviceName, pin);
      setAuth(result.token, result.householdId, result.code, deviceName);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de créer le foyer.');
    } finally {
      setLoading(false);
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
      <Text style={styles.title}>Créer un foyer</Text>
      <Text style={styles.subtitle}>Toutes vos données seront sauvegardées dans ce foyer.</Text>

      <Text style={styles.label}>Nom du foyer</Text>
      <TextInput
        style={styles.input}
        value={householdName}
        onChangeText={setHouseholdName}
        placeholder="Ex: Famille Dupont"
        placeholderTextColor={Colors.grey[400]}
        autoFocus
      />

      <Text style={styles.label}>PIN (4–6 chiffres)</Text>
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

      <Text style={styles.label}>Confirmer le PIN</Text>
      <TextInput
        style={styles.input}
        value={confirmPin}
        onChangeText={(t) => setConfirmPin(t.replace(/\D/g, '').slice(0, 6))}
        placeholder="••••"
        placeholderTextColor={Colors.grey[400]}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={Colors.surface} />
          : <>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.surface} />
              <Text style={styles.btnText}>Créer le foyer</Text>
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
  title: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.text.secondary, marginBottom: 32, lineHeight: 22 },
  label: {
    fontSize: 13, fontWeight: '600', color: Colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: Colors.text.primary, marginBottom: 16,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, marginTop: 8,
  },
  btnText: { fontSize: 17, fontWeight: '700', color: Colors.surface },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Share, Alert, ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-styled';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/services/api';

interface DeviceEntry {
  id: string;
  deviceName: string;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HouseholdScreen() {
  const router = useRouter();
  const { householdCode, deviceName, logout } = useAuthStore();
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    authApi.getDevices()
      .then(setDevices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = () => {
    if (!householdCode) return;
    Share.share({
      message: `Rejoins mon foyer TrackMyBox avec le code : ${householdCode}`,
      title: 'Code foyer TrackMyBox',
    });
  };

  const handleDeleteHousehold = () => {
    Alert.alert(
      'Supprimer le foyer',
      'Toutes les données (cartons, objets, photos, déménagements) seront définitivement supprimées. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer quand même',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Êtes-vous absolument sûr ? Il n\'y a aucun retour possible.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Oui, tout supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      await authApi.deleteHousehold();
                      logout();
                    } catch {
                      setDeleting(false);
                      Alert.alert('Erreur', 'Impossible de supprimer le foyer.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Quitter le foyer',
      'Vous serez déconnecté. Vos données resteront sur le serveur.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          // Just call logout — AuthGuard in _layout.tsx watches token and
          // redirects to /auth automatically. Double-navigating causes a conflict.
          onPress: logout,
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Mon foyer' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">

        {/* Code section */}
        <Text style={styles.sectionLabel}>Code d'invitation</Text>
        <View style={styles.codeCard}>
          {householdCode ? (
            <View style={styles.qrWrap}>
              <QRCode
                data={`tmb-household:${householdCode}`}
                size={160}
                color={Colors.text.primary}
                style={{ backgroundColor: Colors.surface }}
              />
            </View>
          ) : null}
          <Text style={styles.code}>{householdCode ?? '------'}</Text>
          <Text style={styles.codeHint}>Scannez ce QR code ou partagez le code pour inviter quelqu'un.</Text>
          <Pressable
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color={Colors.surface} />
            <Text style={styles.shareBtnText}>Partager le code</Text>
          </Pressable>
        </View>

        {/* Devices */}
        <Text style={styles.sectionLabel}>Appareils connectés</Text>
        <View style={styles.card}>
          {loading
            ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} />
            : devices.length === 0
              ? <Text style={styles.emptyText}>Aucun appareil trouvé.</Text>
              : devices.map((d, i) => (
                <View key={d.id} style={[styles.deviceRow, i < devices.length - 1 && styles.deviceBorder]}>
                  <View style={styles.deviceIcon}>
                    <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>
                      {d.deviceName}
                      {d.deviceName === deviceName ? ' (cet appareil)' : ''}
                    </Text>
                    <Text style={styles.deviceDate}>Rejoint le {formatDate(d.createdAt)}</Text>
                  </View>
                </View>
              ))
          }
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>Zone de danger</Text>
        <Pressable
          style={({ pressed }) => [styles.leaveBtn, pressed && { opacity: 0.7 }]}
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={18} color={Colors.status.error} />
          <Text style={styles.leaveBtnText}>Quitter ce foyer</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }, deleting && { opacity: 0.5 }]}
          onPress={handleDeleteHousehold}
          disabled={deleting}
        >
          {deleting
            ? <ActivityIndicator size="small" color={Colors.surface} />
            : <Ionicons name="trash-outline" size={18} color={Colors.surface} />
          }
          <Text style={styles.deleteBtnText}>
            {deleting ? 'Suppression...' : 'Supprimer mon foyer et ses données'}
          </Text>
        </Pressable>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4, marginLeft: 4,
  },
  codeCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 20,
    gap: 12,
  },
  qrWrap: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  code: {
    fontSize: 36, fontWeight: '800', color: Colors.text.primary,
    letterSpacing: 8, marginBottom: 8,
  },
  codeHint: {
    fontSize: 13, color: Colors.text.secondary, textAlign: 'center',
    lineHeight: 18, marginBottom: 16,
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: { fontSize: 15, fontWeight: '600', color: Colors.surface },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden', marginBottom: 20,
  },
  emptyText: { padding: 16, fontSize: 14, color: Colors.text.muted, textAlign: 'center' },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  deviceBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  deviceIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.navy.ghost, alignItems: 'center', justifyContent: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  deviceDate: { fontSize: 12, color: Colors.text.muted, marginTop: 2 },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.status.errorLight,
    paddingVertical: 14, borderRadius: 14, marginBottom: 10,
  },
  leaveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.status.error },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.status.error,
    paddingVertical: 14, borderRadius: 14,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: Colors.surface },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { MoveStats, Container, ContainerStatus } from '@/types';
import TMBCard from '@/components/ui/TMBCard';
import ContainerCard from '@/components/containers/ContainerCard';

// Mock data for demonstration
const mockStats: MoveStats = {
  total: 24,
  scanned: 18,
  missing: 6,
  percentage: 75,
};

const mockContainers: Container[] = [
  {
    id: '1',
    name: 'Cuisine - Assiettes',
    type: 'carton' as any,
    status: ContainerStatus.EMBALLE,
    priority: 'urgent' as any,
    isScannedOnArrival: false,
    qrCodeData: 'tmb-001',
    items: [{ id: '1', name: 'Assiettes', containerId: '1', createdAt: '' }],
    photos: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    name: 'Salon - Livres',
    type: 'carton' as any,
    status: ContainerStatus.CAMION,
    priority: 'semaine' as any,
    isScannedOnArrival: true,
    qrCodeData: 'tmb-002',
    items: [
      { id: '2', name: 'Livres', containerId: '2', createdAt: '' },
      { id: '3', name: 'Albums', containerId: '2', createdAt: '' },
    ],
    photos: [],
    createdAt: '',
    updatedAt: '',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const missingContainers = mockContainers.filter(c => !c.isScannedOnArrival);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Track My Box</Text>
        <Text style={styles.headerSubtitle}>Tableau de bord</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        <TMBCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>D\u00e9m\u00e9nagement en cours</Text>
          <View style={styles.statsRow}>
            <StatItem label="Total" value={mockStats.total} color={Colors.primary} />
            <StatItem label="Scann\u00e9s" value={mockStats.scanned} color={Colors.status.success} />
            <StatItem label="Manquants" value={mockStats.missing} color={Colors.status.error} />
          </View>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${mockStats.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{mockStats.percentage}%</Text>
          </View>
        </TMBCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <QuickAction
            icon="add-circle-outline"
            label="Nouveau Conteneur"
            onPress={() => router.push('/container/new')}
          />
          <QuickAction
            icon="scan-outline"
            label="Scanner"
            onPress={() => router.push('/(tabs)/scan')}
          />
          <QuickAction
            icon="print-outline"
            label="Imprimer"
            onPress={() => {}}
          />
        </View>

        {/* Recent Containers */}
        <Text style={styles.sectionTitle}>Conteneurs r\u00e9cents</Text>
        {mockContainers.map(container => (
          <ContainerCard key={container.id} container={container} />
        ))}

        {/* Missing Containers Alert */}
        {missingContainers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Non scann\u00e9s</Text>
            <TMBCard style={styles.missingCard}>
              <View style={styles.missingHeader}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={Colors.status.error}
                />
                <Text style={styles.missingTitle}>
                  {missingContainers.length} conteneur
                  {missingContainers.length > 1 ? 's' : ''} non scann\u00e9
                  {missingContainers.length > 1 ? 's' : ''}
                </Text>
              </View>
              {missingContainers.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.missingRow}
                  onPress={() => router.push(`/container/${c.id}`)}
                >
                  <Ionicons name="cube-outline" size={16} color={Colors.status.error} />
                  <Text style={styles.missingName}>{c.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.grey[400]} />
                </TouchableOpacity>
              ))}
            </TMBCard>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.grey[300],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.status.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navy.ghost,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  missingCard: {
    backgroundColor: Colors.status.errorLight,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  missingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.status.error,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  missingName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Move, MoveStatus } from '@/types';
import TMBCard from '@/components/ui/TMBCard';
import TMBBadge from '@/components/ui/TMBBadge';
import EmptyState from '@/components/ui/EmptyState';

const statusConfig: Record<MoveStatus, { label: string; bg: string; text: string }> = {
  [MoveStatus.PREPARATION]: {
    label: 'Pr\u00e9paration',
    bg: Colors.status.infoLight,
    text: Colors.status.info,
  },
  [MoveStatus.ACTIVE]: {
    label: 'En cours',
    bg: Colors.status.warningLight,
    text: Colors.status.warning,
  },
  [MoveStatus.COMPLETED]: {
    label: 'Termin\u00e9',
    bg: Colors.status.successLight,
    text: Colors.status.success,
  },
};

// Mock data
const mockMoves: Move[] = [
  {
    id: '1',
    name: 'D\u00e9m\u00e9nagement Paris \u2192 Lyon',
    description: 'Appartement 3 pi\u00e8ces',
    status: MoveStatus.ACTIVE,
    fromAddress: '12 rue de Paris, 75001',
    toAddress: '8 avenue de Lyon, 69001',
    moveDate: '2026-04-15',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-10',
  },
  {
    id: '2',
    name: 'Ancien d\u00e9m\u00e9nagement',
    status: MoveStatus.COMPLETED,
    createdAt: '2025-06-01',
    updatedAt: '2025-07-15',
  },
];

export default function MovesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Sort: active first, then preparation, then completed
  const sortedMoves = [...mockMoves].sort((a, b) => {
    const order: Record<MoveStatus, number> = {
      [MoveStatus.ACTIVE]: 0,
      [MoveStatus.PREPARATION]: 1,
      [MoveStatus.COMPLETED]: 2,
    };
    return order[a.status] - order[b.status];
  });

  const renderMove = ({ item }: { item: Move }) => {
    const config = statusConfig[item.status];
    const isActive = item.status === MoveStatus.ACTIVE;
    // Mock progress for demo
    const progress = item.status === MoveStatus.COMPLETED ? 100 : item.status === MoveStatus.ACTIVE ? 65 : 10;
    const containerCount = item.status === MoveStatus.ACTIVE ? 24 : 12;

    return (
      <TMBCard
        style={{...styles.moveCard, ...(isActive ? styles.activeCard : {})}}
      >
        <View style={styles.moveHeader}>
          <View style={styles.moveHeaderLeft}>
            <Ionicons
              name={isActive ? 'car' : 'car-outline'}
              size={20}
              color={isActive ? Colors.primary : Colors.text.secondary}
            />
            <Text style={styles.moveName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <TMBBadge label={config.label} color={config.bg} textColor={config.text} />
        </View>

        {item.moveDate && (
          <View style={styles.moveDetail}>
            <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.moveDetailText}>{item.moveDate}</Text>
          </View>
        )}

        <View style={styles.moveDetail}>
          <Ionicons name="cube-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.moveDetailText}>{containerCount} conteneurs</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </TMBCard>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>D\u00e9m\u00e9nagements</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/move/new')}
        >
          <Ionicons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedMoves}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderMove}
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Aucun d\u00e9m\u00e9nagement"
            description="Cr\u00e9ez votre premier d\u00e9m\u00e9nagement pour commencer \u00e0 organiser vos conteneurs."
            actionTitle="Cr\u00e9er"
            onAction={() => router.push('/move/new')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  moveCard: {
    marginBottom: 12,
  },
  activeCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  moveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginRight: 8,
  },
  moveName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  moveDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  moveDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.grey[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.status.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
});

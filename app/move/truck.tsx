import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useContainerStore } from '@/stores/useContainerStore';
import TruckScene from '@/components/truck/TruckScene';
import { ContainerPriority } from '@/types';

const LEGEND = [
  { label: 'Urgent', color: Colors.status.error },
  { label: 'Semaine', color: Colors.status.warning },
  { label: 'Pas pressé', color: Colors.status.success },
];

export default function TruckViewScreen() {
  const { moveId } = useLocalSearchParams<{ moveId: string }>();
  const { containers, fetchContainers, isLoading } = useContainerStore();

  useEffect(() => {
    if (moveId) fetchContainers({ moveId });
  }, [moveId]);

  const moveContainers = useMemo(
    () => containers.filter((c) => c.moveId === moveId),
    [containers, moveId]
  );

  // Sort: urgent first
  const sorted = useMemo(() => {
    const order: Record<ContainerPriority, number> = {
      [ContainerPriority.URGENT]: 0,
      [ContainerPriority.SEMAINE]: 1,
      [ContainerPriority.PAS_PRESSE]: 2,
    };
    return [...moveContainers].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [moveContainers]);

  return (
    <>
      <Stack.Screen options={{ title: 'Vue 3D du camion', headerLargeTitle: false }} />
      <View style={styles.screen}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : sorted.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucun carton dans ce déménagement.</Text>
          </View>
        ) : (
          <>
            <TruckScene containers={sorted} />
            {/* Legend */}
            <View style={styles.legend}>
              {LEGEND.map((l) => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendLabel}>{l.label}</Text>
                </View>
              ))}
              <Text style={styles.legendCount}>{sorted.length} carton{sorted.length !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.hint}>La vue tourne automatiquement. Les dimensions réelles améliorent la précision.</Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: Colors.text.secondary },
  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  legendCount: { marginLeft: 'auto', fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  hint: {
    fontSize: 11, color: Colors.text.muted, textAlign: 'center',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.surface,
  },
});

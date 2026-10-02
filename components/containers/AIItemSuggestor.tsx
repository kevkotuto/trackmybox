import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { DetectedObject } from '@/hooks/useObjectDetection';

interface AIItemSuggestorProps {
  detections: DetectedObject[];
  isLoading: boolean;
  onSelect: (label: string) => void;
  onDismiss: () => void;
}

export default function AIItemSuggestor({
  detections,
  isLoading,
  onSelect,
  onDismiss,
}: AIItemSuggestorProps) {
  if (!isLoading && detections.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={16} color={Colors.status.info} />
        <Text style={styles.title}>Objets détectés</Text>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color={Colors.text.muted} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.status.info} />
          <Text style={styles.loadingText}>Analyse en cours…</Text>
        </View>
      ) : (
        <View style={styles.chips}>
          {detections.map((d) => (
            <Pressable
              key={d.label}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
              onPress={() => onSelect(d.label)}
            >
              <Text style={styles.chipText}>{d.label}</Text>
              <Text style={styles.chipConf}>{d.confidence}%</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.status.infoLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${Colors.status.info}33`,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.status.info,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${Colors.status.info}44`,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chipConf: {
    fontSize: 11,
    color: Colors.text.muted,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import TMBButton from './TMBButton';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={56} color={Colors.grey[300]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <TMBButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    minWidth: 180,
  },
});

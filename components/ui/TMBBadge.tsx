import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TMBBadgeProps {
  label: string;
  color: string;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function TMBBadge({ label, color, textColor, icon }: TMBBadgeProps) {
  const resolvedTextColor = textColor || '#333';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      {icon && (
        <Ionicons
          name={icon}
          size={12}
          color={resolvedTextColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: resolvedTextColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

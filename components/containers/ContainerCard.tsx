import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Container, ContainerType, ContainerStatus, ContainerPriority } from '@/types';
import TMBCard from '@/components/ui/TMBCard';
import TMBBadge from '@/components/ui/TMBBadge';

interface ContainerCardProps {
  container: Container;
  roomName?: string;
}

const typeIcons: Record<ContainerType, keyof typeof Ionicons.glyphMap> = {
  [ContainerType.CARTON]: 'cube-outline',
  [ContainerType.SAC]: 'bag-outline',
  [ContainerType.VALISE]: 'briefcase-outline',
  [ContainerType.BOITE]: 'archive-outline',
  [ContainerType.DOSSIER]: 'folder-outline',
  [ContainerType.SACHET]: 'pricetag-outline',
};

const statusLabels: Record<ContainerStatus, string> = {
  [ContainerStatus.EMBALLE]: 'Emball\u00e9',
  [ContainerStatus.CAMION]: 'Camion',
  [ContainerStatus.DEPOSE]: 'D\u00e9pos\u00e9',
  [ContainerStatus.DEBALLE]: 'D\u00e9ball\u00e9',
};

const priorityLabels: Record<ContainerPriority, string> = {
  [ContainerPriority.URGENT]: 'Urgent',
  [ContainerPriority.SEMAINE]: 'Semaine',
  [ContainerPriority.PAS_PRESSE]: 'Pas press\u00e9',
};

const priorityBorderColors: Record<ContainerPriority, string> = {
  [ContainerPriority.URGENT]: Colors.status.error,
  [ContainerPriority.SEMAINE]: Colors.status.warning,
  [ContainerPriority.PAS_PRESSE]: Colors.status.success,
};

export default function ContainerCard({ container, roomName }: ContainerCardProps) {
  const router = useRouter();

  const statusColor = Colors.containerStatus[container.status];
  const priorityColor = Colors.priority[container.priority];
  const borderLeftColor = priorityBorderColors[container.priority];

  return (
    <TMBCard
      onPress={() => router.push(`/container/${container.id}`)}
      style={{...styles.card, borderLeftColor, borderLeftWidth: 4}}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={typeIcons[container.type]}
            size={22}
            color={Colors.primary}
            style={styles.typeIcon}
          />
          <Text style={styles.name} numberOfLines={1}>
            {container.name}
          </Text>
        </View>
        {container.isScannedOnArrival && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
        )}
      </View>

      <View style={styles.badges}>
        <TMBBadge
          label={statusLabels[container.status]}
          color={statusColor.bg}
          textColor={statusColor.text}
        />
        <TMBBadge
          label={priorityLabels[container.priority]}
          color={priorityColor.bg}
          textColor={priorityColor.text}
        />
      </View>

      <View style={styles.footer}>
        {roomName && (
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.footerText}>{roomName}</Text>
          </View>
        )}
        <View style={styles.footerItem}>
          <Ionicons name="layers-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.footerText}>
            {container.items.length} objet{container.items.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TMBCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});

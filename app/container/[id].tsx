import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import {
  Container,
  ContainerType,
  ContainerStatus,
  ContainerPriority,
  Item,
} from '@/types';
import TMBCard from '@/components/ui/TMBCard';
import TMBBadge from '@/components/ui/TMBBadge';
import TMBButton from '@/components/ui/TMBButton';
import ItemRow from '@/components/containers/ItemRow';

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

const statusFlow: ContainerStatus[] = [
  ContainerStatus.EMBALLE,
  ContainerStatus.CAMION,
  ContainerStatus.DEPOSE,
  ContainerStatus.DEBALLE,
];

// Mock data
const mockContainer: Container = {
  id: '1',
  name: 'Cuisine - Assiettes',
  description: 'Assiettes et bols fragiles',
  type: ContainerType.CARTON,
  status: ContainerStatus.EMBALLE,
  priority: ContainerPriority.URGENT,
  roomId: '1',
  isScannedOnArrival: false,
  qrCodeData: 'tmb-abcd-1234-efgh',
  notes: 'Bien prot\u00e9ger avec du papier bulle',
  isThirdParty: false,
  items: [
    {
      id: '1',
      name: 'Assiettes plates',
      category: 'Vaisselle',
      isFragile: true,
      estimatedValue: 45,
      containerId: '1',
      createdAt: '',
    },
    {
      id: '2',
      name: 'Bols',
      category: 'Vaisselle',
      isFragile: true,
      estimatedValue: 25,
      containerId: '1',
      createdAt: '',
    },
    {
      id: '3',
      name: 'Verres \u00e0 vin',
      category: 'Vaisselle',
      isFragile: true,
      estimatedValue: 60,
      containerId: '1',
      createdAt: '',
    },
  ],
  photos: [],
  createdAt: '2026-03-10',
  updatedAt: '2026-03-15',
};

export default function ContainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [container, setContainer] = useState<Container>(mockContainer);

  const statusColor = Colors.containerStatus[container.status];
  const priorityColor = Colors.priority[container.priority];
  const currentStatusIndex = statusFlow.indexOf(container.status);

  const handleStatusChange = (newStatus: ContainerStatus) => {
    setContainer(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Supprimer', 'Supprimer cet objet ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          setContainer(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId),
          }));
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le conteneur',
      'Cette action est irr\u00e9versible. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={typeIcons[container.type]}
          size={32}
          color={Colors.primary}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{container.name}</Text>
          {container.description && (
            <Text style={styles.description}>{container.description}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Modifier', 'Fonctionnalit\u00e9 \u00e0 venir')}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status + Priority badges */}
      <View style={styles.badgeRow}>
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
        {container.isScannedOnArrival && (
          <TMBBadge
            label="Scann\u00e9"
            color={Colors.status.successLight}
            textColor={Colors.status.success}
            icon="checkmark-circle"
          />
        )}
      </View>

      {/* Status flow buttons */}
      <TMBCard style={styles.statusCard}>
        <Text style={styles.sectionLabel}>\u00c9tat du conteneur</Text>
        <View style={styles.statusFlow}>
          {statusFlow.map((status, index) => {
            const isCurrent = status === container.status;
            const isPast = index < currentStatusIndex;
            const isNext = index === currentStatusIndex + 1;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusBtn,
                  isCurrent && styles.statusBtnCurrent,
                  isPast && styles.statusBtnPast,
                ]}
                onPress={() => {
                  if (isNext || isPast) handleStatusChange(status);
                }}
                disabled={!isNext && !isPast && !isCurrent}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    (isCurrent || isPast) && styles.statusBtnTextActive,
                  ]}
                >
                  {statusLabels[status]}
                </Text>
                {isPast && (
                  <Ionicons name="checkmark" size={14} color={Colors.status.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TMBCard>

      {/* Room info */}
      {container.roomId && (
        <TMBCard style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionText}>Cuisine</Text>
          </View>
        </TMBCard>
      )}

      {/* Items section */}
      <TMBCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            Objets ({container.items.length})
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Ajouter', 'Ajouter un objet')}
          >
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {container.items.length === 0 ? (
          <Text style={styles.emptyText}>Aucun objet ajout\u00e9</Text>
        ) : (
          container.items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))
        )}
      </TMBCard>

      {/* Photos section */}
      <TMBCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            Photos ({container.photos.length})
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Photo', 'Ajouter une photo')}
          >
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {container.photos.length === 0 ? (
          <Text style={styles.emptyText}>Aucune photo</Text>
        ) : (
          <View style={styles.photoGrid}>
            {container.photos.map(photo => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={styles.photoThumb}
              />
            ))}
          </View>
        )}
      </TMBCard>

      {/* QR Code */}
      <TMBCard style={styles.section}>
        <Text style={styles.sectionLabel}>QR Code</Text>
        <View style={styles.qrContainer}>
          {/* Placeholder for QR code - in production use react-native-qrcode-svg */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.qrText}>{container.qrCodeData}</Text>
        </View>
        <TMBButton
          title="Imprimer l'\u00e9tiquette"
          onPress={() => Alert.alert('Impression', 'Envoi vers l\u2019imprimante...')}
          variant="secondary"
          icon="print-outline"
          size="sm"
          style={styles.printBtn}
        />
      </TMBCard>

      {/* Third party info */}
      {container.isThirdParty && (
        <TMBCard style={styles.section}>
          <Text style={styles.sectionLabel}>Tiers d\u00e9positaire</Text>
          <View style={styles.sectionRow}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionText}>
              {container.thirdPartyOwner || 'Non renseign\u00e9'}
            </Text>
          </View>
          {container.returnDate && (
            <View style={styles.sectionRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionText}>Retour : {container.returnDate}</Text>
            </View>
          )}
        </TMBCard>
      )}

      {/* Notes */}
      {container.notes && (
        <TMBCard style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <Text style={styles.notesText}>{container.notes}</Text>
        </TMBCard>
      )}

      {/* Danger zone */}
      <View style={styles.dangerZone}>
        <TMBButton
          title="Supprimer le conteneur"
          onPress={handleDelete}
          variant="danger"
          icon="trash-outline"
          size="md"
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statusCard: {
    marginBottom: 12,
  },
  statusFlow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statusBtnCurrent: {
    backgroundColor: Colors.navy.ghost,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  statusBtnPast: {
    backgroundColor: Colors.status.successLight,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  statusBtnTextActive: {
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grey[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: 'monospace',
  },
  printBtn: {
    marginTop: 10,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: 6,
  },
  dangerZone: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

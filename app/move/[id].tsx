import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Move, MoveStatus, VehicleType, Container } from '@/types';
import { useMoveStore } from '@/stores/useMoveStore';
import { useContainerStore } from '@/stores/useContainerStore';
import ContainerCard from '@/components/containers/ContainerCard';
import TMBBadge from '@/components/ui/TMBBadge';
import TMBButton from '@/components/ui/TMBButton';
import EmptyState from '@/components/ui/EmptyState';

const statusConfig: Record<MoveStatus, { label: string; bg: string; text: string }> = {
  [MoveStatus.PREPARATION]: { label: 'Préparation', bg: Colors.status.infoLight, text: Colors.status.info },
  [MoveStatus.ACTIVE]: { label: 'En cours', bg: Colors.status.warningLight, text: Colors.status.warning },
  [MoveStatus.COMPLETED]: { label: 'Terminé', bg: Colors.status.successLight, text: Colors.status.success },
};

const vehicleLabels: Record<VehicleType, string> = {
  [VehicleType.CAMIONNETTE]: 'Camionnette',
  [VehicleType.CAMION_20M3]: 'Camion 20m³',
  [VehicleType.CAMION_40M3]: 'Camion 40m³',
  [VehicleType.AUTRE]: 'Autre',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon as any} size={16} color={Colors.text.secondary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { moves, startMove, completeMove, deleteMove, updateMove } = useMoveStore();
  const { containers, fetchContainers, updateContainer, isLoading: containersLoading } = useContainerStore();

  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pickVisible, setPickVisible] = useState(false);
  const [pickSearch, setPickSearch] = useState('');
  const [linking, setLinking] = useState<string | null>(null);

  const move = moves.find((m) => m.id === id);
  const moveContainers = containers.filter((c) => c.moveId === id);

  useEffect(() => {
    fetchContainers({ moveId: id });
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContainers({ moveId: id });
    setRefreshing(false);
  };

  const handleStart = () => {
    if (!move) return;
    Alert.alert('Démarrer', `Démarrer le déménagement "${move.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Démarrer',
        onPress: async () => {
          try {
            await startMove(id);
          } catch {
            Alert.alert('Erreur', 'Impossible de démarrer.');
          }
        },
      },
    ]);
  };

  const handleComplete = () => {
    if (!move) return;
    Alert.alert('Terminer', `Marquer le déménagement comme terminé ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        style: 'destructive',
        onPress: async () => {
          try {
            await completeMove(id);
          } catch {
            Alert.alert('Erreur', 'Impossible de terminer.');
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce déménagement ? Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMove(id);
            router.back();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  const handleAddPress = () => {
    Alert.alert(
      'Ajouter un carton',
      'Créer un nouveau carton ou en choisir un existant ?',
      [
        {
          text: 'Nouveau carton',
          onPress: () => router.push(`/container/new?moveId=${id}` as any),
        },
        {
          text: 'Carton existant',
          onPress: async () => {
            setPickSearch('');
            setPickVisible(true);
            // Fetch ALL containers so the picker shows everything, not just this move's
            await fetchContainers();
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleUnlinkContainer = (containerId: string, containerName: string) => {
    Alert.alert(
      'Retirer du déménagement',
      `Retirer "${containerName}" de ce déménagement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateContainer(containerId, { moveId: null });
              fetchContainers({ moveId: id }).catch(() => {});
            } catch {
              Alert.alert('Erreur', 'Impossible de retirer ce carton.');
            }
          },
        },
      ]
    );
  };

  const handleLinkContainer = async (containerId: string) => {
    setLinking(containerId);
    try {
      await updateContainer(containerId, { moveId: id });
      setPickVisible(false);
      // Restore move-filtered view
      fetchContainers({ moveId: id }).catch(() => {});
    } catch {
      Alert.alert('Erreur', 'Impossible de lier ce carton.');
    } finally {
      setLinking(null);
    }
  };

  const openEdit = () => {
    if (!move) return;
    setEditName(move.name);
    setEditDesc(move.description ?? '');
    setEditFrom(move.fromAddress ?? '');
    setEditTo(move.toAddress ?? '');
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom est requis.');
      return;
    }
    setIsSaving(true);
    try {
      await updateMove(id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        fromAddress: editFrom.trim() || undefined,
        toAddress: editTo.trim() || undefined,
      });
      setEditVisible(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!move) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const config = statusConfig[move.status];
  const scannedCount = moveContainers.filter((c) => c.isScannedOnArrival).length;
  const total = moveContainers.length;
  const progress = total > 0 ? Math.round((scannedCount / total) * 100) : 0;

  const renderHeader = () => (
    <View>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <TMBBadge label={config.label} color={config.bg} textColor={config.text} />
          <View style={styles.heroActions}>
            <Pressable onPress={openEdit} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="pencil-outline" size={20} color={Colors.text.secondary} />
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.heroName}>{move.name}</Text>
        {move.description ? (
          <Text style={styles.heroDesc}>{move.description}</Text>
        ) : null}
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Progression</Text>
            <Text style={styles.progressText}>{scannedCount}/{total} cartons scannés</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoCard}>
          {move.moveDate && (
            <InfoRow icon="calendar-outline" label="Date prévue" value={formatDate(move.moveDate)} />
          )}
          {move.startedAt && (
            <InfoRow icon="play-circle-outline" label="Démarré le" value={formatDate(move.startedAt)} />
          )}
          {move.completedAt && (
            <InfoRow icon="checkmark-circle-outline" label="Terminé le" value={formatDate(move.completedAt)} />
          )}
          {move.fromAddress && (
            <InfoRow icon="location-outline" label="Départ" value={move.fromAddress} />
          )}
          {move.toAddress && (
            <InfoRow icon="navigate-outline" label="Arrivée" value={move.toAddress} />
          )}
          {move.vehicleType && (
            <InfoRow icon="car-outline" label="Véhicule" value={vehicleLabels[move.vehicleType]} />
          )}
          {move.estimatedTotalWeight && (
            <InfoRow icon="barbell-outline" label="Poids estimé" value={`${move.estimatedTotalWeight} kg`} />
          )}
          {move.contactPersons && move.contactPersons.length > 0 && (
            <InfoRow
              icon="people-outline"
              label="Contacts"
              value={move.contactPersons.map((c) => c.phone ? `${c.name} (${c.phone})` : c.name).join(', ')}
            />
          )}
        </View>
      </View>

      {/* Action buttons */}
      {move.status === MoveStatus.PREPARATION && (
        <View style={styles.actionRow}>
          <TMBButton
            title="Démarrer"
            onPress={handleStart}
            icon="play-circle-outline"
            style={{ flex: 1 }}
          />
        </View>
      )}
      {move.status === MoveStatus.ACTIVE && (
        <View style={styles.actionRow}>
          <TMBButton
            title="Vue 3D camion"
            onPress={() => router.push(`/move/truck?moveId=${id}` as any)}
            icon="cube-outline"
            variant="secondary"
            style={{ flex: 1 }}
          />
          <TMBButton
            title="Terminer"
            onPress={handleComplete}
            icon="checkmark-circle-outline"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Containers header */}
      <View style={styles.containersHeader}>
        <Text style={styles.sectionTitle}>Cartons ({total})</Text>
        <Pressable
          onPress={handleAddPress}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: move.name,
          headerLargeTitle: false,
        }}
      />

      <FlatList
        data={moveContainers}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cardWrapper}
            onLongPress={() => handleUnlinkContainer(item.id, item.name)}
            delayLongPress={500}
          >
            <ContainerCard container={item} />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun carton"
            description="Ajoutez des cartons à ce déménagement."
            actionTitle="Ajouter un carton"
            onAction={() => router.push(`/container/new?moveId=${id}` as any)}
          />
        }
      />

      {/* Pick existing container modal */}
      <Modal visible={pickVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickVisible(false)}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setPickVisible(false)}>
            <Text style={styles.modalCancel}>Annuler</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Carton existant</Text>
          <View style={{ width: 70 }} />
        </View>
        <View style={styles.pickSearchWrap}>
          <Ionicons name="search-outline" size={16} color={Colors.text.muted} />
          <TextInput
            style={styles.pickSearchInput}
            value={pickSearch}
            onChangeText={setPickSearch}
            placeholder="Rechercher..."
            placeholderTextColor={Colors.grey[400]}
            autoFocus
          />
        </View>
        {(() => {
          if (containersLoading) {
            return (
              <View style={styles.pickEmpty}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            );
          }
          const available = containers.filter(
            (c) => c.moveId !== id && c.name.toLowerCase().includes(pickSearch.toLowerCase())
          );
          if (available.length === 0) {
            return (
              <View style={styles.pickEmpty}>
                <Ionicons name="cube-outline" size={40} color={Colors.grey[300]} />
                <Text style={styles.pickEmptyText}>Aucun carton disponible</Text>
              </View>
            );
          }
          return (
            <FlatList
              data={available}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.6 }]}
                  onPress={() => handleLinkContainer(item.id)}
                  disabled={linking === item.id}
                >
                  <View style={styles.pickIcon}>
                    <Ionicons name="cube-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.pickInfo}>
                    <Text style={styles.pickName}>{item.name}</Text>
                    {item.location ? <Text style={styles.pickSub}>{item.location}</Text> : null}
                    {item.moveId ? <Text style={styles.pickSub}>Lié à un autre déménagement</Text> : null}
                  </View>
                  {linking === item.id
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Ionicons name="chevron-forward" size={16} color={Colors.grey[400]} />
                  }
                </Pressable>
              )}
            />
          );
        })()}
      </Modal>

      {/* Edit modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setEditVisible(false)}>
            <Text style={styles.modalCancel}>Annuler</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Modifier</Text>
          <Pressable onPress={handleSaveEdit} disabled={isSaving}>
            {isSaving
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={styles.modalSave}>Enregistrer</Text>
            }
          </Pressable>
        </View>
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Nom *</Text>
          <TextInput
            style={styles.fieldInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nom du déménagement"
            placeholderTextColor={Colors.grey[400]}
          />
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldTextarea]}
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="Description..."
            placeholderTextColor={Colors.grey[400]}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.fieldLabel}>Adresse de départ</Text>
          <TextInput
            style={styles.fieldInput}
            value={editFrom}
            onChangeText={setEditFrom}
            placeholder="Ex: 12 rue de Paris..."
            placeholderTextColor={Colors.grey[400]}
          />
          <Text style={styles.fieldLabel}>Adresse d'arrivée</Text>
          <TextInput
            style={styles.fieldInput}
            value={editTo}
            onChangeText={setEditTo}
            placeholder="Ex: 8 avenue de Lyon..."
            placeholderTextColor={Colors.grey[400]}
          />
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: 100,
    backgroundColor: Colors.background,
  },

  // Hero
  hero: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Progress
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.status.success,
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.status.success,
    textAlign: 'right',
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  infoIconWrap: {
    width: 28,
    alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: '500',
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  // Containers header
  containersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.navy.ghost,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
  },

  // Edit modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  fieldTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Pick container modal
  pickSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.grey[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  pickEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  pickEmptyText: {
    fontSize: 15,
    color: Colors.text.muted,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.navy.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickInfo: { flex: 1 },
  pickName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  pickSub: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
});

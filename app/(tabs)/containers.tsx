import React, { useState, useMemo } from 'react';
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
import { Container, ContainerStatus, ContainerType, ContainerPriority } from '@/types';
import TMBInput from '@/components/ui/TMBInput';
import TMBBadge from '@/components/ui/TMBBadge';
import ContainerCard from '@/components/containers/ContainerCard';
import EmptyState from '@/components/ui/EmptyState';

const statusFilters = [
  { key: 'all', label: 'Tous' },
  { key: ContainerStatus.EMBALLE, label: 'Emball\u00e9' },
  { key: ContainerStatus.CAMION, label: 'Camion' },
  { key: ContainerStatus.DEPOSE, label: 'D\u00e9pos\u00e9' },
  { key: ContainerStatus.DEBALLE, label: 'D\u00e9ball\u00e9' },
];

// Mock data
const mockContainers: Container[] = [
  {
    id: '1',
    name: 'Cuisine - Assiettes',
    type: ContainerType.CARTON,
    status: ContainerStatus.EMBALLE,
    priority: ContainerPriority.URGENT,
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
    type: ContainerType.CARTON,
    status: ContainerStatus.CAMION,
    priority: ContainerPriority.SEMAINE,
    isScannedOnArrival: true,
    qrCodeData: 'tmb-002',
    items: [
      { id: '2', name: 'Livres', containerId: '2', createdAt: '' },
      { id: '3', name: 'Albums photo', containerId: '2', createdAt: '' },
    ],
    photos: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    name: 'Chambre - V\u00eatements',
    type: ContainerType.VALISE,
    status: ContainerStatus.DEPOSE,
    priority: ContainerPriority.PAS_PRESSE,
    isScannedOnArrival: true,
    qrCodeData: 'tmb-003',
    items: [],
    photos: [],
    createdAt: '',
    updatedAt: '',
  },
];

export default function ContainersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = mockContainers;
    if (activeFilter !== 'all') {
      result = result.filter(c => c.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeFilter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Conteneurs</Text>
      </View>

      <View style={styles.searchRow}>
        <TMBInput
          placeholder="Rechercher..."
          icon="search-outline"
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={statusFilters}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => {
          const active = activeFilter === item.key;
          return (
            <TouchableOpacity
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ContainerCard container={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun conteneur"
            description="Ajoutez votre premier conteneur pour commencer."
            actionTitle="Ajouter"
            onAction={() => router.push('/container/new')}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 }]}
        onPress={() => router.push('/container/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  searchRow: {
    paddingHorizontal: 16,
  },
  searchInput: {
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.text.inverse,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

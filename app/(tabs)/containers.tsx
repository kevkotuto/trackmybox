import ContainerCard from "@/components/containers/ContainerCard";
import EmptyState from "@/components/ui/EmptyState";
import { Colors } from "@/constants/colors";
import { useContainerStore } from "@/stores/useContainerStore";
import { ContainerStatus } from "@/types";
import { Stack, useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const statusFilters = [
  { key: "all", label: "Tous" },
  { key: ContainerStatus.EMBALLE, label: "Emballé" },
  { key: ContainerStatus.CAMION, label: "Camion" },
  { key: ContainerStatus.DEPOSE, label: "Déposé" },
  { key: ContainerStatus.DEBALLE, label: "Déballé" },
];

export default function ContainersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { containers, fetchContainers } = useContainerStore();

  useEffect(() => {
    fetchContainers();
  }, []);

  const filtered = useMemo(() => {
    let result = containers;
    if (activeFilter !== "all") {
      result = result.filter((c) => c.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [containers, search, activeFilter]);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Cartons",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerSearchBarOptions: {
            placeholder: "Rechercher un carton...",
            onChangeText: (e) => setSearch(e.nativeEvent.text),
            hideWhenScrolling: false,
          },
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/container/new")}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.5 },
              ]}
            >
              <Icon
                name="plus"
                size={24}
                colors={[Colors.primary]}
                weight="medium"
              />
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            horizontal
            data={statusFilters}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
            renderItem={({ item }) => {
              const active = activeFilter === item.key;
              return (
                <Pressable
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveFilter(item.key)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        }
        renderItem={({ item }) => <ContainerCard container={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun carton"
            description="Aucun carton trouvé pour cette recherche ou ce filtre."
            actionTitle="Ajouter un carton"
            onAction={() => router.push("/container/new")}
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
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  filtersContainer: {
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.surface,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100, // To comfortably scroll above tabs and scan FAB
  },
});

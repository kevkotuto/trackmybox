import TMBButton from "@/components/ui/TMBButton";
import TMBInput from "@/components/ui/TMBInput";
import { Colors } from "@/constants/colors";
import { useRoomStore } from "@/stores/useRoomStore";
import { Room } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ROOM_ICONS: { icon: string; label: string }[] = [
  { icon: "restaurant-outline", label: "Cuisine" },
  { icon: "tv-outline", label: "Salon" },
  { icon: "bed-outline", label: "Chambre" },
  { icon: "water-outline", label: "Salle de bain" },
  { icon: "desktop-outline", label: "Bureau" },
  { icon: "car-outline", label: "Garage" },
  { icon: "basket-outline", label: "Buanderie" },
  { icon: "home-outline", label: "Entrée" },
  { icon: "grid-outline", label: "Autre" },
];

const DEFAULT_SEEDS = [
  { name: "Cuisine", icon: "restaurant-outline" },
  { name: "Salon", icon: "tv-outline" },
  { name: "Chambre principale", icon: "bed-outline" },
  { name: "Salle de bain", icon: "water-outline" },
  { name: "Bureau", icon: "desktop-outline" },
  { name: "Garage", icon: "car-outline" },
];

export default function RoomsScreen() {
  const { rooms, isLoading, fetchRooms, addRoom, updateRoom, deleteRoom } = useRoomStore();

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("home-outline");
  const [floor, setFloor] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAdd = () => {
    setEditingRoom(null);
    setName("");
    setSelectedIcon("home-outline");
    setFloor("");
    setShowForm(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setSelectedIcon(room.icon ?? "home-outline");
    setFloor(room.floor !== undefined ? String(room.floor) : "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom de la pièce est requis.");
      return;
    }
    const floorNum = floor.trim() ? parseInt(floor.trim(), 10) : undefined;
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, {
          name: name.trim(),
          icon: selectedIcon,
          floor: floorNum,
        });
      } else {
        await addRoom({
          name: name.trim(),
          icon: selectedIcon,
          floor: floorNum,
        });
      }
      closeForm();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder la pièce.");
    }
  };

  const handleDelete = (room: Room) => {
    Alert.alert(
      "Supprimer",
      `Supprimer la pièce "${room.name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteRoom(room.id),
        },
      ]
    );
  };

  const handleSeedDefaults = async () => {
    try {
      for (const seed of DEFAULT_SEEDS) {
        await addRoom(seed);
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter les pièces par défaut.");
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Mes pièces",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerRight: () => (
            <Pressable onPress={openAdd} style={styles.addBtn}>
              <Ionicons name="add" size={22} color={Colors.primary} />
            </Pressable>
          ),
        }}
      />

      {/* Form panel */}
      {showForm && (
        <View style={styles.formOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingRoom ? "Modifier la pièce" : "Nouvelle pièce"}
              </Text>
              <Pressable onPress={closeForm}>
                <Ionicons name="close" size={22} color={Colors.text.secondary} />
              </Pressable>
            </View>

            <TMBInput
              label="Nom"
              placeholder="Ex: Chambre enfants"
              icon="home-outline"
              value={name}
              onChangeText={setName}
            />

            <TMBInput
              label="Étage (optionnel)"
              placeholder="Ex: 1"
              icon="layers-outline"
              value={floor}
              onChangeText={setFloor}
              keyboardType="numeric"
            />

            <Text style={styles.iconLabel}>Icône</Text>
            <View style={styles.iconGrid}>
              {ROOM_ICONS.map((opt) => {
                const active = selectedIcon === opt.icon;
                return (
                  <Pressable
                    key={opt.icon}
                    style={[styles.iconItem, active && styles.iconItemActive]}
                    onPress={() => setSelectedIcon(opt.icon)}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={22}
                      color={active ? Colors.primary : Colors.grey[500]}
                    />
                    <Text style={[styles.iconText, active && styles.iconTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.formActions}>
              <TMBButton
                title="Annuler"
                onPress={closeForm}
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
              />
              <TMBButton
                title={editingRoom ? "Enregistrer" : "Ajouter"}
                onPress={handleSave}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
                loading={isLoading}
              />
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      )}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.list,
          rooms.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={48} color={Colors.grey[300]} />
            <Text style={styles.emptyTitle}>Aucune pièce</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez les pièces de votre logement pour organiser vos cartons.
            </Text>
            <TMBButton
              title="Ajouter les pièces types"
              onPress={handleSeedDefaults}
              variant="secondary"
              icon="sparkles-outline"
              size="sm"
              style={styles.seedBtn}
              loading={isLoading}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <View>
            {index > 0 && <View style={styles.divider} />}
            <Pressable
              style={({ pressed }) => [styles.roomRow, pressed && { opacity: 0.7 }]}
              onPress={() => openEdit(item)}
            >
              <View style={styles.roomIcon}>
                <Ionicons
                  name={(item.icon ?? "home-outline") as any}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{item.name}</Text>
                {item.floor !== undefined && (
                  <Text style={styles.roomMeta}>Étage {item.floor}</Text>
                )}
              </View>
              <View style={styles.roomActions}>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
                </Pressable>
                <Ionicons name="chevron-forward" size={16} color={Colors.grey[400]} />
              </View>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addBtn: {
    padding: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  // Form overlay
  formOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 100,
    justifyContent: "flex-end",
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  iconItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 4,
    minWidth: "21%",
  },
  iconItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.navy.ghost,
  },
  iconText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  iconTextActive: {
    color: Colors.primary,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },

  // Room list rows
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  roomIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.navy.ghost,
    alignItems: "center",
    justifyContent: "center",
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  roomMeta: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  roomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  seedBtn: {
    marginTop: 8,
  },
});

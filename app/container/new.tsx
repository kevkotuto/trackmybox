import TMBButton from "@/components/ui/TMBButton";
import TMBInput from "@/components/ui/TMBInput";
import { Colors } from "@/constants/colors";
import { useContainerStore } from "@/stores/useContainerStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { ContainerPriority, ContainerStatus, ContainerType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const typeOptions: {
  type: ContainerType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: ContainerType.CARTON, label: "Carton", icon: "cube-outline" },
  { type: ContainerType.SAC, label: "Sac", icon: "bag-outline" },
  { type: ContainerType.VALISE, label: "Valise", icon: "briefcase-outline" },
  { type: ContainerType.BOITE, label: "Boîte", icon: "archive-outline" },
  { type: ContainerType.DOSSIER, label: "Dossier", icon: "folder-outline" },
  { type: ContainerType.SACHET, label: "Sachet", icon: "pricetag-outline" },
];

const priorityOptions: {
  priority: ContainerPriority;
  label: string;
  color: string;
  textColor: string;
}[] = [
  {
    priority: ContainerPriority.URGENT,
    label: "Urgent",
    color: Colors.priority.urgent.bg,
    textColor: Colors.priority.urgent.text,
  },
  {
    priority: ContainerPriority.SEMAINE,
    label: "Semaine",
    color: Colors.priority.semaine.bg,
    textColor: Colors.priority.semaine.text,
  },
  {
    priority: ContainerPriority.PAS_PRESSE,
    label: "Pas pressé",
    color: Colors.priority.pas_presse.bg,
    textColor: Colors.priority.pas_presse.text,
  },
];

export default function NewContainerScreen() {
  const router = useRouter();
  const { addContainer } = useContainerStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<ContainerType>(
    ContainerType.CARTON,
  );
  const [selectedPriority, setSelectedPriority] = useState<ContainerPriority>(
    ContainerPriority.SEMAINE,
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [selectedDestRoom, setSelectedDestRoom] = useState<string | null>(null);
  const [showDestRoomPicker, setShowDestRoomPicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [isThirdParty, setIsThirdParty] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [returnDate, setReturnDate] = useState("");

  useEffect(() => { fetchRooms(); }, []);

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoom);
  const selectedDestRoomObj = rooms.find((r) => r.id === selectedDestRoom);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un nom pour le carton.");
      return;
    }

    try {
      await addContainer({
        name: name.trim(),
        type: selectedType,
        status: ContainerStatus.EMBALLE,
        priority: selectedPriority,
        roomId: selectedRoom ?? undefined,
        destinationRoomId: selectedDestRoom ?? undefined,
        notes: notes.trim() || undefined,
        isThirdParty,
        thirdPartyOwner:
          isThirdParty && ownerName ? ownerName.trim() : undefined,
        returnDate: isThirdParty && returnDate ? returnDate.trim() : undefined,
        isScannedOnArrival: false,
        qrCodeData: Math.random().toString(36).substring(7),
      });
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de créer le carton.");
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <TMBInput
        label="Nom du carton"
        placeholder="Ex: Cuisine - Assiettes"
        icon="text-outline"
        value={name}
        onChangeText={setName}
      />

      {/* Type selector */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeGrid}>
        {typeOptions.map((opt) => {
          const active = selectedType === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              style={[styles.typeItem, active && styles.typeItemActive]}
              onPress={() => setSelectedType(opt.type)}
            >
              <Ionicons
                name={opt.icon}
                size={24}
                color={active ? Colors.primary : Colors.grey[400]}
              />
              <Text
                style={[styles.typeLabel, active && styles.typeLabelActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Priority selector */}
      <Text style={styles.label}>Priorité</Text>
      <View style={styles.priorityRow}>
        {priorityOptions.map((opt) => {
          const active = selectedPriority === opt.priority;
          return (
            <TouchableOpacity
              key={opt.priority}
              style={[
                styles.priorityItem,
                { backgroundColor: active ? opt.color : Colors.grey[100] },
                active && { borderColor: opt.textColor, borderWidth: 1.5 },
              ]}
              onPress={() => setSelectedPriority(opt.priority)}
            >
              <Text
                style={[
                  styles.priorityLabel,
                  { color: active ? opt.textColor : Colors.text.secondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Source room picker */}
      <Text style={styles.label}>Pièce d'origine</Text>
      <TouchableOpacity
        style={styles.pickerBtn}
        onPress={() => { setShowRoomPicker(!showRoomPicker); setShowDestRoomPicker(false); }}
      >
        <Ionicons name="location-outline" size={18} color={Colors.grey[400]} />
        <Text style={[styles.pickerText, !selectedRoomObj && styles.pickerPlaceholder]}>
          {selectedRoomObj?.name || "Sélectionner une pièce"}
        </Text>
        <Ionicons
          name={showRoomPicker ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.grey[400]}
        />
      </TouchableOpacity>
      {showRoomPicker && (
        <View style={styles.pickerDropdown}>
          {rooms.length === 0 ? (
            <View style={styles.pickerEmpty}>
              <Text style={styles.pickerEmptyText}>
                Aucune pièce — ajoutez-en dans Réglages → Pièces
              </Text>
            </View>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[styles.pickerOption, selectedRoom === room.id && styles.pickerOptionActive]}
                onPress={() => { setSelectedRoom(room.id); setShowRoomPicker(false); }}
              >
                <Ionicons
                  name={(room.icon ?? "home-outline") as any}
                  size={16}
                  color={selectedRoom === room.id ? Colors.primary : Colors.grey[500]}
                />
                <Text style={[styles.pickerOptionText, selectedRoom === room.id && styles.pickerOptionTextActive]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Destination room picker */}
      <Text style={styles.label}>Pièce de destination</Text>
      <TouchableOpacity
        style={styles.pickerBtn}
        onPress={() => { setShowDestRoomPicker(!showDestRoomPicker); setShowRoomPicker(false); }}
      >
        <Ionicons name="navigate-outline" size={18} color={Colors.grey[400]} />
        <Text style={[styles.pickerText, !selectedDestRoomObj && styles.pickerPlaceholder]}>
          {selectedDestRoomObj?.name || "Où va ce carton ?"}
        </Text>
        <Ionicons
          name={showDestRoomPicker ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.grey[400]}
        />
      </TouchableOpacity>
      {showDestRoomPicker && (
        <View style={styles.pickerDropdown}>
          {rooms.length === 0 ? (
            <View style={styles.pickerEmpty}>
              <Text style={styles.pickerEmptyText}>
                Aucune pièce — ajoutez-en dans Réglages → Pièces
              </Text>
            </View>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[styles.pickerOption, selectedDestRoom === room.id && styles.pickerOptionActive]}
                onPress={() => { setSelectedDestRoom(room.id); setShowDestRoomPicker(false); }}
              >
                <Ionicons
                  name={(room.icon ?? "home-outline") as any}
                  size={16}
                  color={selectedDestRoom === room.id ? Colors.primary : Colors.grey[500]}
                />
                <Text style={[styles.pickerOptionText, selectedDestRoom === room.id && styles.pickerOptionTextActive]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Notes */}
      <TMBInput
        label="Notes"
        placeholder="Notes supplémentaires..."
        icon="document-text-outline"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.textarea}
      />

      {/* Third party */}
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Ionicons name="people-outline" size={20} color={Colors.primary} />
          <Text style={styles.switchLabel}>Je garde ça pour quelqu'un</Text>
        </View>
        <Switch
          value={isThirdParty}
          onValueChange={setIsThirdParty}
          trackColor={{ false: Colors.grey[300], true: Colors.primaryLight }}
          thumbColor={Colors.surface}
        />
      </View>

      {isThirdParty && (
        <View style={styles.thirdPartyFields}>
          <TMBInput
            label="Nom du propriétaire"
            placeholder="Nom..."
            icon="person-outline"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <TMBInput
            label="Date de retour"
            placeholder="JJ/MM/AAAA"
            icon="calendar-outline"
            value={returnDate}
            onChangeText={setReturnDate}
          />
        </View>
      )}

      {/* Create button */}
      <TMBButton
        title="Créer le carton"
        onPress={handleCreate}
        icon="checkmark-circle-outline"
        size="lg"
        style={styles.createBtn}
      />

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
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeItem: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  typeItemActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.navy.ghost,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  priorityItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 4,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  pickerPlaceholder: {
    color: Colors.text.muted,
  },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  pickerEmpty: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerEmptyText: {
    fontSize: 13,
    color: Colors.text.muted,
    fontStyle: "italic",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerOptionActive: {
    backgroundColor: Colors.navy.ghost,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  thirdPartyFields: {
    marginBottom: 4,
  },
  createBtn: {
    marginTop: 8,
  },
});

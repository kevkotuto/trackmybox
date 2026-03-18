import { Colors } from "@/constants/colors";
import {
    Container,
    ContainerPriority,
    ContainerStatus,
    ContainerType,
} from "@/types";
import { useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ContainerCardProps {
  container: Container;
  roomName?: string;
}

const typeIcons: Record<ContainerType, any> = {
  [ContainerType.CARTON]: "shippingbox.fill",
  [ContainerType.SAC]: "bag.fill",
  [ContainerType.VALISE]: "suitcase.fill",
  [ContainerType.BOITE]: "archivebox.fill",
  [ContainerType.DOSSIER]: "folder.fill",
  [ContainerType.SACHET]: "tag.fill",
};

const statusLabels: Record<ContainerStatus, string> = {
  [ContainerStatus.EMBALLE]: "Emballé",
  [ContainerStatus.CAMION]: "En camion",
  [ContainerStatus.DEPOSE]: "Déposé",
  [ContainerStatus.DEBALLE]: "Déballé",
};

const priorityAccent: Record<ContainerPriority, string> = {
  [ContainerPriority.URGENT]: Colors.status.error,
  [ContainerPriority.SEMAINE]: Colors.status.warning,
  [ContainerPriority.PAS_PRESSE]: Colors.status.success,
};

const statusTextColor: Record<ContainerStatus, string> = {
  [ContainerStatus.EMBALLE]: Colors.status.info,
  [ContainerStatus.CAMION]: Colors.status.warning,
  [ContainerStatus.DEPOSE]: Colors.status.success,
  [ContainerStatus.DEBALLE]: Colors.grey[500],
};

export default function ContainerCard({
  container,
  roomName,
}: ContainerCardProps) {
  const router = useRouter();
  const itemCount = (container.items ?? []).length;
  const photoCount = (container.photos ?? []).length;

  return (
    <Pressable
      onPress={() => router.push(`/container/${container.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View
        style={[
          styles.priorityBar,
          { backgroundColor: priorityAccent[container.priority] },
        ]}
      />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Icon
            name={typeIcons[container.type] || "shippingbox.fill"}
            size={18}
            colors={[Colors.text.primary]}
          />
          <Text style={styles.name} numberOfLines={1}>
            {container.name}
          </Text>
          {container.isScannedOnArrival && (
            <Icon
              name="checkmark.circle.fill"
              size={16}
              colors={[Colors.status.success]}
            />
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.meta}>
            {[
              roomName,
              `${itemCount} objet${itemCount !== 1 ? "s" : ""}`,
              photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? "s" : ""}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text
            style={[
              styles.status,
              { color: statusTextColor[container.status] },
            ]}
          >
            {statusLabels[container.status]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.75,
  },
  priorityBar: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
});

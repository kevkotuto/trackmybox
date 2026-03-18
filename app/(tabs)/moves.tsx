import EmptyState from "@/components/ui/EmptyState";
import TMBBadge from "@/components/ui/TMBBadge";
import { Colors } from "@/constants/colors";
import { useMoveStore } from "@/stores/useMoveStore";
import { Move, MoveStatus } from "@/types";
import { Stack, useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import React, { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const statusConfig: Record<
  MoveStatus,
  { label: string; bg: string; text: string }
> = {
  [MoveStatus.PREPARATION]: {
    label: "Préparation",
    bg: Colors.status.infoLight,
    text: Colors.status.info,
  },
  [MoveStatus.ACTIVE]: {
    label: "En cours",
    bg: Colors.status.warningLight,
    text: Colors.status.warning,
  },
  [MoveStatus.COMPLETED]: {
    label: "Terminé",
    bg: Colors.status.successLight,
    text: Colors.status.success,
  },
};

export default function MovesScreen() {
  const router = useRouter();
  const { moves, fetchMoves } = useMoveStore();

  useEffect(() => {
    fetchMoves();
  }, []);

  const sortedMoves = [...moves].sort((a, b) => {
    const order: Record<MoveStatus, number> = {
      [MoveStatus.ACTIVE]: 0,
      [MoveStatus.PREPARATION]: 1,
      [MoveStatus.COMPLETED]: 2,
    };
    return order[a.status] - order[b.status];
  });

  const renderMove = ({ item }: { item: Move }) => {
    const config = statusConfig[item.status];
    const isActive = item.status === MoveStatus.ACTIVE;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.moveCard,
          isActive && styles.activeCard,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.moveHeader}>
          <View style={styles.moveHeaderLeft}>
            <View
              style={[
                styles.iconContainer,
                isActive && { backgroundColor: Colors.primary },
              ]}
            >
              <Icon
                name="car.fill"
                size={20}
                colors={[isActive ? Colors.surface : Colors.primary]}
                weight="medium"
              />
            </View>
            <Text style={styles.moveName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <TMBBadge
            label={config.label}
            color={config.bg}
            textColor={config.text}
          />
        </View>

        {item.moveDate && (
          <View style={styles.moveDetail}>
            <Icon
              name="calendar"
              size={16}
              colors={[Colors.text.secondary]}
              weight="medium"
            />
            <Text style={styles.moveDetailText}>{item.moveDate}</Text>
          </View>
        )}

        {item.fromAddress && item.toAddress && (
          <View style={styles.moveDetail}>
            <Icon
              name="arrow.right.to.line"
              size={16}
              colors={[Colors.text.secondary]}
              weight="medium"
            />
            <Text style={styles.moveDetailText} numberOfLines={1}>
              {item.fromAddress} → {item.toAddress}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Déménagements",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/move/new")}
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
        data={sortedMoves}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderMove}
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Aucun déménagement"
            description="Créez votre premier déménagement pour commencer à organiser vos cartons."
            actionTitle="Créer"
            onAction={() => router.push("/move/new")}
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
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Above tabs and floating scanner button
  },
  moveCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
    borderColor: Colors.borderLight,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  moveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  moveHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy.ghost,
    alignItems: "center",
    justifyContent: "center",
  },
  moveName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    flex: 1,
  },
  moveDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  moveDetailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    fontWeight: "500",
  },
});

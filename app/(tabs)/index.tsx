import ContainerCard from "@/components/containers/ContainerCard";
import EmptyState from "@/components/ui/EmptyState";
import { Colors } from "@/constants/colors";
import { useContainerStore } from "@/stores/useContainerStore";
import { useMoveStore } from "@/stores/useMoveStore";
import { Stack, useRouter } from "expo-router";
import { SymbolView as Icon } from "expo-symbols";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const {
    containers,
    fetchContainers,
    isLoading: loadingContainers,
  } = useContainerStore();
  const { fetchMoves, currentMove } = useMoveStore();

  useEffect(() => {
    fetchContainers();
    fetchMoves();
  }, []);

  const move = currentMove();
  const total = containers.length;
  const scanned = containers.filter((c) => c.isScannedOnArrival).length;
  const missing = total - scanned;
  const pct = total > 0 ? Math.round((scanned / total) * 100) : 0;

  const recent = containers.slice(0, 5);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Track My Box",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
        }}
      />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentInner}
      >
        {move && (
          <View style={styles.activeMoveBanner}>
            <Text style={styles.activeMoveText}>
              📦 Déménagement :{" "}
              <Text style={{ fontWeight: "700" }}>{move.name}</Text>
            </Text>
          </View>
        )}

        {loadingContainers && total === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        ) : total === 0 ? (
          <EmptyState
            icon="cube-outline"
            title="Aucun carton pour l'instant"
            description="Ajoutez votre premier carton pour commencer à tout suivre."
            actionTitle="Ajouter un carton"
            onAction={() => router.push("/container/new")}
          />
        ) : (
          <>
            {/* Progression Premium iOS Style */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {scanned} sur {total} scannés
                </Text>
                <Text style={styles.progressPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              {missing > 0 && (
                <View style={styles.missingHintContainer}>
                  <Icon
                    name="exclamationmark.triangle.fill"
                    size={14}
                    colors={[Colors.status.error]}
                    weight="medium"
                  />
                  <Text style={styles.missingHint}>
                    {missing} carton{missing > 1 ? "s" : ""} manquant
                    {missing > 1 ? "s" : ""} à l'appel
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Actions rapides Premium */}
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push("/container/new")}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.navy.ghost },
              ]}
            >
              <Icon
                name="plus"
                size={20}
                colors={[Colors.primary]}
                weight="bold"
              />
            </View>
            <Text style={styles.actionText}>Nouveau carton</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push("/scanner")}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.navy.ghost },
              ]}
            >
              <Icon
                name="qrcode.viewfinder"
                size={20}
                colors={[Colors.primary]}
                weight="medium"
              />
            </View>
            <Text style={styles.actionText}>Scanner</Text>
          </Pressable>
        </View>

        {/* Cartons récents */}
        {recent.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Cartons récents</Text>
              <Pressable onPress={() => router.push("/(tabs)/containers")}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </Pressable>
            </View>
            <View style={styles.listContainer}>
              {recent.map((container) => (
                <ContainerCard key={container.id} container={container} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  activeMoveBanner: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeMoveText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  progressSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderCurve: "continuous",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  progressPct: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.status.success,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.grey[100],
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.status.success,
    borderRadius: 5,
  },
  missingHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.status.errorLight,
    padding: 8,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  missingHint: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.status.error,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  recentSection: {},
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sectionLink: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600",
  },
  listContainer: {
    gap: 12,
  },
});

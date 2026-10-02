import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useContainerStore } from '@/stores/useContainerStore';
import DimensionScanner, { Dimensions } from '@/components/containers/DimensionScanner';

/**
 * Full-screen LiDAR dimension scanner.
 * Navigated to from container/[id] with param ?containerId=<uuid>.
 * On capture: patches the container with widthCm/heightCm/depthCm then goes back.
 */
export default function LiDARScreen() {
  const { containerId } = useLocalSearchParams<{ containerId: string }>();
  const router = useRouter();
  const { updateContainer } = useContainerStore();

  const handleCapture = async (dims: Dimensions) => {
    if (!containerId) { router.back(); return; }
    try {
      await updateContainer(containerId, {
        widthCm: dims.widthCm,
        heightCm: dims.heightCm,
        depthCm: dims.depthCm,
      });
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les dimensions.');
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <DimensionScanner
        onCapture={handleCapture}
        onClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
});

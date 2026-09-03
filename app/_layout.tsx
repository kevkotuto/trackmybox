import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, PlatformColor } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useContainerStore } from "@/stores/useContainerStore";
import { useMoveStore } from "@/stores/useMoveStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePrinterStore } from "@/stores/usePrinterStore";
import PrinterToast from "@/components/ui/PrinterToast";

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { load, token, isHydrated } = useAuthStore();
  usePushNotifications();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const inAuthGroup = (segments[0] as string) === 'auth';
    if (!token && !inAuthGroup) {
      router.replace('/auth' as any);
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)' as any);
    } else if (token) {
      // Try to silently reconnect to last known printer
      usePrinterStore.getState().tryAutoReconnect();
    }
  }, [token, isHydrated]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const { fetchContainers } = useContainerStore.getState();
        const { fetchMoves } = useMoveStore.getState();
        fetchContainers().catch(() => {});
        fetchMoves().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerTransparent: true,
              headerShadowVisible: false,
              headerLargeTitleShadowVisible: false,
              headerLargeStyle: { backgroundColor: "transparent" },
              headerTitleStyle: { color: PlatformColor("label") as any },
              headerLargeTitle: true,
              headerBlurEffect: "none",
              headerBackButtonDisplayMode: "minimal",
              contentStyle: { backgroundColor: Colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="scanner"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="container/new"
              options={{
                title: "Nouveau carton",
                presentation: "modal",
                headerLargeTitle: false,
                headerTransparent: false,
              }}
            />
            <Stack.Screen
              name="container/[id]"
              options={{
                title: "Détail",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="move/new"
              options={{
                title: "Nouveau déménagement",
                presentation: "modal",
                headerLargeTitle: false,
                headerTransparent: false,
              }}
            />
            <Stack.Screen
              name="move/[id]"
              options={{
                title: "Déménagement",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="move/truck"
              options={{
                title: "Vue 3D",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="settings/household"
              options={{
                title: "Mon foyer",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false, presentation: "fullScreenModal" }}
            />
            <Stack.Screen
              name="container/lidar"
              options={{
                title: "Mesure LiDAR",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="rooms/index"
              options={{
                title: "Mes pièces",
                headerLargeTitle: true,
              }}
            />
            <Stack.Screen
              name="settings/qr"
              options={{
                title: "QR Code",
                headerLargeTitle: true,
              }}
            />
          </Stack>
          <AuthGuard />
          <PrinterToast />
          <StatusBar style="dark" />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import { Colors } from "@/constants/colors";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlatformColor } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
          <StatusBar style="dark" />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

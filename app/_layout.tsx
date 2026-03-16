import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { Colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="container/new"
          options={{
            title: 'Nouveau conteneur',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="container/[id]"
          options={{
            title: 'D\u00e9tail conteneur',
          }}
        />
        <Stack.Screen
          name="move/new"
          options={{
            title: 'Nouveau d\u00e9m\u00e9nagement',
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

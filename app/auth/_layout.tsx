import { Stack } from 'expo-router';

// Nested stack for all auth screens.
// The root _layout.tsx presents the entire "auth" group as a single
// fullScreenModal — this way iOS cannot swipe-dismiss into (tabs) after
// create/join, because (tabs) is never inside this modal stack.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: 'Créer un foyer',
          headerLargeTitle: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="join"
        options={{
          headerShown: true,
          title: 'Rejoindre un foyer',
          headerLargeTitle: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}

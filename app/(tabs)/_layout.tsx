import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey[400],
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 88,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="containers"
        options={{
          title: 'Conteneurs',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.scanButton,
                { backgroundColor: focused ? Colors.primary : Colors.grey[200] },
              ]}
            >
              <Ionicons
                name="scan-outline"
                size={26}
                color={focused ? Colors.text.inverse : Colors.primary}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="moves"
        options={{
          title: 'D\u00e9m\u00e9nagements',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'R\u00e9glages',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

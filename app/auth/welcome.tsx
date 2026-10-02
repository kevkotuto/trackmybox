import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>TrackMyBox</Text>
          <Text style={styles.subtitle}>
            Organisez votre déménagement, retrouvez chaque carton en un scan.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/auth/create' as any)}
          >
            <Ionicons name="home-outline" size={20} color={Colors.surface} />
            <Text style={styles.primaryBtnText}>Créer un foyer</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/auth/join' as any)}
          >
            <Ionicons name="enter-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Rejoindre un foyer</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Vos données sont sauvegardées en ligne — retrouvez-les sur n'importe quel appareil.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  hero: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 16 },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  actions: { gap: 12, marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.surface },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  hint: {
    fontSize: 13,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

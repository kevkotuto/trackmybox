import { Colors } from "@/constants/colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Icon sf="house.fill" />
          <Label>Accueil</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="containers">
          <Icon sf="shippingbox.fill" />
          <Label>Cartons</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="scan" hidden>
          <Icon sf="qrcode.viewfinder" />
          <Label>Scanner</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="moves">
          <Icon sf="car.fill" />
          <Label>Déménagement</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <Icon sf="gear" />
          <Label>Réglages</Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* Floating Scanner Button */}
      <Pressable
        style={({ pressed }) => [
          styles.floatingButton,
          pressed && styles.floatingButtonPressed,
        ]}
        onPress={() => router.push("/scanner")}
      >
        <IconSymbol name="qrcode.viewfinder" size={28} color={Colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: Platform.OS === "ios" ? 100 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  floatingButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

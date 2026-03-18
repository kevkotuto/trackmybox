import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface TMBButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
}

const sizeConfig: Record<
  ButtonSize,
  { paddingV: number; paddingH: number; fontSize: number; iconSize: number }
> = {
  sm: { paddingV: 8, paddingH: 14, fontSize: 13, iconSize: 16 },
  md: { paddingV: 12, paddingH: 20, fontSize: 15, iconSize: 18 },
  lg: { paddingV: 16, paddingH: 28, fontSize: 17, iconSize: 22 },
};

export default function TMBButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  size = "md",
  style,
}: TMBButtonProps) {
  const config = sizeConfig[size];
  const isDisabled = disabled || loading;
  const isSFSymbol = typeof icon === "string" && icon.includes(".");

  const containerStyle: ViewStyle = {
    paddingVertical: config.paddingV,
    paddingHorizontal: config.paddingH,
    opacity: isDisabled ? 0.5 : 1,
    ...variantStyles[variant].container,
  };

  const textStyle: TextStyle = {
    fontSize: config.fontSize,
    ...variantStyles[variant].text,
  };

  return (
    <TouchableOpacity
      style={[styles.base, containerStyle, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles[variant].text.color}
          style={styles.loader}
        />
      ) : icon ? (
        isSFSymbol ? (
          <SymbolView
            name={icon as any}
            size={config.iconSize}
            colors={[variantStyles[variant].text.color as string]}
            style={styles.icon}
          />
        ) : (
          <Ionicons
            name={icon}
            size={config.iconSize}
            color={variantStyles[variant].text.color as string}
            style={styles.icon}
          />
        )
      ) : null}
      <Text style={[styles.label, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle }
> = {
  primary: {
    container: {
      backgroundColor: Colors.primary,
    },
    text: {
      color: Colors.text.inverse,
    },
  },
  secondary: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: Colors.primary,
    },
    text: {
      color: Colors.primary,
    },
  },
  danger: {
    container: {
      backgroundColor: Colors.status.error,
    },
    text: {
      color: Colors.text.inverse,
    },
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  label: {
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },
  loader: {
    marginRight: 8,
  },
});

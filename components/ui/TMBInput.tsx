import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface TMBInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function TMBInput({
  label,
  icon,
  error,
  containerStyle,
  style,
  ...rest
}: TMBInputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={Colors.grey[400]}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.muted}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    color: Colors.status.error,
    marginTop: 4,
  },
});

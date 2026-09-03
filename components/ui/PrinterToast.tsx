import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrinterStore } from '@/stores/usePrinterStore';
import { Colors } from '@/constants/colors';

export default function PrinterToast() {
  const toast = usePrinterStore((s) => s.toast);
  const clearToast = usePrinterStore((s) => s.clearToast);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      return;
    }
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => clearToast());
  }, [toast]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.toast, { top: insets.top + 12, opacity }]}>
      <Text style={styles.text}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(20,20,20,0.88)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

import { useState } from 'react';

export interface DetectedObject {
  label: string;
  confidence: number;
}

/**
 * On-device object detection via ML Kit.
 * Falls back gracefully when the native module is unavailable (Expo Go, simulator).
 */
export function useObjectDetection() {
  const [isLoading, setIsLoading] = useState(false);

  const detect = async (imageUri: string): Promise<DetectedObject[]> => {
    setIsLoading(true);
    try {
      // Dynamic import keeps the module optional — won't crash if ML Kit native
      // module is not compiled in (e.g. Expo Go / simulator)
      const MLKit = await import('@react-native-ml-kit/object-detection').catch(() => null);
      if (!MLKit) return [];

      const result = await MLKit.default.detect(imageUri, {
        shouldEnableMultipleObjects: true,
        shouldEnableClassification: true,
        detectorMode: 'single-image',
      });

      return (result ?? [])
        .flatMap((obj: any) =>
          (obj.labels ?? []).map((l: any) => ({
            label: l.text ?? l.label ?? '',
            confidence: Math.round((l.confidence ?? 0) * 100),
          }))
        )
        .filter((o: DetectedObject) => o.label && o.confidence > 40)
        .slice(0, 5);
    } catch {
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { detect, isLoading };
}

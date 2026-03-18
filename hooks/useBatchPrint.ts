import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-styled';
import { getModuleProps, getEyeProps } from '../services/qrShapes';
import { useQRSettingsStore } from '../stores/useQRSettingsStore';
import { Container } from '../types';
import { LabelFormat } from '../services/labelFormats';
import { buildPrintHTML } from '../services/systemPrint';

interface BatchPrintOptions {
  format: LabelFormat;
  roomNames?: Map<string, string>;
}

export function useBatchPrint() {
  const qrRefs = useRef<Map<string, any>>(new Map());
  const [pendingContainers, setPendingContainers] = useState<Container[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

  /**
   * 1. Renders QR codes off-screen
   * 2. Captures each as base64 PNG via react-native-svg's toDataURL
   * 3. Builds HTML with exact mm label layout
   * 4. Opens native print dialog (handles all printer types + paper size)
   */
  const captureAndPrint = useCallback(
    async (containers: Container[], options: BatchPrintOptions) => {
      if (!containers.length) return;
      setIsPrinting(true);
      qrRefs.current.clear();
      setPendingContainers(containers);

      // Wait for React to render the hidden QR views
      await new Promise<void>(r => setTimeout(r, 600));

      // Capture QR codes as PNG data URLs
      const dataURLs = new Map<string, string>();
      await Promise.all(
        containers.map(
          c =>
            new Promise<void>(resolve => {
              const ref = qrRefs.current.get(c.id);
              if (ref && typeof ref.toDataURL === 'function') {
                ref.toDataURL((data: string) => {
                  dataURLs.set(c.id, `data:image/png;base64,${data}`);
                  resolve();
                });
              } else {
                resolve();
              }
            }),
        ),
      );

      const html = buildPrintHTML(containers, dataURLs, options.format, options.roomNames);

      // Remove hidden views before dialog
      setPendingContainers([]);
      setIsPrinting(false);

      // Native print dialog: chooses printer, paper size, orientation, etc.
      await Print.printAsync({ html });
    },
    [],
  );

  /**
   * Render this node anywhere in your component tree.
   * It is invisible and does not capture touch events.
   */
  const hiddenQRNode =
    pendingContainers.length > 0
      ? React.createElement(
          View,
          {
            style: {
              position: 'absolute' as const,
              top: -9999,
              left: -9999,
              opacity: 0,
            },
            pointerEvents: 'none' as const,
          } as any,
          ...pendingContainers.map(c => {
            const { fgColor: pFg, bgColor: pBg, moduleShape: pMod, eyeShape: pEye } = useQRSettingsStore.getState();
            return React.createElement(QRCode as any, {
              key: c.id,
              data: c.qrCodeData,
              size: 200,
              style: { backgroundColor: pBg },
              color: pFg,
              ...getModuleProps(pMod),
              outerEyesOptions: getEyeProps(pEye).outer,
              innerEyesOptions: getEyeProps(pEye).inner,
              ref: (ref: any) => {
                if (ref) qrRefs.current.set(c.id, ref);
              },
            });
          }),
        )
      : null;

  return { captureAndPrint, hiddenQRNode, isPrinting };
}

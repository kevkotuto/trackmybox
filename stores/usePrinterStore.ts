import { create } from 'zustand';
import { Platform } from 'react-native';
import { PrinterStatus, BLEDevice, StickerData } from '../types';

interface PrinterState {
  printerStatus: PrinterStatus;
  connectedDevice: BLEDevice | null;
  availableDevices: BLEDevice[];
  error: string | null;

  startScan: () => Promise<void>;
  connectToDevice: (device: BLEDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  printSticker: (data: StickerData) => Promise<void>;
  clearError: () => void;
}

let bleManager: any = null;

async function getBleManager() {
  if (bleManager) return bleManager;
  if (Platform.OS === 'web') return null;

  try {
    const { BleManager } = await import('react-native-ble-plx');
    bleManager = new BleManager();
    return bleManager;
  } catch {
    return null;
  }
}

export const usePrinterStore = create<PrinterState>((set, get) => ({
  printerStatus: 'disconnected',
  connectedDevice: null,
  availableDevices: [],
  error: null,

  startScan: async () => {
    const manager = await getBleManager();
    if (!manager) {
      set({ error: 'Bluetooth not available on this platform', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'scanning', availableDevices: [], error: null });

    try {
      const state = await manager.state();
      if (state !== 'PoweredOn') {
        set({ error: 'Please enable Bluetooth', printerStatus: 'error' });
        return;
      }

      const foundDevices: Map<string, BLEDevice> = new Map();

      manager.startDeviceScan(null, { allowDuplicates: false }, (error: any, device: any) => {
        if (error) {
          set({ error: error.message, printerStatus: 'error' });
          manager.stopDeviceScan();
          return;
        }

        if (device && device.name) {
          const bleDevice: BLEDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi ?? undefined,
          };
          foundDevices.set(device.id, bleDevice);
          set({ availableDevices: Array.from(foundDevices.values()) });
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
        const { printerStatus } = get();
        if (printerStatus === 'scanning') {
          set({ printerStatus: 'disconnected' });
        }
      }, 10000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      set({ error: message, printerStatus: 'error' });
    }
  },

  connectToDevice: async (device: BLEDevice) => {
    const manager = await getBleManager();
    if (!manager) {
      set({ error: 'Bluetooth not available', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'connecting', error: null });

    try {
      manager.stopDeviceScan();

      const connectedDevice = await manager.connectToDevice(device.id, {
        timeout: 10000,
      });
      await connectedDevice.discoverAllServicesAndCharacteristics();

      set({
        printerStatus: 'connected',
        connectedDevice: {
          id: connectedDevice.id,
          name: connectedDevice.name,
          rssi: connectedDevice.rssi ?? undefined,
        },
      });

      manager.onDeviceDisconnected(device.id, () => {
        set({
          printerStatus: 'disconnected',
          connectedDevice: null,
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      set({ error: message, printerStatus: 'error' });
    }
  },

  disconnect: async () => {
    const manager = await getBleManager();
    const { connectedDevice } = get();

    if (manager && connectedDevice) {
      try {
        const isConnected = await manager.isDeviceConnected(connectedDevice.id);
        if (isConnected) {
          await manager.cancelDeviceConnection(connectedDevice.id);
        }
      } catch {
        // Device may already be disconnected
      }
    }

    set({
      printerStatus: 'disconnected',
      connectedDevice: null,
    });
  },

  printSticker: async (data: StickerData) => {
    const manager = await getBleManager();
    const { connectedDevice } = get();

    if (!manager || !connectedDevice) {
      set({ error: 'No printer connected', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'printing', error: null });

    try {
      const isConnected = await manager.isDeviceConnected(connectedDevice.id);
      if (!isConnected) {
        set({ error: 'Printer disconnected', printerStatus: 'disconnected', connectedDevice: null });
        return;
      }

      const services = await manager.servicesForDevice(connectedDevice.id);
      let writeCharacteristic: any = null;

      for (const service of services) {
        const characteristics = await manager.characteristicsForDevice(connectedDevice.id, service.uuid);
        for (const char of characteristics) {
          if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            writeCharacteristic = char;
            break;
          }
        }
        if (writeCharacteristic) break;
      }

      if (!writeCharacteristic) {
        set({ error: 'No writable characteristic found on printer', printerStatus: 'error' });
        return;
      }

      const itemsList = data.items.length > 0
        ? data.items.map((item, i) => `  ${i + 1}. ${item}`).join('\n')
        : '  (vide)';

      const labelContent = [
        `=== ${data.containerName} (#${data.containerNumber}) ===`,
        `Type: ${data.type}`,
        `Priorite: ${data.priority}`,
        data.roomName ? `Piece: ${data.roomName}` : null,
        '',
        'Contenu:',
        itemsList,
        '',
        `QR: ${data.qrCodeData}`,
      ]
        .filter((line) => line !== null)
        .join('\n');

      const encoder = new TextEncoder();
      const encoded = encoder.encode(labelContent + '\n');
      const base64Content = btoa(String.fromCharCode(...encoded));

      await manager.writeCharacteristicWithResponseForDevice(
        connectedDevice.id,
        writeCharacteristic.serviceUUID,
        writeCharacteristic.uuid,
        base64Content
      );

      set({ printerStatus: 'connected' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Print failed';
      set({ error: message, printerStatus: 'error' });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

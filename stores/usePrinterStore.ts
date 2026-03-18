import { create } from 'zustand';
import { Platform } from 'react-native';
import { PrinterStatus, BLEDevice, StickerData } from '../types';

// ─── MX06 BLE UUIDs (reverse-engineered from iPrint/Fun Print apps) ───────────
const MX06_SERVICE = '0000AE30-0000-1000-8000-00805F9B34FB';
const MX06_WRITE   = '0000AE01-0000-1000-8000-00805F9B34FB';
// Some MX06 units use alternate UUIDs
const ALT_SERVICE  = '0000FF00-0000-1000-8000-00805F9B34FB';
const ALT_WRITE    = '0000FF02-0000-1000-8000-00805F9B34FB';

// Active UUIDs detected on connect (module-level, not in Zustand state)
let _serviceUUID = MX06_SERVICE;
let _writeUUID   = MX06_WRITE;

// ─── BleManager singleton ─────────────────────────────────────────────────────
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

// ─── MX06 Protocol helpers ────────────────────────────────────────────────────
function crc8(data: number[]): number {
  let crc = 0;
  for (const b of data) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

/** Build a MX06 binary command packet and return it as base64 */
function buildPacket(cmd: number, data: number[]): string {
  const len = data.length;
  const body = [cmd, 0x00, len & 0xff, (len >> 8) & 0xff, ...data];
  const bytes = new Uint8Array([0x51, 0x78, ...body, crc8(data), 0xff]);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

async function sendCmd(
  manager: any,
  deviceId: string,
  cmd: number,
  data: number[],
): Promise<void> {
  await manager.writeCharacteristicWithoutResponseForDevice(
    deviceId,
    _serviceUUID,
    _writeUUID,
    buildPacket(cmd, data),
  );
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── 5×7 bitmap font (column-based, bit 0 = top pixel) ───────────────────────
// Each character = 5 column bytes
const FONT5x7: Record<string, number[]> = {
  ' ':[0x00,0x00,0x00,0x00,0x00],
  '!':[0x00,0x00,0x5f,0x00,0x00],
  '#':[0x14,0x7f,0x14,0x7f,0x14],
  '-':[0x08,0x08,0x08,0x08,0x08],
  '.':[0x00,0x60,0x60,0x00,0x00],
  '/':[0x20,0x10,0x08,0x04,0x02],
  ':':[0x00,0x36,0x36,0x00,0x00],
  '(':[0x00,0x1c,0x22,0x41,0x00],
  ')':[0x00,0x41,0x22,0x1c,0x00],
  '0':[0x3e,0x51,0x49,0x45,0x3e],
  '1':[0x00,0x42,0x7f,0x40,0x00],
  '2':[0x42,0x61,0x51,0x49,0x46],
  '3':[0x21,0x41,0x45,0x4b,0x31],
  '4':[0x18,0x14,0x12,0x7f,0x10],
  '5':[0x27,0x45,0x45,0x45,0x39],
  '6':[0x3c,0x4a,0x49,0x49,0x30],
  '7':[0x01,0x71,0x09,0x05,0x03],
  '8':[0x36,0x49,0x49,0x49,0x36],
  '9':[0x06,0x49,0x49,0x29,0x1e],
  'A':[0x7e,0x11,0x11,0x11,0x7e],
  'B':[0x7f,0x49,0x49,0x49,0x36],
  'C':[0x3e,0x41,0x41,0x41,0x22],
  'D':[0x7f,0x41,0x41,0x22,0x1c],
  'E':[0x7f,0x49,0x49,0x49,0x41],
  'F':[0x7f,0x09,0x09,0x09,0x01],
  'G':[0x3e,0x41,0x49,0x49,0x7a],
  'H':[0x7f,0x08,0x08,0x08,0x7f],
  'I':[0x00,0x41,0x7f,0x41,0x00],
  'J':[0x20,0x40,0x41,0x3f,0x01],
  'K':[0x7f,0x08,0x14,0x22,0x41],
  'L':[0x7f,0x40,0x40,0x40,0x40],
  'M':[0x7f,0x02,0x0c,0x02,0x7f],
  'N':[0x7f,0x04,0x08,0x10,0x7f],
  'O':[0x3e,0x41,0x41,0x41,0x3e],
  'P':[0x7f,0x09,0x09,0x09,0x06],
  'Q':[0x3e,0x41,0x51,0x21,0x5e],
  'R':[0x7f,0x09,0x19,0x29,0x46],
  'S':[0x46,0x49,0x49,0x49,0x31],
  'T':[0x01,0x01,0x7f,0x01,0x01],
  'U':[0x3f,0x40,0x40,0x40,0x3f],
  'V':[0x1f,0x20,0x40,0x20,0x1f],
  'W':[0x3f,0x40,0x38,0x40,0x3f],
  'X':[0x63,0x14,0x08,0x14,0x63],
  'Y':[0x07,0x08,0x70,0x08,0x07],
  'Z':[0x61,0x51,0x49,0x45,0x43],
};

function getCharCols(ch: string): number[] {
  return FONT5x7[ch.toUpperCase()] ?? FONT5x7[' ']!;
}

/**
 * Render text lines to MX06 bitmap rows (48 bytes = 384px wide).
 * Characters are scaled 2× for readability.
 */
function renderLabel(lines: string[]): Uint8Array[] {
  const COLS     = 48;         // 384px / 8
  const SCALE    = 2;          // 2× pixel scaling
  const CHAR_W   = (5 + 1) * SCALE;  // 12px per char
  const CHAR_H   = 7 * SCALE;        // 14px per char
  const LINE_GAP = 4;
  const MARGIN   = 8;
  const MAX_CHARS = Math.floor((384 - MARGIN * 2) / CHAR_W);

  // Word-wrap lines
  const wrapped: string[] = [];
  for (const line of lines) {
    if (line.length <= MAX_CHARS) {
      wrapped.push(line);
    } else {
      // Hard-wrap
      for (let i = 0; i < line.length; i += MAX_CHARS) {
        wrapped.push(line.slice(i, i + MAX_CHARS));
      }
    }
  }

  const allRows: Uint8Array[] = [];
  const blank = () => new Uint8Array(COLS);

  // Top padding
  for (let i = 0; i < 12; i++) allRows.push(blank());

  for (const line of wrapped) {
    // pixel canvas for this line: CHAR_H rows × 384 cols
    const canvas: number[][] = Array.from({ length: CHAR_H }, () => new Array(384).fill(0));

    for (let ci = 0; ci < line.length; ci++) {
      const cols = getCharCols(line[ci]);
      const xBase = MARGIN + ci * CHAR_W;
      for (let col = 0; col < 5; col++) {
        const colBits = cols[col] ?? 0;
        for (let row = 0; row < 7; row++) {
          const bit = (colBits >> row) & 1;
          if (!bit) continue;
          // 2× scale
          for (let dy = 0; dy < SCALE; dy++) {
            for (let dx = 0; dx < SCALE; dx++) {
              const px = xBase + col * SCALE + dx;
              const py = row * SCALE + dy;
              if (px < 384 && py < CHAR_H) canvas[py][px] = 1;
            }
          }
        }
      }
    }

    // Convert canvas rows to 48-byte rows
    for (const pixelRow of canvas) {
      const byteRow = new Uint8Array(COLS);
      for (let b = 0; b < COLS; b++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          byte |= (pixelRow[b * 8 + bit] ?? 0) << (7 - bit);
        }
        byteRow[b] = byte;
      }
      allRows.push(byteRow);
    }

    // Gap between lines
    for (let i = 0; i < LINE_GAP; i++) allRows.push(blank());
  }

  // Bottom padding
  for (let i = 0; i < 12; i++) allRows.push(blank());

  return allRows;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
export type PrinterMode = 'ble' | 'system';

interface PrinterState {
  printerStatus: PrinterStatus;
  printerMode: PrinterMode;
  connectedDevice: BLEDevice | null;
  availableDevices: BLEDevice[];
  error: string | null;

  setMode: (mode: PrinterMode) => void;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: BLEDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  printSticker: (data: StickerData) => Promise<void>;
  clearError: () => void;
}

export const usePrinterStore = create<PrinterState>((set, get) => ({
  printerStatus: 'disconnected',
  printerMode: 'ble',
  connectedDevice: null,
  availableDevices: [],
  error: null,

  setMode: (mode) => set({ printerMode: mode }),

  startScan: async () => {
    const manager = await getBleManager();
    if (!manager) {
      set({ error: 'Bluetooth non disponible', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'scanning', availableDevices: [], error: null });

    try {
      const state = await manager.state();
      if (state !== 'PoweredOn') {
        set({ error: 'Activez le Bluetooth pour continuer', printerStatus: 'error' });
        return;
      }

      const found = new Map<string, BLEDevice>();

      manager.startDeviceScan(null, { allowDuplicates: false }, (error: any, device: any) => {
        if (error) {
          set({ error: error.message, printerStatus: 'error' });
          manager.stopDeviceScan();
          return;
        }
        if (!device?.name) return;

        const bleDevice: BLEDevice = {
          id: device.id,
          name: device.name,
          rssi: device.rssi ?? undefined,
        };
        found.set(device.id, bleDevice);
        set({ availableDevices: Array.from(found.values()) });
      });

      // Auto-stop after 15s
      setTimeout(() => {
        manager.stopDeviceScan();
        if (get().printerStatus === 'scanning') {
          set({ printerStatus: 'disconnected' });
        }
      }, 15000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan échoué';
      set({ error: message, printerStatus: 'error' });
    }
  },

  stopScan: async () => {
    const manager = await getBleManager();
    manager?.stopDeviceScan();
    if (get().printerStatus === 'scanning') {
      set({ printerStatus: 'disconnected' });
    }
  },

  connectToDevice: async (device: BLEDevice) => {
    const manager = await getBleManager();
    if (!manager) {
      set({ error: 'Bluetooth non disponible', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'connecting', error: null });

    try {
      manager.stopDeviceScan();

      const connected = await manager.connectToDevice(device.id, { timeout: 10000 });
      await connected.discoverAllServicesAndCharacteristics();

      // Detect which UUID set this unit uses
      const services = await connected.services();
      const uuids: string[] = services.map((s: any) => s.uuid.toUpperCase());
      if (uuids.some((u: string) => u.includes('AE30'))) {
        _serviceUUID = MX06_SERVICE;
        _writeUUID   = MX06_WRITE;
      } else if (uuids.some((u: string) => u.includes('FF00'))) {
        _serviceUUID = ALT_SERVICE;
        _writeUUID   = ALT_WRITE;
      }

      set({
        printerStatus: 'connected',
        connectedDevice: { id: connected.id, name: connected.name, rssi: connected.rssi ?? undefined },
      });

      // Listen for disconnection
      manager.onDeviceDisconnected(device.id, () => {
        set({ printerStatus: 'disconnected', connectedDevice: null });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion échouée';
      set({ error: message, printerStatus: 'error' });
    }
  },

  disconnect: async () => {
    const manager = await getBleManager();
    const { connectedDevice } = get();
    if (manager && connectedDevice) {
      try {
        const isConn = await manager.isDeviceConnected(connectedDevice.id);
        if (isConn) await manager.cancelDeviceConnection(connectedDevice.id);
      } catch {
        // already disconnected
      }
    }
    set({ printerStatus: 'disconnected', connectedDevice: null });
  },

  printSticker: async (data: StickerData) => {
    const manager = await getBleManager();
    const { connectedDevice } = get();

    if (!manager || !connectedDevice) {
      set({ error: 'Imprimante non connectée', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'printing', error: null });

    try {
      // Request larger MTU for faster transfer
      try { await manager.requestMTUForDevice(connectedDevice.id, 247); } catch {}

      // Set print energy (darkness)
      await sendCmd(manager, connectedDevice.id, 0xaf, [0x1f, 0x40]); // ~8000
      await sleep(50);

      // Build label content lines
      const typeLabel: Record<string, string> = {
        carton: 'CARTON', sac: 'SAC', valise: 'VALISE',
        boite: 'BOITE', dossier: 'DOSSIER', sachet: 'SACHET',
      };
      const priorityLabel: Record<string, string> = {
        urgent: 'URGENT', semaine: 'SEMAINE', pas_presse: 'PAS PRESSE',
      };

      const lines: string[] = [
        data.containerName.toUpperCase(),
        `#${data.containerNumber} - ${typeLabel[data.type] ?? data.type}`,
        priorityLabel[data.priority] ?? data.priority,
        ...(data.roomName ? [data.roomName.toUpperCase()] : []),
        '---',
        data.qrCodeData,
      ];

      // Render and send bitmap rows
      const rows = renderLabel(lines);

      for (const row of rows) {
        await sendCmd(manager, connectedDevice.id, 0xa2, Array.from(row));
        await sleep(8);
      }

      // Feed paper out
      await sendCmd(manager, connectedDevice.id, 0xa1, [100, 0]);

      set({ printerStatus: 'connected' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impression échouée';
      set({ error: message, printerStatus: 'error' });
    }
  },

  clearError: () => set({ error: null }),
}));

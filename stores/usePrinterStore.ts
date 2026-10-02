import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrinterStatus, BLEDevice, StickerData } from '../types';
import QRCode from 'qrcode';

const SAVED_PRINTER_KEY = '@tmb_saved_printer';

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

  // Top padding — none, StartLattice already positions the head
  // (removing avoids the large blank gap before text)

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

    // MX06 expects LSB-first bit order within each byte (bit 0 = leftmost pixel)
    for (const pixelRow of canvas) {
      const byteRow = new Uint8Array(COLS);
      for (let b = 0; b < COLS; b++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          byte |= (pixelRow[b * 8 + bit] ?? 0) << bit;
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

/**
 * Generate a QR code bitmap for the MX06 printer.
 * Returns 48-byte rows (384px wide), centered, with quiet zone.
 */
async function renderQRBitmap(data: string): Promise<Uint8Array[]> {
  const PRINT_W = 384;
  const COLS    = 48;

  const qr = await QRCode.create(data, { errorCorrectionLevel: 'M' });
  const qrSize = qr.modules.size;

  // Scale so QR fills ~70% of print width, min 2px per module
  const scale   = Math.max(2, Math.floor((PRINT_W * 0.70) / qrSize));
  const imgW    = qrSize * scale;
  const offsetX = Math.floor((PRINT_W - imgW) / 2);

  const rows: Uint8Array[] = [];
  // Quiet-zone top (2 modules)
  const blankRow = new Uint8Array(COLS);
  for (let i = 0; i < scale * 2; i++) rows.push(blankRow);

  for (let y = 0; y < qrSize; y++) {
    const pixelRow = new Array(PRINT_W).fill(0);
    for (let x = 0; x < qrSize; x++) {
      const isDark = qr.modules.data[y * qrSize + x] === 1;
      if (isDark) {
        for (let sx = 0; sx < scale; sx++) {
          const px = offsetX + x * scale + sx;
          if (px < PRINT_W) pixelRow[px] = 1;
        }
      }
    }
    // Each module row = `scale` pixel rows
    // MX06 expects LSB-first bit order within each byte (bit 0 = leftmost pixel)
    const byteRow = new Uint8Array(COLS);
    for (let b = 0; b < COLS; b++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        byte |= (pixelRow[b * 8 + bit] ?? 0) << bit;
      }
      byteRow[b] = byte;
    }
    for (let sy = 0; sy < scale; sy++) {
      rows.push(new Uint8Array(byteRow));
    }
  }

  // Quiet-zone bottom
  for (let i = 0; i < scale * 2; i++) rows.push(blankRow);
  return rows;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
export type PrinterMode = 'ble' | 'system';

interface PrinterState {
  printerStatus: PrinterStatus;
  printerMode: PrinterMode;
  connectedDevice: BLEDevice | null;
  availableDevices: BLEDevice[];
  savedDevices: BLEDevice[];
  error: string | null;
  toast: string | null;

  setMode: (mode: PrinterMode) => void;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: BLEDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  printSticker: (data: StickerData) => Promise<void>;
  tryAutoReconnect: () => Promise<void>;
  clearError: () => void;
  clearToast: () => void;
}

export const usePrinterStore = create<PrinterState>((set, get) => ({
  printerStatus: 'disconnected',
  printerMode: 'ble',
  connectedDevice: null,
  availableDevices: [],
  savedDevices: [],
  error: null,
  toast: null,

  setMode: (mode) => set({ printerMode: mode }),

  startScan: async () => {
    const manager = await getBleManager();
    if (!manager) {
      set({ error: 'Bluetooth non disponible', printerStatus: 'error' });
      return;
    }

    set({ printerStatus: 'scanning', availableDevices: [], error: null });

    try {
      // Wait up to 3s for BLE to become ready (avoids false 'Unknown' state on init)
      const state = await new Promise<string>((resolve) => {
        manager.state().then((s: string) => {
          if (s === 'PoweredOn') { resolve(s); return; }
          const sub = manager.onStateChange((newState: string) => {
            if (newState === 'PoweredOn' || newState === 'PoweredOff' || newState === 'Unauthorized') {
              sub.remove(); resolve(newState);
            }
          }, true);
          setTimeout(() => { sub.remove(); resolve(s); }, 3000);
        });
      });

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

      const bleDevice: BLEDevice = { id: connected.id, name: connected.name ?? device.name, rssi: connected.rssi ?? undefined };
      set({ printerStatus: 'connected', connectedDevice: bleDevice });

      // Persist to saved devices
      const current = get().savedDevices;
      const already = current.some(d => d.id === bleDevice.id);
      const updated = already ? current : [...current, { id: bleDevice.id, name: bleDevice.name }];
      set({ savedDevices: updated });
      AsyncStorage.setItem(SAVED_PRINTER_KEY, JSON.stringify(updated)).catch(() => {});

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
      // Request larger MTU for less fragmentation
      try { await manager.requestMTUForDevice(connectedDevice.id, 247); } catch {}

      // ── Full MX06 print sequence (per NaitLee/Cat-Printer reference) ──────────

      // 1. Set 200 DPI quality
      await sendCmd(manager, connectedDevice.id, 0xa4, [50]);
      await sleep(20);

      // 2. Set thermal energy (darkness) and apply it
      // Protocol is little-endian: [lo, hi]. 0xFFFF = max energy = darkest print.
      await sendCmd(manager, connectedDevice.id, 0xaf, [0xff, 0xff]);
      await sleep(20);
      await sendCmd(manager, connectedDevice.id, 0xbe, [0x01]); // ApplyEnergy
      await sleep(20);

      // 3. StartLattice — marks begin of print job
      await sendCmd(manager, connectedDevice.id, 0xa6,
        [0xaa,0x55,0x17,0x38,0x44,0x5f,0x5f,0x5f,0x44,0x38,0x2c]);
      await sleep(20);

      // Build label content
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
      ];

      // Render text rows then QR bitmap rows
      const textRows = renderLabel(lines);
      const qrRows   = await renderQRBitmap(data.qrCodeData);
      const rows     = [...textRows, ...qrRows];

      // 4. Send bitmap rows with conservative timing to prevent MX06 buffer overflow.
      // Printer stops mid-print when overwhelmed — send 1 row every 30ms,
      // with a longer pause every 3 rows to let the thermal head catch up.
      const BATCH_SIZE  = 3;
      const BATCH_DELAY = 120; // ms — longer pause between batches
      const ROW_DELAY   = 30;  // ms — between individual rows

      for (let i = 0; i < rows.length; i++) {
        await sendCmd(manager, connectedDevice.id, 0xa2, Array.from(rows[i]));
        if ((i + 1) % BATCH_SIZE === 0) {
          await sleep(BATCH_DELAY);
        } else {
          await sleep(ROW_DELAY);
        }
      }

      // 5. EndLattice — marks end of print job
      await sendCmd(manager, connectedDevice.id, 0xa6,
        [0xaa,0x55,0x17,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x17]);
      await sleep(20);

      // 6. MX06 bug: FeedPaper (0xa1) doesn't work on MX05/MX06/MX08/MX09/MX10.
      // Workaround: send blank bitmap rows to push paper past the cutter.
      // 70 rows ≈ 8.7mm — enough margin to cut cleanly.
      const blankRow = new Uint8Array(48);
      for (let i = 0; i < 70; i++) {
        await sendCmd(manager, connectedDevice.id, 0xa2, Array.from(blankRow));
        await sleep(20);
      }

      set({ printerStatus: 'connected' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impression échouée';
      set({ error: message, printerStatus: 'error' });
    }
  },

  tryAutoReconnect: async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_PRINTER_KEY);
      if (!raw) return;
      const saved: BLEDevice[] = JSON.parse(raw);
      if (!saved.length) return;
      set({ savedDevices: saved });

      const manager = await getBleManager();
      if (!manager) return;

      // Wait up to 8s for BLE to become ready (app just launched, radio may not be up yet)
      const state = await new Promise<string>((resolve) => {
        manager.state().then((s: string) => {
          if (s === 'PoweredOn') { resolve(s); return; }
          const sub = manager.onStateChange((newState: string) => {
            if (newState === 'PoweredOn' || newState === 'PoweredOff' || newState === 'Unauthorized') {
              sub.remove(); resolve(newState);
            }
          }, true);
          setTimeout(() => { sub.remove(); resolve(s); }, 8000);
        }).catch(() => resolve('Unknown'));
      });
      if (state !== 'PoweredOn') return;

      for (const device of saved) {
        try {
          const alreadyConn = await manager.isDeviceConnected(device.id).catch(() => false);
          let bleDevice: BLEDevice;

          if (alreadyConn) {
            bleDevice = device;
          } else {
            const connected = await manager.connectToDevice(device.id, { timeout: 6000 });
            await connected.discoverAllServicesAndCharacteristics();
            const services = await connected.services();
            const uuids: string[] = services.map((s: any) => s.uuid.toUpperCase());
            if (uuids.some((u: string) => u.includes('AE30'))) {
              _serviceUUID = MX06_SERVICE; _writeUUID = MX06_WRITE;
            } else if (uuids.some((u: string) => u.includes('FF00'))) {
              _serviceUUID = ALT_SERVICE; _writeUUID = ALT_WRITE;
            }
            bleDevice = { id: connected.id, name: connected.name ?? device.name, rssi: connected.rssi ?? undefined };
            manager.onDeviceDisconnected(device.id, () => {
              set({ printerStatus: 'disconnected', connectedDevice: null });
            });
          }

          set({ printerStatus: 'connected', connectedDevice: bleDevice, toast: `🖨️ ${bleDevice.name} reconnectée` });
          setTimeout(() => set({ toast: null }), 3500);
          return;
        } catch {
          // Device unreachable, try next
        }
      }
    } catch {
      // Best-effort, fail silently
    }
  },

  clearError: () => set({ error: null }),
  clearToast: () => set({ toast: null }),
}));

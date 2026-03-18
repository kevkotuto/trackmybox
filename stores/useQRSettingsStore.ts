import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = '@tmb_qr_settings';

export type QRContainerShape = 'square' | 'rounded' | 'circle';
export type QRModuleShape   = 'square' | 'rounded' | 'dots' | 'diamond' | 'star';
export type QREyeShape      = 'square' | 'rounded' | 'dots' | 'classic' | 'classic-rounded';

export interface QRSettings {
  fgColor:        string;
  bgColor:        string;
  showLogo:       boolean;
  containerShape: QRContainerShape;
  moduleShape:    QRModuleShape;
  eyeShape:       QREyeShape;
}

interface QRSettingsState extends QRSettings {
  load:   () => Promise<void>;
  update: (patch: Partial<QRSettings>) => void;
}

export const DEFAULT_QR: QRSettings = {
  fgColor:        '#000000',
  bgColor:        '#FFFFFF',
  showLogo:       true,
  containerShape: 'square',
  moduleShape:    'square',
  eyeShape:       'classic',
};

export const useQRSettingsStore = create<QRSettingsState>((set, get) => ({
  ...DEFAULT_QR,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set(JSON.parse(raw));
    } catch {}
  },

  update: (patch) => {
    set(patch);
    try {
      const s = { ...get(), ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify({
        fgColor:        s.fgColor,
        bgColor:        s.bgColor,
        showLogo:       s.showLogo,
        containerShape: s.containerShape,
        moduleShape:    s.moduleShape,
        eyeShape:       s.eyeShape,
      }));
    } catch {}
  },
}));

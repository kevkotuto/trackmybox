import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = '@tmb_settings';

interface SettingsState {
  advancedMode: boolean;
  thirdPartyMode: boolean;
  setAdvancedMode: (value: boolean) => void;
  setThirdPartyMode: (value: boolean) => void;
  load: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  advancedMode: true,
  thirdPartyMode: false,

  setAdvancedMode: (value) => {
    set({ advancedMode: value });
    AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), advancedMode: value })).catch(() => {});
  },

  setThirdPartyMode: (value) => {
    set({ thirdPartyMode: value });
    AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), thirdPartyMode: value })).catch(() => {});
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          advancedMode: parsed.advancedMode ?? true,
          thirdPartyMode: parsed.thirdPartyMode ?? false,
        });
      }
    } catch {}
  },
}));

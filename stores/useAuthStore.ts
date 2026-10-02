import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = '@tmb_auth';

interface AuthState {
  token: string | null;
  householdId: string | null;
  householdCode: string | null;
  deviceName: string | null;
  isHydrated: boolean;
  setAuth: (token: string, householdId: string, householdCode?: string, deviceName?: string) => void;
  logout: () => void;
  load: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  householdId: null,
  householdCode: null,
  deviceName: null,
  isHydrated: false,

  setAuth: (token, householdId, householdCode, deviceName) => {
    const state = { token, householdId, householdCode: householdCode ?? null, deviceName: deviceName ?? null };
    set(state);
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  },

  logout: () => {
    set({ token: null, householdId: null, householdCode: null, deviceName: null });
    AsyncStorage.removeItem(KEY).catch(() => {});
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ...JSON.parse(raw), isHydrated: true });
      else set({ isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
}));

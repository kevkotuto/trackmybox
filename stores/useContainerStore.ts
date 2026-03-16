import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  ContainerType,
  ContainerStatus,
  ContainerPriority,
} from '../types';
import { containerDb } from '../services/database';

interface ContainerFilters {
  moveId?: string;
  roomId?: string;
  status?: ContainerStatus;
  type?: ContainerType;
  priority?: ContainerPriority;
  search?: string;
  isScannedOnArrival?: boolean;
}

interface ContainerState {
  containers: Container[];
  selectedContainer: Container | null;
  isLoading: boolean;
  error: string | null;

  fetchContainers: (filters?: ContainerFilters) => Promise<void>;
  addContainer: (data: Omit<Container, 'id' | 'items' | 'photos' | 'createdAt' | 'updatedAt'>) => Promise<Container>;
  updateContainer: (id: string, data: Partial<Omit<Container, 'id' | 'items' | 'photos' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  scanContainer: (id: string) => Promise<void>;
  getContainerByQR: (qrCode: string) => Promise<Container | null>;
  setSelectedContainer: (container: Container | null) => void;
  clearError: () => void;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
  containers: [],
  selectedContainer: null,
  isLoading: false,
  error: null,

  fetchContainers: async (filters?: ContainerFilters) => {
    set({ isLoading: true, error: null });
    try {
      const containers = await containerDb.getAll(filters);
      set({ containers, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch containers';
      set({ error: message, isLoading: false });
    }
  },

  addContainer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const qrCodeData = data.qrCodeData || `tmb-${uuidv4()}`;
      const container = await containerDb.create({ ...data, qrCodeData });
      set((state) => ({
        containers: [container, ...state.containers],
        isLoading: false,
      }));
      return container;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add container';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateContainer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await containerDb.update(id, data);
      if (updated) {
        set((state) => ({
          containers: state.containers.map((c) => (c.id === id ? updated : c)),
          selectedContainer: state.selectedContainer?.id === id ? updated : state.selectedContainer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update container';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await containerDb.delete(id);
      set((state) => ({
        containers: state.containers.filter((c) => c.id !== id),
        selectedContainer: state.selectedContainer?.id === id ? null : state.selectedContainer,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete container';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  scanContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const scanned = await containerDb.scan(id);
      if (scanned) {
        set((state) => ({
          containers: state.containers.map((c) => (c.id === id ? scanned : c)),
          selectedContainer: state.selectedContainer?.id === id ? scanned : state.selectedContainer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan container';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  getContainerByQR: async (qrCode) => {
    try {
      const container = await containerDb.getByQR(qrCode);
      if (container) {
        set({ selectedContainer: container });
      }
      return container;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find container';
      set({ error: message });
      return null;
    }
  },

  setSelectedContainer: (container) => {
    set({ selectedContainer: container });
  },

  clearError: () => {
    set({ error: null });
  },
}));

import { create } from 'zustand';
import {
  Container,
  ContainerType,
  ContainerStatus,
  ContainerPriority,
  Item,
  Photo,
} from '../types';
import { containerApi, ContainerFilters } from '../services/api';

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
  fetchContainerById: (id: string) => Promise<void>;
  addItemToContainer: (containerId: string, item: Item) => void;
  removeItemFromContainer: (containerId: string, itemId: string) => void;
  addPhotoToContainer: (containerId: string, photo: Photo) => void;
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
      const fetched = await containerApi.getAll(filters);
      set((state) => ({
        containers: fetched.map(newC => {
          const existing = state.containers.find(c => c.id === newC.id);
          return {
            ...newC,
            items: newC.items?.length ? newC.items : (existing?.items ?? []),
            photos: newC.photos?.length ? newC.photos : (existing?.photos ?? []),
          };
        }),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      set({ error: message, isLoading: false });
    }
  },

  addContainer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const container = await containerApi.create(data);
      set((state) => ({
        containers: [container, ...state.containers],
        isLoading: false,
      }));
      return container;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateContainer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await containerApi.update(id, data);
      set((state) => ({
        containers: state.containers.map((c) => (c.id === id ? updated : c)),
        selectedContainer: state.selectedContainer?.id === id ? updated : state.selectedContainer,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await containerApi.delete(id);
      set((state) => ({
        containers: state.containers.filter((c) => c.id !== id),
        selectedContainer: state.selectedContainer?.id === id ? null : state.selectedContainer,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  scanContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const scanned = await containerApi.scan(id);
      set((state) => ({
        containers: state.containers.map((c) => (c.id === id ? scanned : c)),
        selectedContainer: state.selectedContainer?.id === id ? scanned : state.selectedContainer,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du scan';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  getContainerByQR: async (qrCode) => {
    const trimmed = qrCode.trim();

    // 1. Try API first
    try {
      const container = await containerApi.getByQR(trimmed);
      set({ selectedContainer: container });
      return container;
    } catch (_apiErr) {
      // API failed — fall through to local search
    }

    // 2. Fallback: search in already-loaded containers
    const local = get().containers.find(
      (c) => c.qrCodeData === trimmed || c.qrCodeData?.trim() === trimmed
    );
    if (local) {
      set({ selectedContainer: local });
      return local;
    }

    // 3. If containers not loaded yet, fetch all and retry
    try {
      await get().fetchContainers();
      const afterFetch = get().containers.find(
        (c) => c.qrCodeData === trimmed || c.qrCodeData?.trim() === trimmed
      );
      if (afterFetch) {
        set({ selectedContainer: afterFetch });
        return afterFetch;
      }
    } catch {}

    set({ error: `Aucun carton trouvé pour : ${trimmed}` });
    return null;
  },

  fetchContainerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const container = await containerApi.getById(id);
      set((state) => ({
        containers: state.containers.some((c) => c.id === id)
          ? state.containers.map((c) => (c.id === id ? container : c))
          : [...state.containers, container],
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      set({ error: message, isLoading: false });
    }
  },

  addItemToContainer: (containerId, item) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === containerId ? { ...c, items: [...(c.items ?? []), item] } : c
      ),
    }));
  },

  removeItemFromContainer: (containerId, itemId) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === containerId
          ? { ...c, items: (c.items ?? []).filter((i) => i.id !== itemId) }
          : c
      ),
    }));
  },

  addPhotoToContainer: (containerId, photo) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === containerId ? { ...c, photos: [...(c.photos ?? []), photo] } : c
      ),
    }));
  },

  setSelectedContainer: (container) => {
    set({ selectedContainer: container });
  },

  clearError: () => {
    set({ error: null });
  },
}));

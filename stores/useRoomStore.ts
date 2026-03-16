import { create } from 'zustand';
import { Room } from '../types';
import { roomDb } from '../services/database';

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;

  fetchRooms: (moveId?: string) => Promise<void>;
  addRoom: (data: Omit<Room, 'id'>) => Promise<Room>;
  updateRoom: (id: string, data: Partial<Omit<Room, 'id'>>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  isLoading: false,
  error: null,

  fetchRooms: async (moveId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const rooms = await roomDb.getAll(moveId);
      set({ rooms, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rooms';
      set({ error: message, isLoading: false });
    }
  },

  addRoom: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomDb.create(data);
      set((state) => ({
        rooms: [...state.rooms, room].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return room;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateRoom: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await roomDb.update(id, data);
      if (updated) {
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? updated : r)).sort((a, b) => a.name.localeCompare(b.name)),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await roomDb.delete(id);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

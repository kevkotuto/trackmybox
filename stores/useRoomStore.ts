import { create } from 'zustand';
import { Room } from '../types';
import { roomApi, CreateRoomData, UpdateRoomData } from '../services/api';

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;

  fetchRooms: (moveId?: string) => Promise<void>;
  addRoom: (data: CreateRoomData) => Promise<Room>;
  updateRoom: (id: string, data: UpdateRoomData) => Promise<void>;
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
      const rooms = await roomApi.getAll(moveId);
      set({ rooms, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rooms';
      set({ error: message, isLoading: false });
    }
  },

  addRoom: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomApi.create(data);
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
      const updated = await roomApi.update(id, data);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updated : r)).sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update room';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await roomApi.delete(id);
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

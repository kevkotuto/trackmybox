import { create } from 'zustand';
import { Move, MoveStatus } from '../types';
import { moveDb } from '../services/database';

interface MoveState {
  moves: Move[];
  selectedMove: Move | null;
  isLoading: boolean;
  error: string | null;

  fetchMoves: () => Promise<void>;
  addMove: (data: Omit<Move, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Move>;
  updateMove: (id: string, data: Partial<Omit<Move, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteMove: (id: string) => Promise<void>;
  startMove: (id: string) => Promise<void>;
  completeMove: (id: string) => Promise<void>;
  setSelectedMove: (move: Move | null) => void;
  clearError: () => void;
  currentMove: () => Move | undefined;
}

export const useMoveStore = create<MoveState>((set, get) => ({
  moves: [],
  selectedMove: null,
  isLoading: false,
  error: null,

  fetchMoves: async () => {
    set({ isLoading: true, error: null });
    try {
      const moves = await moveDb.getAll();
      set({ moves, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch moves';
      set({ error: message, isLoading: false });
    }
  },

  addMove: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const move = await moveDb.create(data);
      set((state) => ({
        moves: [move, ...state.moves],
        isLoading: false,
      }));
      return move;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add move';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateMove: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await moveDb.update(id, data);
      if (updated) {
        set((state) => ({
          moves: state.moves.map((m) => (m.id === id ? updated : m)),
          selectedMove: state.selectedMove?.id === id ? updated : state.selectedMove,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update move';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await moveDb.delete(id);
      set((state) => ({
        moves: state.moves.filter((m) => m.id !== id),
        selectedMove: state.selectedMove?.id === id ? null : state.selectedMove,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete move';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  startMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const started = await moveDb.start(id);
      if (started) {
        set((state) => ({
          moves: state.moves.map((m) => (m.id === id ? started : m)),
          selectedMove: state.selectedMove?.id === id ? started : state.selectedMove,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start move';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  completeMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const completed = await moveDb.complete(id);
      if (completed) {
        set((state) => ({
          moves: state.moves.map((m) => (m.id === id ? completed : m)),
          selectedMove: state.selectedMove?.id === id ? completed : state.selectedMove,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete move';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  setSelectedMove: (move) => {
    set({ selectedMove: move });
  },

  clearError: () => {
    set({ error: null });
  },

  currentMove: () => {
    const { moves } = get();
    return moves.find((m) => m.status === MoveStatus.ACTIVE) || moves.find((m) => m.status === MoveStatus.PREPARATION);
  },
}));

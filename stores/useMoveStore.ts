import { create } from 'zustand';
import { Move, MoveStatus } from '../types';
import { moveApi } from '../services/api';

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
      const moves = await moveApi.getAll();
      set({ moves, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      set({ error: message, isLoading: false });
    }
  },

  addMove: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const move = await moveApi.create(data);
      set((state) => ({
        moves: [move, ...state.moves],
        isLoading: false,
      }));
      return move;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateMove: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await moveApi.update(id, data);
      set((state) => ({
        moves: state.moves.map((m) => (m.id === id ? updated : m)),
        selectedMove: state.selectedMove?.id === id ? updated : state.selectedMove,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await moveApi.delete(id);
      set((state) => ({
        moves: state.moves.filter((m) => m.id !== id),
        selectedMove: state.selectedMove?.id === id ? null : state.selectedMove,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  startMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const started = await moveApi.start(id);
      set((state) => ({
        moves: state.moves.map((m) => (m.id === id ? started : m)),
        selectedMove: state.selectedMove?.id === id ? started : state.selectedMove,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du démarrage';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  completeMove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const completed = await moveApi.complete(id);
      set((state) => ({
        moves: state.moves.map((m) => (m.id === id ? completed : m)),
        selectedMove: state.selectedMove?.id === id ? completed : state.selectedMove,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la finalisation';
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

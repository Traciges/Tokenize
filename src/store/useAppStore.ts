
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Preferences } from '@capacitor/preferences';
import { QUICKSTART_ID } from '../types';
import type { AppState, ModifierCard } from '../types';

interface StoreState extends AppState {
  addDeck: (name: string) => void;
  initQuickstart: () => void;
  removeDeck: (id: string) => void;
  addModifierToDeck: (deckId: string, card: Omit<ModifierCard, 'id'>) => void;
  updateModifierInDeck: (deckId: string, cardId: string, card: Partial<ModifierCard>) => void;
  removeModifierFromDeck: (deckId: string, cardId: string) => void;
  updateCardCount: (cardId: string, delta: number) => void;
  clearActiveBoard: () => void;
  updateDeckArt: (deckId: string, artUrl?: string, colors?: string[]) => void;
}

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key: name });
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await Preferences.remove({ key: name });
  },
};

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      decks: [],
      activeBoard: {},

      addDeck: (name) =>
        set((state) => ({
          decks: [...state.decks, { id: crypto.randomUUID(), name, modifiers: [] }],
        })),

      initQuickstart: () =>
        set((state) => {
          if (!state.decks.find((d) => d.id === QUICKSTART_ID)) {
            return {
              decks: [
                ...state.decks,
                { id: QUICKSTART_ID, name: 'Quickstart', modifiers: [] },
              ],
            };
          }
          return state;
        }),

      removeDeck: (id) =>
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== id),
        })),

      addModifierToDeck: (deckId, card) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? { ...d, modifiers: [...d.modifiers, { ...card, id: crypto.randomUUID() }] }
              : d
          ),
        })),

      updateModifierInDeck: (deckId, cardId, card) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  modifiers: d.modifiers.map((m) =>
                    m.id === cardId ? { ...m, ...card } : m
                  ),
                }
              : d
          ),
        })),

      removeModifierFromDeck: (deckId, cardId) =>
        set((state) => {
          const restBoard = { ...state.activeBoard };
          delete restBoard[cardId];
          return {
            decks: state.decks.map((d) =>
              d.id === deckId
                ? { ...d, modifiers: d.modifiers.filter((c) => c.id !== cardId) }
                : d
            ),
            activeBoard: restBoard,
          };
        }),

      updateCardCount: (cardId, delta) =>
        set((state) => {
          const currentCount = state.activeBoard[cardId] || 0;
          const nextCount = Math.max(0, currentCount + delta);
          if (nextCount === currentCount) return state;
          return {
            activeBoard: { ...state.activeBoard, [cardId]: nextCount },
          };
        }),

      clearActiveBoard: () =>
        set(() => ({
          activeBoard: {},
        })),

      updateDeckArt: (deckId, artUrl, colors) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId ? { ...d, artUrl, colors } : d
          ),
        })),
    }),
    {
      name: 'mtg-toolbox-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        ...state,
        decks: state.decks.filter((d) => d.id !== QUICKSTART_ID),
      }),
    }
  )
);

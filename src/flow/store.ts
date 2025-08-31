import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/vanilla/shallow';

export type Card = {
  id: string;
  title: string;
  content: string;
};

export interface CardsState {
  activeCardId: string | null;
  setActiveCard: (id: string) => void;
}

export const useAitetsuStore = createWithEqualityFn<CardsState>()(
  (set, get) => ({
    activeCardId: null,
    setActiveCard: (id) => {
      set({ activeCardId: id });
    },
  }),
  shallow
);

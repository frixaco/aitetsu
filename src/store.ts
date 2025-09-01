import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/vanilla/shallow';

export type Card = {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

export const generateTestCards = (count: number): Card[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    title: `Card ${i + 1}`,
    content: [
      `# Card ${i + 1}`,
      '',
      `Intro paragraph with some **bold**, _italic_, and a [link](https://developer.mozilla.org).`,
      '',
      '## Details',
      '- Bullet item one',
      '- Bullet item two with `inline code`',
      '1. Ordered item one',
      '2. Ordered item two',
      '',
      '### Tasks',
      '- [x] Completed task',
      '- [ ] Pending task',
      '',
      '> Blockquote: “Simplicity is prerequisite for reliability.” — Dijkstra',
      '',
      '```ts',
      'function greet(name: string) {',
      '  return `Hello, ${name}!`',
      '}',
      '```',
      '',
      '| Col | Value |',
      '| --- | ----- |',
      '| A   |  1    |',
      '| B   |  2    |',
      '',
      '![Alt diagram](https://via.placeholder.com/80)',
      '',
      'Third paragraph with a horizontal rule below.',
      '',
      '---',
      '',
      'Final paragraph wrapping things up.',
    ].join('\n'),
    position: {
      x: (i % 10) * 320,
      y: Math.floor(i / 10) * 360,
    },
    size: { width: 192, height: 288 },
  }));
};

export const INITIAL_CARDS = generateTestCards(200);

export interface CardsState {
  cardsMap: Map<string, Card>;
  cards: Card[];
  transform: { x: number; y: number; k: number };
  viewportRect: { width: number; height: number };
  setTransform: (transform: { x: number; y: number; k: number }) => void;
  setViewportRect: (rect: { width: number; height: number }) => void;
}

export const useMainStore = createWithEqualityFn<CardsState>()(
  (set) => ({
    cardsMap: new Map(INITIAL_CARDS.map((c) => [c.id, c])),
    cards: INITIAL_CARDS,
    transform: { x: 0, y: 0, k: 1 },
    viewportRect: { width: 0, height: 0 },
    setTransform: (transform) => set({ transform }),
    setViewportRect: (viewportRect) => set({ viewportRect }),
  }),
  shallow
);

const selectVisibleCardIds = (state: CardsState): Set<string> => {
  const { cards, transform, viewportRect } = state;

  if (!viewportRect.width || !viewportRect.height) {
    return new Set();
  }

  const pad = 800;
  const { x, y, k } = transform;
  const { width, height } = viewportRect;

  const cameraXStart = (0 - x) / k;
  const cameraYStart = (0 - y) / k;
  const cameraXEnd = width / k;
  const cameraYEnd = height / k;

  const cameraWorldRect = {
    x: cameraXStart - pad,
    y: cameraYStart - pad,
    width: cameraXEnd - cameraXStart + pad * 2,
    height: cameraYEnd - cameraYStart + pad * 2,
  };

  const visibleIds = new Set<string>();
  for (const card of cards) {
    const cardRect = { ...card.position, ...card.size };
    const isVisible =
      cardRect.x < cameraWorldRect.x + cameraWorldRect.width &&
      cardRect.x + cardRect.width > cameraWorldRect.x &&
      cardRect.y < cameraWorldRect.y + cameraWorldRect.height &&
      cardRect.y + cardRect.height > cameraWorldRect.y;

    if (isVisible) {
      visibleIds.add(card.id);
    }
  }

  return visibleIds;
};

export const useVisibleCardIds = () => {
  return useMainStore(selectVisibleCardIds, (oldSet, newSet) => {
    if (oldSet.size !== newSet.size) return false;
    for (const id of oldSet) {
      if (!newSet.has(id)) return false;
    }
    return true;
  });
};

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/vanilla/shallow';
import { type WorkerResponse } from './visibility-worker';

export type Card = {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
    x: (i % 10) * 320,
    y: Math.floor(i / 10) * 360,
    width: 192,
    height: 288,
  }));
};

export const INITIAL_CARDS = generateTestCards(200);
export const INITIAL_CARDS_PAYLOAD = INITIAL_CARDS.map((c) => ({
  id: c.id,
  x: c.x,
  y: c.y,
  width: c.width,
  height: c.height,
}));

export interface CardsState {
  cards: Map<string, Card>;
  visibleCardIds: Set<string>;
  transform: { x: number; y: number; k: number };
  viewportRect: { width: number; height: number };
  setTransform: (transform: { x: number; y: number; k: number }) => void;
  setViewportRect: (rect: { width: number; height: number }) => void;
}

export const useMainStore = createWithEqualityFn<CardsState>()((set, get) => {
  console.log('creating new worker');
  const worker = new Worker(
    new URL('./visibility-worker.ts', import.meta.url),
    {
      type: 'module',
    }
  );
  worker.postMessage({
    type: 'init',
    payload: INITIAL_CARDS_PAYLOAD,
  });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const data = event.data;
    if (data.type === 'update-visibility') {
      set({ visibleCardIds: data.payload });
    }
  };

  return {
    cards: new Map(INITIAL_CARDS.map((c) => [c.id, c])),
    visibleCardIds: new Set<string>(),
    transform: { x: 0, y: 0, k: 1 },
    viewportRect: { width: 0, height: 0 },
    setTransform: (transform) => {
      set({ transform });

      worker.postMessage({
        type: 'calculate-visibility',
        payload: {
          transform: get().transform,
          viewportRect: get().viewportRect,
        },
      });
      return;
    },
    setViewportRect: (viewportRect) => {
      set({ viewportRect });

      worker.postMessage({
        type: 'calculate-visibility',
        payload: {
          transform: get().transform,
          viewportRect: get().viewportRect,
        },
      });
    },
  };
}, shallow);

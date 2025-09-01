import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/vanilla/shallow';

export type Card = {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

export interface CardsState {
  cardsMap: Map<string, Card>;
  cards: Card[];
}

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

export const useMainStore = createWithEqualityFn<CardsState>()(
  () => ({
    cardsMap: new Map(INITIAL_CARDS.map((c) => [c.id, c])),
    cards: INITIAL_CARDS,
  }),
  shallow
);

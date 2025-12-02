import { type Card } from './store';

let cards: Card[] = [];

export type WorkerRequest =
  | { type: 'init'; payload: Card[] }
  | {
      type: 'calculate-visibility';
      payload: {
        transform: { x: number; y: number; k: number };
        viewportRect: { width: number; height: number };
      };
    };
export type WorkerResponse = {
  type: 'update-visibility';
  payload: Set<string>;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;
  if (data.type === 'init') {
    cards = data.payload;
  }
  if (data.type === 'calculate-visibility') {
    const { transform, viewportRect } = data.payload;

    if (!viewportRect.width || !viewportRect.height) {
      return new Set();
    }

    const pad = 800;
    const { x, y, k } = transform;
    const { width, height } = viewportRect;

    const cameraXStart = (0 - x) / k;
    const cameraYStart = (0 - y) / k;
    const cameraXEnd = (width - x) / k;
    const cameraYEnd = (height - y) / k;

    const cameraWorldRect = {
      x: cameraXStart - pad,
      y: cameraYStart - pad,
      width: cameraXEnd - cameraXStart + pad * 2,
      height: cameraYEnd - cameraYStart + pad * 2,
    };

    const visibleIds = new Set<string>();
    for (const card of cards) {
      const isVisible =
        card.x < cameraWorldRect.x + cameraWorldRect.width &&
        card.x + card.width > cameraWorldRect.x &&
        card.y < cameraWorldRect.y + cameraWorldRect.height &&
        card.y + card.height > cameraWorldRect.y;

      if (isVisible) {
        visibleIds.add(card.id);
      }
    }

    self.postMessage({
      type: 'update-visibility',
      payload: visibleIds,
    });
  }
};

import { useEffect, useRef, useState } from 'react';
import { useMainStore } from './store';
import { Card } from './card';
import * as d3 from 'd3';

export function Viewport() {
  const [visibleCardIds, setVisibleCardIds] = useState(new Set<string>());

  const cards = useMainStore((state) => state.cards);

  const planeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportRectRef = useRef<DOMRect>(null);
  const transformRef = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 1,
  });

  useEffect(() => {
    if (!viewportRef.current || !planeRef.current || !viewportRectRef.current)
      return;

    const viewport = d3.select<HTMLDivElement, unknown>(viewportRef.current);
    const plane = d3.select<HTMLDivElement, unknown>(planeRef.current);

    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.25, 3])
      .on('zoom', (event: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
        console.log('zoom', event.transform.toString());
        const x = event.transform.x;
        const y = event.transform.y;
        const z = event.transform.k;

        transformRef.current = { x, y, z };

        plane.style(
          'transform',
          `translate3d(${x}px, ${y}px, 0px) scale(${z})`
        );

        updateVisibilityThrottled();
      })
      .on('end', () => {
        updateVisibility();
      });
    viewport.call(zoom);

    return () => {
      viewport.on('.zoom', null);
    };
  }, []);

  const throttleTimeoutRef = useRef<number>(null);
  const updateVisibilityThrottled = () => {
    if (throttleTimeoutRef.current) {
      return;
    }

    throttleTimeoutRef.current = setTimeout(() => {
      updateVisibility();
      throttleTimeoutRef.current = null;
    }, 100);
  };
  const updateVisibility = () => {
    if (!viewportRef.current || !viewportRectRef.current) return;

    const { x, y, z } = transformRef.current;

    const pad = 800;
    const { height, width } = viewportRectRef.current!;
    const cameraX = (0 - x) / z;
    const cameraY = (0 - y) / z;
    const cameraWidth = (width - x) / z;
    const cameraHeight = (height - y) / z;

    const cameraWorldRect = {
      x: cameraX - pad,
      y: cameraY - pad,
      width: cameraWidth - cameraX + pad * 2,
      height: cameraHeight - cameraY + pad * 2,
    };

    const newVisibleIds = new Set<string>();
    for (const card of cards) {
      const cardRect = {
        x: card.position.x,
        y: card.position.y,
        width: card.size.width,
        height: card.size.height,
      };

      const isVisible =
        cardRect.x < cameraWorldRect.x + cameraWorldRect.width &&
        cardRect.x + cardRect.width > cameraWorldRect.x &&
        cardRect.y < cameraWorldRect.y + cameraWorldRect.height &&
        cardRect.y + cardRect.height > cameraWorldRect.y;
      if (isVisible) {
        newVisibleIds.add(card.id);
      }
    }

    setVisibleCardIds(newVisibleIds);
  };

  useEffect(() => {
    updateVisibility();
  }, [cards]);

  useEffect(() => {
    if (!viewportRef.current) return;

    viewportRectRef.current = viewportRef.current?.getBoundingClientRect();

    const ro = new ResizeObserver(() => {
      if (!viewportRef.current) return;

      viewportRectRef.current = viewportRef.current?.getBoundingClientRect();
    });

    ro.observe(viewportRef.current);

    return () => {
      ro.disconnect();
    };
  }, []);

  const visibleCards = cards.filter((card) => visibleCardIds.has(card.id));

  return (
    <div
      id="viewport"
      ref={viewportRef}
      className="relative flex-1 overflow-hidden"
    >
      <div
        id="plane"
        ref={planeRef}
        style={{ transform: 'translate3d(0px, 0px, 0px) scale(1)' }}
        className="backface-hidden pointer-events-none absolute top-0 left-0 will-change-transform"
      >
        {visibleCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { useMainStore } from './store';
import { Card } from './card';
import * as d3 from 'd3';

export function Viewport() {
  const setTransform = useMainStore((state) => state.setTransform);
  const setViewportRect = useMainStore((state) => state.setViewportRect);

  const cardsMap = useMainStore((state) => state.cards);
  const visibleCardIds = useMainStore((state) => state.visibleCardIds);

  const planeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const transformRef = useRef<{ x: number; y: number; k: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const update = () => {
    if (transformRef.current && planeRef.current) {
      const { x, y, k } = transformRef.current;
      planeRef.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
      setTransform(transformRef.current);
    }
    animationFrameRef.current = null;
  };

  const scheduleUpdate = (transform: d3.ZoomTransform) => {
    transformRef.current = transform;
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(update);
    }
  };

  useEffect(() => {
    if (!viewportRef.current || !planeRef.current) return;

    const viewport = d3.select<HTMLDivElement, unknown>(viewportRef.current);

    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
        scheduleUpdate(event.transform);
      });
    viewport.call(zoom);

    return () => {
      viewport.on('.zoom', null);
    };
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;

    const initialRect = viewportRef.current.getBoundingClientRect();
    setViewportRect({ width: initialRect.width, height: initialRect.height });

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewportRect({ width, height });
    });

    ro.observe(viewportRef.current);

    return () => ro.disconnect();
  }, []);

  const visibleCards = useMemo(() => {
    const result = [];
    for (const id of visibleCardIds) {
      const card = cardsMap.get(id);
      if (card) {
        result.push(card);
      }
    }
    return result;
  }, [visibleCardIds, cardsMap]);

  return (
    <div
      id="viewport"
      ref={viewportRef}
      className="relative flex-1 overflow-hidden"
    >
      <div
        id="plane"
        ref={planeRef}
        style={{ transform: 'translate(0px, 0px) scale(1)' }}
        className="pointer-events-none absolute top-0 left-0 will-change-transform"
      >
        {visibleCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

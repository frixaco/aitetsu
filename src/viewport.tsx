import { useEffect, useRef } from 'react';
import { useMainStore, useVisibleCardIds } from './store';
import { Card } from './card';
import * as d3 from 'd3';

export function Viewport() {
  const setTransform = useMainStore((state) => state.setTransform);
  const setViewportRect = useMainStore((state) => state.setViewportRect);

  const cards = useMainStore((state) => state.cards);
  const visibleCardIds = useVisibleCardIds();

  const planeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current || !planeRef.current) return;

    const viewport = d3.select<HTMLDivElement, unknown>(viewportRef.current);
    const plane = d3.select<HTMLDivElement, unknown>(planeRef.current);

    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.25, 3])
      .on('zoom', (event: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
        const x = event.transform.x;
        const y = event.transform.y;
        const k = event.transform.k;

        plane.style('transform', `translate(${x}px, ${y}px) scale(${k})`);
        setTransform(event.transform);
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

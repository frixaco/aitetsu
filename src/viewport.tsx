import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useMainStore } from './store';
import { Card } from './card';
import { isWindows } from './utils';

export function Viewport() {
  const cards = useMainStore((state) => state.cards);
  const cameraRef = useRef({ x: 0, y: 0, z: 1 });
  const targetCameraRef = useRef({ x: 0, y: 0, z: 1 });
  const rafRef = useRef<number>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const tick = () => {
    const smoothFactor = 0.15;
    const dx = targetCameraRef.current.x - cameraRef.current.x;
    const dy = targetCameraRef.current.y - cameraRef.current.y;
    const dz = targetCameraRef.current.z - cameraRef.current.z;

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dz) < 0.001) {
      cameraRef.current.x = targetCameraRef.current.x;
      cameraRef.current.y = targetCameraRef.current.y;
      cameraRef.current.z = targetCameraRef.current.z;
      rafRef.current = null;
    } else {
      cameraRef.current.x += dx * smoothFactor;
      cameraRef.current.y += dy * smoothFactor;
      cameraRef.current.z += dz * smoothFactor;
      rafRef.current = requestAnimationFrame(tick);
    }

    if (planeRef.current) {
      planeRef.current.style.transform = `translate(${cameraRef.current.x}px, ${cameraRef.current.y}px) scale(${cameraRef.current.z})`;
    }

    updateVisibility();
  };

  const viewportRectRef = useRef({ left: 0, top: 0, bottom: 0, right: 0 });
  const visibilityMapRef = useRef(new Map<string, boolean>());
  const cardRefs = useRef(new Map<string, HTMLDivElement>());

  const updateVisibility = useCallback(() => {
    if (!viewportRef.current) return;

    const vr = viewportRectRef.current;
    const pad = 400;

    for (const card of cards) {
      const { x, y } = card.position;
      const { width, height } = card.size;

      const cardTop = y * cameraRef.current.z + cameraRef.current.y;
      const cardBottom = cardTop + height * cameraRef.current.z;
      const cardLeft = x * cameraRef.current.z + cameraRef.current.x;
      const cardRight = cardLeft + width * cameraRef.current.z;

      const isVisible =
        cardRight > vr.left - pad &&
        cardLeft < vr.right + pad &&
        cardBottom > vr.top - pad &&
        cardTop < vr.bottom + pad;

      const prev = visibilityMapRef.current.get(card.id);
      if (isVisible !== prev) {
        visibilityMapRef.current.set(card.id, isVisible);
        const el = cardRefs.current.get(card.id);
        if (el) {
          el.style.display = isVisible ? 'block' : 'none';
        }
      }
    }
  }, [cards]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
  }, [cards]);

  useLayoutEffect(() => {
    if (planeRef.current) {
      planeRef.current.style.transform = 'translate(0, 0) scale(1)';
      viewportRectRef.current = viewportRef.current!.getBoundingClientRect();
    }

    // run one RAF to “warm up”
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateVisibility();
        rafRef.current = requestAnimationFrame(tick);
      });
    });
  }, []);

  const drag = useRef<{
    id: number | null;
    startX: number;
    startY: number;
    camX: number;
    camY: number;
  }>({ id: null, startX: 0, startY: 0, camX: 0, camY: 0 });

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.ctrlKey && viewportRef.current) {
      const r = viewportRef.current.getBoundingClientRect();
      const cursorViewportX = e.clientX - r.left;
      const cursorViewportY = e.clientY - r.top;

      const { x: camX, y: camY, z: camZ } = cameraRef.current;

      const cursorPlaneX = (cursorViewportX - camX) / camZ;
      const cursorPlaneY = (cursorViewportY - camY) / camZ;

      const MIN_ZOOM = 0.1;
      const MAX_ZOOM = 3;
      const ZOOM_SPEED = isWindows ? 0.001 : 0.015;

      const newZoom = Math.min(
        Math.max(camZ * Math.exp(-e.deltaY * ZOOM_SPEED), MIN_ZOOM),
        MAX_ZOOM
      );

      const newCursorPlaneX = cursorViewportX - newZoom * cursorPlaneX;
      const newCursorPlaneY = cursorViewportY - newZoom * cursorPlaneY;

      targetCameraRef.current.z = newZoom;
      targetCameraRef.current.x = newCursorPlaneX;
      targetCameraRef.current.y = newCursorPlaneY;
    } else {
      targetCameraRef.current.x -= e.deltaX;
      targetCameraRef.current.y -= e.deltaY;
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      updateVisibility();
    }
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== e.pointerId) return;

    if (e.buttons === 1 || e.buttons === 4) {
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;

      targetCameraRef.current.x = drag.current.camX + dx;
      targetCameraRef.current.y = drag.current.camY + dy;
      cameraRef.current.x = drag.current.camX + dx;
      cameraRef.current.y = drag.current.camY + dy;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
  };

  return (
    <div
      id="viewport"
      ref={viewportRef}
      className="relative flex-1 overflow-hidden"
      onWheel={onWheel}
      onPointerDown={(e) => {
        if (
          (e.button === 0 || e.button === 1) &&
          (e.target as HTMLDivElement).closest('#viewport')
        ) {
          console.log('pointer down on plane');

          const vp = e.currentTarget as HTMLDivElement;
          vp.setPointerCapture(e.pointerId);
          drag.current = {
            id: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            camX: cameraRef.current.x,
            camY: cameraRef.current.y,
          };
        }
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
        drag.current.id = null;
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
        drag.current.id = null;
      }}
      onPointerCancel={(e) => {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
        drag.current.id = null;
      }}
    >
      {/* plane */}
      <div
        id="plane"
        ref={planeRef}
        className="backface-hidden absolute top-0 left-0 will-change-transform origin-[0_0]"
      >
        {/* cards */}
        {cards.map(({ id }) => (
          <Card key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

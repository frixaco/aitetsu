import { twMerge } from 'tailwind-merge';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import './App.css';

// Window controls (Tauri)
const appWindow = getCurrentWindow();

// Types and state
export type Card = {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

interface CardsState {
  cards: Card[];
  addCard: (card: Card) => void;
  updateCardMeta: (
    id: string,
    data: Partial<Omit<Card, 'position' | 'size'>>
  ) => void;
}

const generateTestCards = (count: number): Card[] =>
  Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    title: `Card ${i + 1}`,
    content: `This is test card number ${i + 1}`,
    position: { x: (i % 10) * 250, y: Math.floor(i / 10) * 300 },
    size: { width: 200, height: 200 },
  }));

const INITIAL_CARDS = generateTestCards(200);

const useCardsStore = create<CardsState>((set) => ({
  cards: INITIAL_CARDS,
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCardMeta: (id, data) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
}));

// FPS counter
const FPSCounter = () => {
  const [fps, setFPS] = useState(0);
  const frames = useRef(0);
  const last = useRef(performance.now());
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      frames.current += 1;
      const now = performance.now();
      const dt = now - last.current;
      if (dt >= 1000) {
        setFPS(Math.round((frames.current * 1000) / dt));
        frames.current = 0;
        last.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="fixed top-4 right-4 z-50 rounded bg-black/80 px-2 py-1 font-mono text-sm text-white">
      FPS: {fps}
    </div>
  );
};

const platformName = platform();
const isWindows = platformName === 'windows';

// Utility: rounded rect path
function pathRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

// Keyboard shortcuts
type KeyboardShortcutOptions = {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};
interface KeyCombo extends KeyboardShortcutOptions {
  key: string;
  callback: () => void;
}
function isShortcutMatch(event: KeyboardEvent, shortcut: KeyCombo): boolean {
  const { key, ctrlKey, altKey, shiftKey, metaKey } = shortcut;
  const keyMatches = event.key.toLowerCase() === key.toLowerCase();
  const ctrlMatches = !!ctrlKey === event.ctrlKey;
  const altMatches = !!altKey === event.altKey;
  const shiftMatches = !!shiftKey === event.shiftKey;
  const metaMatches = !!metaKey === event.metaKey;
  return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
}
function handleShortcutMatch(event: KeyboardEvent, shortcut: KeyCombo): void {
  const { preventDefault = true, stopPropagation = false, callback } = shortcut;
  if (preventDefault) event.preventDefault();
  if (stopPropagation) event.stopPropagation();
  callback();
}
function useKeyboardShortcut(shortcuts: KeyCombo[]) {
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const s of shortcutsRef.current)
        if (isShortcutMatch(e, s)) handleShortcutMatch(e, s);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}

// Main App (Canvas + HTML overlays)
export default function App() {
  const cards = useCardsStore((s) => s.cards);
  const updateCardMeta = useCardsStore((s) => s.updateCardMeta);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // camera in CSS px space: setTransform(dpr*z, 0, 0, dpr*z, dpr*x, dpr*y)
  const cameraRef = useRef({ x: 0, y: 0, z: 1 });
  const draggingRef = useRef(false);
  const dragLastRef = useRef({ x: 0, y: 0 });
  const hoveredIdRef = useRef<string | null>(null);

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useKeyboardShortcut([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => setOpenSheet((p) => !p),
    },
    {
      key: 'Escape',
      callback: () => {
        if (openSheet) setOpenSheet(false);
        else if (selectedCardId) {
          setSelectedCardId(null);
          requestDraw();
        }
      },
    },
  ]);

  // Draw scheduling
  const rafRef = useRef<number | null>(null);
  const heatRef = useRef(0); // frames of high-refresh drawing left
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const requestDraw = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, []);

  // Canvas resize observer
  useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      const el = viewportRef.current;
      if (!canvas || !el) return;
      const rect = el.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const needW = Math.max(1, Math.floor(rect.width * dpr));
      const needH = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== needW || canvas.height !== needH) {
        canvas.width = needW;
        canvas.height = needH;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        // Initialize low-latency 2D context once
        if (!ctxRef.current) {
          ctxRef.current =
            (canvas.getContext('2d', {
              alpha: false,
              desynchronized: true,
            } as any) as CanvasRenderingContext2D | null) ??
            canvas.getContext('2d');
        }
        heatRef.current = 30; // boost frames briefly after resize
        requestDraw();
      }
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [requestDraw]);

  // Helpers to convert coordinates
  const viewToWorld = (vx: number, vy: number) => {
    const { x, y, z } = cameraRef.current;
    return { wx: (vx - x) / z, wy: (vy - y) / z };
  };

  const getVisibleWorldRect = () => {
    const canvas = canvasRef.current;
    if (!canvas)
      return { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const { x, y, z } = cameraRef.current;
    const x0 = (0 - x) / z;
    const y0 = (0 - y) / z;
    const x1 = (cssW - x) / z;
    const y1 = (cssH - y) / z;
    return { x0, y0, x1, y1 };
  };

  const findCardAt = (vx: number, vy: number): Card | null => {
    const { wx, wy } = viewToWorld(vx, vy);
    // Reverse iteration for top-most hit
    for (let i = cards.length - 1; i >= 0; i -= 1) {
      const c = cards[i];
      if (
        wx >= c.position.x &&
        wy >= c.position.y &&
        wx <= c.position.x + c.size.width &&
        wy <= c.position.y + c.size.height
      ) {
        return c;
      }
    }
    return null;
  };

  // Pointer interactions (native listeners for perf and passive control)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const vx = e.clientX - rect.left;
        const vy = e.clientY - rect.top;
        const { wx, wy } = viewToWorld(vx, vy);

        const MIN_ZOOM = 0.25;
        const MAX_ZOOM = 3;
        const ZOOM_SPEED = 0.015;
        const current = cameraRef.current;
        const nextZ = Math.min(
          Math.max(
            current.z * Math.max(Math.exp(-e.deltaY * ZOOM_SPEED), MIN_ZOOM),
            MIN_ZOOM
          ),
          MAX_ZOOM
        );
        // Keep cursor anchored
        current.x = vx - nextZ * wx;
        current.y = vy - nextZ * wy;
        current.z = nextZ;
        heatRef.current = 30;
        requestDraw();
      } else {
        e.preventDefault();
        const current = cameraRef.current;
        current.x += -e.deltaX;
        current.y += -e.deltaY;
        heatRef.current = 30;
        requestDraw();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left only for panning/selecting
      const rect = el.getBoundingClientRect();
      dragLastRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      draggingRef.current = true;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const vx = e.clientX - rect.left;
      const vy = e.clientY - rect.top;
      if (draggingRef.current) {
        const last = dragLastRef.current;
        const dx = vx - last.x;
        const dy = vy - last.y;
        dragLastRef.current = { x: vx, y: vy };
        cameraRef.current.x += dx;
        cameraRef.current.y += dy;
        heatRef.current = 30;
        requestDraw();
      } else {
        // Hover detection only when not dragging
        const hit = findCardAt(vx, vy);
        const newHovered = hit?.id ?? null;
        if (newHovered !== hoveredIdRef.current) {
          hoveredIdRef.current = newHovered;
          heatRef.current = 10;
          requestDraw();
        }
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const vx = e.clientX - rect.left;
      const vy = e.clientY - rect.top;
      if (draggingRef.current) {
        // If mouse up with minimal movement, treat as click/select
        const last = dragLastRef.current;
        const moved = Math.hypot(vx - last.x, vy - last.y);
        if (moved < 3) {
          const hit = findCardAt(vx, vy);
          if (hit) {
            setSelectedCardId(hit.id);
            setOpenSheet(true);
          }
        }
      } else {
        const hit = findCardAt(vx, vy);
        if (hit) {
          setSelectedCardId(hit.id);
          setOpenSheet(true);
        }
      }
      draggingRef.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };

    // Use non-passive wheel to prevent default scrolling
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointerleave', onPointerUp);

    return () => {
      el.removeEventListener('wheel', onWheel as EventListener);
      el.removeEventListener('pointerdown', onPointerDown as EventListener);
      el.removeEventListener('pointermove', onPointerMove as EventListener);
      el.removeEventListener('pointerup', onPointerUp as EventListener);
      el.removeEventListener('pointerleave', onPointerUp as EventListener);
    };
  }, [cards]);

  // Draw loop
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current ?? canvas.getContext('2d');
    if (!ctx) return;

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (CSS pixels -> multiply by dpr for device pixels fill)
    ctx.fillStyle = '#d7d8dd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform (in device pixels)
    const { x, y, z } = cameraRef.current;
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * x, dpr * y);

    // Draw a subtle grid to give spatial feedback
    drawGrid(ctx, cssW / z, cssH / z);

    // Visible rect culling
    const vis = getVisibleWorldRect();

    // Draw cards
    for (let i = 0; i < cards.length; i += 1) {
      const c = cards[i];
      const x0 = c.position.x;
      const y0 = c.position.y;
      const w = c.size.width;
      const h = c.size.height;
      if (x0 > vis.x1 || y0 > vis.y1 || x0 + w < vis.x0 || y0 + h < vis.y0)
        continue;

      // Card body
      pathRoundedRect(ctx, x0, y0, w, h, 16);
      ctx.fillStyle = '#edeef3';
      ctx.fill();

      // Hover highlight
      if (hoveredIdRef.current === c.id) {
        ctx.lineWidth = 2 / z;
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();
      }

      // Title
      ctx.fillStyle = '#111827';
      ctx.font =
        '600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      ctx.textBaseline = 'top';
      ctx.fillText(c.title, x0 + 12, y0 + 12, w - 24);

      // Content
      ctx.fillStyle = '#374151';
      ctx.font =
        '400 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      const content = c.content;
      wrapText(ctx, content, x0 + 12, y0 + 36, w - 24, 16, 6);
    }
  };

  // Initial draw after mount
  useEffect(() => {
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  // Adaptive high-refresh render loop (aims for 120Hz on supporting displays)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (heatRef.current > 0) {
        draw();
        heatRef.current -= 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main
      className="relative flex h-screen transform-3d flex-col overflow-hidden bg-[#d7d8dd]"
      style={{ overscrollBehavior: 'none' }}
    >
      <FPSCounter />
      {isWindows && <Titlebar />}

      {/* viewport */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden rounded-3xl"
      >
        {/* Canvas layer */}
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Bottom sheet drawer */}
      <div
        className={
          'absolute inset-x-0 top-0 bottom-0 z-10 flex will-change-transform flex-col items-center overflow-hidden rounded-3xl bg-gray-100 pt-16 shadow-2xl duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]'
        }
        style={{
          transform: openSheet
            ? 'translate3d(0, 0, 0) scale(1)'
            : 'translate3d(0, 100%, 0) scale(0.96)',
          overscrollBehavior: 'none',
        }}
      >
        <SheetContent
          shouldFocus={openSheet}
          card={
            selectedCardId
              ? (cards.find((c) => c.id === selectedCardId) ?? null)
              : null
          }
          onUpdate={(data) => {
            if (!selectedCardId) return;
            updateCardMeta(selectedCardId, data);
            requestDraw();
          }}
        />
      </div>

      {/* Backdrop */}
      <div
        className={twMerge(
          'absolute inset-0 transition-opacity duration-500 ease-out bg-black/40',
          openSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{ backdropFilter: openSheet ? 'blur(6px)' : 'none' }}
      />
    </main>
  );
}

// Grid and text helpers
function drawGrid(
  ctx: CanvasRenderingContext2D,
  widthWorld: number,
  heightWorld: number
) {
  const step = 100;
  const minor = 20;
  const { a: scale } = ctx.getTransform(); // a ~ dpr*z
  const z = Math.max(0.1, Math.min(10, scale));
  ctx.save();
  ctx.lineWidth = 1 / z;

  // Minor grid
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.beginPath();
  for (let x = 0; x <= widthWorld; x += minor) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, heightWorld);
  }
  for (let y = 0; y <= heightWorld; y += minor) {
    ctx.moveTo(0, y);
    ctx.lineTo(widthWorld, y);
  }
  ctx.stroke();

  // Major grid
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  for (let x = 0; x <= widthWorld; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, heightWorld);
  }
  for (let y = 0; y <= heightWorld; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(widthWorld, y);
  }
  ctx.stroke();
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = words[i];
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        // Truncate last line
        const remaining = words.slice(i + 0).join(' ');
        ellipsize(
          ctx,
          `${line} ${remaining}`,
          x,
          y + lineCount * lineHeight,
          maxWidth
        );
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + lineCount * lineHeight);
}

function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  let str = text;
  while (ctx.measureText(str + '…').width > maxWidth && str.length > 0) {
    str = str.slice(0, -1);
  }
  ctx.fillText(str + '…', x, y);
}

// Drawer content (TipTap)
const Tiptap = ({
  shouldFocus,
  text,
  onTextChange,
}: {
  shouldFocus: boolean;
  text: string;
  onTextChange: (text: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Text,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Write something …' }),
    ],
    content: text,
    onUpdate: ({ editor }) => {
      // Extract plain text for the card's content
      onTextChange(editor.getText());
    },
  });

  // Keep editor content in sync when selection changes externally
  useEffect(() => {
    if (!editor) return;
    const current = editor.getText();
    if (current !== text) editor.commands.setContent(text || '');
  }, [text, editor]);

  useEffect(() => {
    if (shouldFocus && editor)
      editor.commands.focus('end', { scrollIntoView: false });
    else if (!shouldFocus && editor) editor.commands.blur();
  }, [shouldFocus, editor]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
};

function SheetContent({
  shouldFocus,
  card,
  onUpdate,
}: {
  shouldFocus: boolean;
  card: Card | null;
  onUpdate: (data: Partial<Omit<Card, 'position' | 'size'>>) => void;
}) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [content, setContent] = useState(card?.content ?? '');

  // When the selected card changes, sync local state
  useEffect(() => {
    setTitle(card?.title ?? '');
    setContent(card?.content ?? '');
  }, [card?.id]);

  // Push changes to store with rAF coalescing
  useEffect(() => {
    if (!card) return;
    const id = requestAnimationFrame(() => onUpdate({ title, content }));
    return () => cancelAnimationFrame(id);
  }, [title, content, card, onUpdate]);

  return (
    <div className="h-full w-1/2 contain-layout">
      <div className="mb-3 flex items-center justify-between gap-2 px-2">
        <input
          className="w-full rounded border border-gray-200 px-3 py-2 text-base outline-none focus:border-gray-400"
          placeholder={card ? 'Title' : 'No card selected'}
          disabled={!card}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="px-2">
        <div className="rounded border border-gray-200 p-2">
          <Tiptap
            shouldFocus={shouldFocus}
            text={content}
            onTextChange={(t) => setContent(t)}
          />
        </div>
      </div>
    </div>
  );
}

// Titlebar (Tauri window controls)
function Titlebar() {
  return (
    <div
      className="sticky top-0 right-0 left-0 flex h-10 items-center"
      data-tauri-drag-region
    >
      <div className="group flex items-center gap-2 px-4 font-mono">
        <button
          className="relative flex size-3 cursor-pointer items-center justify-center rounded-full bg-red-500 drop-shadow-black/5 drop-shadow-xs outline-none"
          id="titlebar-close"
          onClick={() => appWindow.close()}
          title="close"
          type="button"
        >
          <svg
            className="size-2 opacity-0 transition-opacity duration-300 group-hover:opacity-60"
            fill="none"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Close</title>
            <path
              d="M3 3L9 9M9 3L3 9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
        <button
          className="flex size-3 cursor-pointer items-center justify-center rounded-full bg-yellow-500 drop-shadow-black/5 drop-shadow-xs outline-none"
          id="titlebar-minimize"
          onClick={() => appWindow.minimize()}
          title="minimize"
          type="button"
        >
          <svg
            className="size-2 opacity-0 transition-opacity duration-300 group-hover:opacity-60"
            fill="none"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Minimize</title>
            <path
              d="M3 6H9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
        <button
          className="group flex size-3 cursor-pointer items-center justify-center rounded-full bg-green-500 drop-shadow-black/5 drop-shadow-xs outline-none"
          id="titlebar-maximize"
          onClick={() => appWindow.maximize()}
          title="maximize"
          type="button"
        >
          <svg
            className="size-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-60"
            fill="none"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Maximize</title>
            <path
              d="M6 3V9M3 6H9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

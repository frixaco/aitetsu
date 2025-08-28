import { twMerge } from 'tailwind-merge';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import { default as TiptapText } from '@tiptap/extension-text';
import {
  forwardRef,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { create } from 'zustand';
import './App.css';

const appWindow = getCurrentWindow();

const generateTestCards = (count: number): Card[] => {
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
    size: { width: 300, height: 280 },
  }));
};

const INITIAL_CARDS = generateTestCards(200);

type Card = {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

interface CardsState {
  activeTab: 'v1' | 'v2';
  cards: Card[];
  addCard: (card: Card) => void;
  updateCardMeta: (
    id: string,
    data: Partial<Omit<Card, 'position' | 'size'>>
  ) => void;
  setActiveTab: (tabId: 'v1' | 'v2') => void;
}

const useMainStore = create<CardsState>((set) => ({
  activeTab: 'v1',
  cards: INITIAL_CARDS,
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCardMeta: (id, data) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  setActiveTab: (tabId) => set(() => ({ activeTab: tabId })),
}));

const platformName = platform();
const isWindows = platformName === 'windows';

function App() {
  const [openSheet, setOpenSheet] = useState(false);

  useKeyboardShortcut([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => {
        console.log('opening sheet');
        setOpenSheet((p) => !p);
      },
    },
    {
      key: 'Escape',
      callback: () => {
        if (openSheet) {
          setOpenSheet(false);
        }
      },
    },
  ]);

  return (
    <main
      className="relative flex h-screen transform-3d flex-col overflow-hidden bg-[#d7d8dd]"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* <Debug /> */}
      {isWindows && <Titlebar />}

      {/* Viewport */}
      <Viewport />

      {/* Bottom sheet drawer */}
      <div
        className={
          'absolute inset-x-0 bottom-0 z-10 flex will-change-transform flex-col items-center overflow-hidden bg-gray-100 pt-16 shadow-2xl duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] rounded-3xl top-10'
        }
        style={{
          transform: openSheet
            ? 'translate3d(0, 0, 0) scale(1)'
            : 'translate3d(0, 100%, 0) scale(0.90)',
          overscrollBehavior: 'none',
        }}
      >
        <SheetContent shouldFocus={openSheet} />
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

function Viewport() {
  const cards = useMainStore((state) => state.cards);
  const cameraRef = useRef({ x: 0, y: 0, z: 1 });
  const targetCameraRef = useRef({ x: 0, y: 0, z: 1 });
  const rafRef = useRef<number>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scheduleCameraRender = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  };

  const tick = () => {
    if (!planeRef.current) return;

    const cam = cameraRef.current;
    const target = targetCameraRef.current;

    // Easing factor (0.2 = 20% of the distance per frame)
    const ease = 0.25;

    cam.x += (target.x - cam.x) * ease;
    cam.y += (target.y - cam.y) * ease;
    cam.z += (target.z - cam.z) * ease;

    planeRef.current.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.z})`;
    planeRef.current.style.transformOrigin = '0 0';

    updateVisibility();

    // Keep animating until close enough to target
    if (
      Math.abs(target.x - cam.x) > 0.1 ||
      Math.abs(target.y - cam.y) > 0.1 ||
      Math.abs(target.z - cam.z) > 0.001
    ) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  };

  const visibilityMapRef = useRef(new Map<string, boolean>());
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const updateVisibility = () => {
    if (!viewportRef.current) return;

    const vr = viewportRef.current.getBoundingClientRect();
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
  };

  const cardElements = useMemo(
    () =>
      cards.map((card) => (
        <Card
          ref={(el) => {
            if (el) cardRefs.current.set(card.id, el);
            else cardRefs.current.delete(card.id);
          }}
          card={card}
          key={card.id}
        />
      )),
    [cards]
  );

  useEffect(() => {
    scheduleCameraRender();
  }, [cards]);

  useLayoutEffect(() => {
    if (planeRef.current) {
      planeRef.current.style.transform = 'translate3d(0,0,0) scale(1)';
    }
    // run one RAF to “warm up”
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateVisibility();
        scheduleCameraRender();
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

  return (
    <div
      id="viewport"
      ref={viewportRef}
      className="relative flex-1 overflow-hidden"
      onWheel={(e) => {
        if (e.ctrlKey && viewportRef.current) {
          e.preventDefault();

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

          scheduleCameraRender();
        } else {
          e.preventDefault();
          targetCameraRef.current.x = cameraRef.current.x - e.deltaX;
          targetCameraRef.current.y = cameraRef.current.y - e.deltaY;
          scheduleCameraRender();
        }
      }}
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
      onPointerMove={(e) => {
        if (drag.current.id !== e.pointerId) return;
        if (e.buttons === 1 || e.buttons === 4) {
          const dx = e.clientX - drag.current.startX;
          const dy = e.clientY - drag.current.startY;
          targetCameraRef.current.x = drag.current.camX + dx;
          targetCameraRef.current.y = drag.current.camY + dy;
          scheduleCameraRender();
        }
      }}
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
        className="backface-hidden absolute top-0 left-0 will-change-transform"
        style={{
          // NOTE: already implemented via JS above
          // transitionDuration: '150ms',
          // transitionProperty: 'transform',
          // transitionTimingFunction: 'ease-out',
          transformOrigin: '0 0',
        }}
      >
        {/* cards */}
        {cardElements}
      </div>
    </div>
  );
}

function SheetContent({ shouldFocus }: { shouldFocus: boolean }) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TiptapText,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Write something …',
      }),
    ],
    content: '',
  });

  useEffect(() => {
    if (shouldFocus && editor) {
      editor.commands.focus('end', { scrollIntoView: false });
    } else if (!shouldFocus && editor) {
      editor.commands.blur();
    }
  }, [shouldFocus, editor]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <div className="w-1/2 h-full contain-layout">
      <EditorContext.Provider value={providerValue}>
        <EditorContent editor={editor} />
      </EditorContext.Provider>
    </div>
  );
}

const Card = memo(
  forwardRef<
    HTMLDivElement,
    {
      card: Card;
    }
  >(function Card({ card }, ref) {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={ref}
        className="absolute select-none h-72 w-48 bg-[#edeef3] rounded-3xl p-4 shadow-xl backface-hidden"
        style={{
          transform: `translate3d(${card.position.x}px, ${card.position.y}px, 0)`,
          scale: isHovered ? 1.02 : 1,
          transformOrigin: 'center center',
          transition: 'transform 150ms ease-in-out',
          // TODO: add only before animating: dragging
          // willChange: 'transform',
          contentVisibility: 'auto',
          containIntrinsicSize: '280px 192px', // fallback size (h x w)
        }}
      >
        <h1 className="font-bold text-lg">{card.title}</h1>
        <p className="">{card.content}</p>
      </div>
    );
  })
);

function Titlebar() {
  return (
    <div
      className="sticky top-0 right-0 left-0 flex h-10 items-center"
      style={{ backgroundColor: 'rgb(215, 216, 221)' }}
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

export function Debug() {
  const [fps, setFPS] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        setFPS(Math.round((frameCount.current * 1000) / deltaTime));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-mono z-50 flex flex-col items-center">
      <span>FPS: {fps}</span>

      <div className="flex gap-2">
        <button
          onClick={() => useMainStore.getState().setActiveTab('v1')}
          className="bg-gray-700 px-2 rounded-sm"
        >
          v1
        </button>
        <button
          onClick={() => useMainStore.getState().setActiveTab('v2')}
          className="bg-gray-700 px-2 rounded-sm"
        >
          v2
        </button>
      </div>
    </div>
  );
}

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

  if (preventDefault) {
    event.preventDefault();
  }
  if (stopPropagation) {
    event.stopPropagation();
  }
  callback();
}

function useKeyboardShortcut(shortcuts: KeyCombo[]) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcutsRef.current) {
        if (isShortcutMatch(event, shortcut)) {
          handleShortcutMatch(event, shortcut);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

export default App;

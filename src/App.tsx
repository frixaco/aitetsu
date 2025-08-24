import { twMerge } from 'tailwind-merge';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import './App.css';

const appWindow = getCurrentWindow();

const generateTestCards = (count: number): Card[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    title: `Card ${i + 1}`,
    content: `This is test card number ${i + 1}`,
    position: {
      x: (i % 10) * 250, // Grid layout
      y: Math.floor(i / 10) * 300,
    },
    size: { width: 200, height: 200 },
  }));
};

const INITIAL_CARDS = generateTestCards(200); // Test virtualization with 200 cards

type Card = {
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
  moveCard: (id: string, position: { x: number; y: number }) => void;
}

const useCardsStore = create<CardsState>((set, get) => ({
  cards: INITIAL_CARDS,
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCardMeta: (id, data) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  moveCard: (id, position) => {
    const c = get().cards.find((c) => c.id === id);
    if (c) c.position = position;
  },
}));

const FPSCounter = () => {
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
    <div className="fixed top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-mono z-50">
      FPS: {fps}
    </div>
  );
};

function App() {
  // For dragged cards
  function startDrag(el: HTMLElement) {
    el.style.willChange = 'transform';
    el.style.backfaceVisibility = 'hidden';
  }

  function endDrag(el: HTMLElement) {
    setTimeout(() => {
      el.style.willChange = 'auto';
      el.style.backfaceVisibility = '';
    }, 300);
  }

  const cards = useCardsStore((state) => state.cards);

  const cameraRef = useRef({ x: 0, y: 0, z: 1 });
  const rafRef = useRef<number | null>(null);
  const planeRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

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

  const scheduleCameraRender = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (!planeRef.current) return;
      const { x, y, z } = cameraRef.current;
      planeRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`;
      planeRef.current.style.transformOrigin = '0 0';

      rafRef.current = null;
    });
  };

  const cardElements = useMemo(
    () =>
      cards.map((card) => (
        <Card card={card} cameraRef={cameraRef} key={card.id} />
      )),
    [cards]
  );

  return (
    <main
      className="relative flex h-screen flex-col bg-[#d7d8dd] rounded-3xl overflow-hidden transform-3d"
      style={{ overscrollBehavior: 'none' }}
    >
      <FPSCounter />
      <Titlebar />

      {/* viewport */}
      <div
        id="viewport"
        ref={viewportRef}
        className="relative flex-1 overflow-hidden rounded-3xl"
        onWheel={(e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();

          const factor = e.deltaY < 0 ? 1.05 : 0.95;
          cameraRef.current.z *= factor;
          scheduleCameraRender();
        }}
        onPointerDown={(e) => {
          if (e.button === 0 && e.target.closest('#viewport')) {
            console.log('pointer down on plane');
          }
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) {
            const dx = e.movementX;
            const dy = e.movementY;

            cameraRef.current.x += dx;
            cameraRef.current.y += dy;
            scheduleCameraRender();
          }
        }}
        onPointerUp={(e) => {}}
        onPointerCancel={(e) => {}}
      >
        {/* plane */}
        <div
          id="plane"
          ref={planeRef}
          className="backface-hidden absolute top-0 left-0 will-change-transform"
          style={{
            transformOrigin: '0 0',
          }}
        >
          {/* cards */}
          {cardElements}
        </div>
      </div>

      <div
        className={twMerge(
          'absolute inset-x-0 top-0 bottom-0 will-change-transform duration-400 bg-gray-100 rounded-3xl overflow-hidden flex flex-col items-center pt-16 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-2xl z-10'
          // openSheet
          //   ? 'translate-y-0 scale-100'
          //   : 'translate-y-full scale-[0.96]'
        )}
        style={{
          transform: openSheet
            ? 'translate3d(0, 0, 0) scale(1)'
            : 'translate3d(0, 100%, 0) scale(0.96)',
          overscrollBehavior: 'none',
        }}
      >
        <SheetContent shouldFocus={openSheet} />
      </div>

      <div
        className={twMerge(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-out',
          openSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
    </main>
  );
}

const Tiptap = ({ shouldFocus }: { shouldFocus: boolean }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Text,
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
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </EditorContext.Provider>
  );
};
function SheetContent({ shouldFocus }: { shouldFocus: boolean }) {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="w-1/2 h-full contain-layout">
      <Tiptap shouldFocus={shouldFocus} />
      {/* <h1 className="font-bold text-3xl pb-4">Hello World</h1> */}
      {/* <p>Testing card sheet drawer or whatever this is</p> */}
    </div>
  );
}

const Card = memo(
  forwardRef<
    HTMLDivElement,
    {
      card: Card;
      cameraRef: React.MutableRefObject<{ x: number; y: number; z: number }>;
    }
  >(function Card({ card, cameraRef }, ref) {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={ref}
        className="absolute select-none h-72 w-48 rounded-3xl bg-[#edeef3] p-4 drop-shadow-xl will-change-transform"
        style={{
          transform: `translate3d(${card.position.x}px, ${card.position.y}px, 0) scale(${isHovered ? 1.02 : 1})`,
          transformOrigin: 'center center',
          transition: 'transform 150ms ease-in-out',
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

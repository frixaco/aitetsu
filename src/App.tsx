import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { createPortal } from 'react-dom';

const appWindow = getCurrentWindow();

type Card = {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

type Camera = {
  x: number;
  y: number;
  z: number;
};

function App() {
  // For dragged card
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

  const [cards, setCards] = useState<Card[]>([
    {
      id: crypto.randomUUID(),
      title: 'New Card',
      content: 'This is a new card',
      position: { x: 0, y: 0 },
      size: { width: 200, height: 200 },
    },
  ]);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, z: 1 });

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
    <main className="relative flex h-screen flex-col bg-[#d7d8dd] rounded-3xl overflow-hidden">
      <Titlebar />
      {/* viewport */}
      <div className="relative flex-1 overflow-hidden rounded-3xl">
        {/* plane */}
        <div
          className="backface-hidden absolute top-0 left-0 will-change-transform"
          style={{
            transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.z})`,
            transformOrigin: '0 0',
          }}
        >
          {/* card */}
          {cards.map((card) => (
            <Card card={card} key={card.id} />
          ))}
        </div>
      </div>

      <div
        className="absolute inset-x-0 top-0 bottom-0 will-change-transform ease-out duration-500 bg-gray-100 rounded-3xl overflow-hidden flex flex-col items-center pt-16"
        style={{
          transform: openSheet ? `translateY(0%)` : 'translateY(100%)',
        }}
      >
        <div className="w-1/2 h-full">
          <h1 className="font-bold text-3xl pb-4">Hello World</h1>
          <p>Testing card sheet drawer or whatever this is</p>
        </div>
      </div>
    </main>
  );
}

function Card({ card }: { card: Card }) {
  return (
    <div className="absolute top-4 left-4 h-72 w-48 rounded-3xl bg-[#edeef3] p-4 drop-shadow-xl duration-150 will-change-transform hover:scale-101 hover:ease-in-out">
      <h1 className="font-bold text-lg">{card.title}</h1>
      <p className="">{card.content}</p>
    </div>
  );
}

function Titlebar() {
  return (
    <div
      className="sticky top-0 right-0 left-0 flex h-8 items-center"
      data-tauri-drag-region
    >
      <div className="group flex items-center gap-2 px-4 font-mono">
        <button
          className="relative flex size-3 cursor-pointer items-center justify-center rounded-full bg-red-500 drop-shadow-black/5 drop-shadow-xs"
          id="titlebar-close"
          onClick={() => appWindow.close()}
          title="close"
          type="button"
        >
          <svg
            className="size-2 opacity-0 transition-opacity duration-300 group-hover:opacity-40"
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
          className="flex size-3 cursor-pointer items-center justify-center rounded-full bg-yellow-500 drop-shadow-black/5 drop-shadow-xs"
          id="titlebar-minimize"
          onClick={() => appWindow.minimize()}
          title="minimize"
          type="button"
        >
          <svg
            className="size-2 opacity-0 transition-opacity duration-300 group-hover:opacity-50"
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
          className="group flex size-3 cursor-pointer items-center justify-center rounded-full bg-green-500 drop-shadow-black/5 drop-shadow-xs"
          id="titlebar-maximize"
          onClick={() => appWindow.maximize()}
          title="maximize"
          type="button"
        >
          <svg
            className="size-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-50"
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

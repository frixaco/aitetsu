import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { create } from 'zustand';
import './App-v2.css';

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

const useMainStore = create<CardsState>((set, get) => ({
  activeTab: 'v1',
  cards: INITIAL_CARDS,
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCardMeta: (id, data) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  setActiveTab: (tabId) => set(() => ({ activeTab: tabId })),
}));

const Debug = () => {
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
};

const platformName = platform();
const isWindows = platformName === 'windows';

function App() {
  return (
    <main
      className="relative flex h-screen transform-3d flex-col overflow-hidden bg-[#d7d8dd]"
      style={{ overscrollBehavior: 'none' }}
    >
      <InfiniteCanvas />
    </main>
  );
}

export default App;

interface Point {
  x: number;
  y: number;
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const InfiniteCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Calculate visible cards based on viewport
  const visibleCards = useMemo(() => {
    const cardWidth = 200;
    const cardHeight = 300;
    const cardsPerRow = 10;
    const cardSpacing = 20;

    // Calculate viewport bounds in world coordinates
    const viewLeft = -viewState.offsetX / viewState.scale;
    const viewTop = -viewState.offsetY / viewState.scale;
    const viewRight = viewLeft + window.innerWidth / viewState.scale;
    const viewBottom = viewTop + window.innerHeight / viewState.scale;

    const visible = [];
    for (let i = 0; i < 200; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;

      const x = col * (cardWidth + cardSpacing);
      const y = row * (cardHeight + cardSpacing);

      // Check if card is in viewport (with small margin)
      if (
        x + cardWidth >= viewLeft - 50 &&
        x <= viewRight + 50 &&
        y + cardHeight >= viewTop - 50 &&
        y <= viewBottom + 50
      ) {
        visible.push({ id: i, x, y, row, col });
      }
    }
    return visible;
  }, [viewState]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(viewState.offsetX, viewState.offsetY);
      ctx.scale(viewState.scale, viewState.scale);

      // Draw grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1 / viewState.scale;

      const gridSize = 50;
      const startX =
        Math.floor(-viewState.offsetX / viewState.scale / gridSize) * gridSize;
      const endX = startX + canvas.width / viewState.scale + gridSize;
      const startY =
        Math.floor(-viewState.offsetY / viewState.scale / gridSize) * gridSize;
      const endY = startY + canvas.height / viewState.scale + gridSize;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Draw visible cards only
      const cardWidth = 200;
      const cardHeight = 300;

      const drawCardText = (
        cardX: number,
        cardY: number,
        cardNum: number,
        simplified = false
      ) => {
        if (simplified) {
          // Simplified text for fast panning
          ctx.fillStyle = '#1a1a1a';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`Task ${cardNum}`, cardX + 10, cardY + 25);
          ctx.fillStyle = '#666666';
          ctx.font = '10px sans-serif';
          ctx.fillText('...', cardX + 10, cardY + 45);
          return;
        }

        const baseFont = 10;
        const lineHeight = baseFont * 1.4;
        const margin = 10;
        let currentY = cardY + margin + baseFont;

        ctx.textAlign = 'left';

        // Header 1
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold ${baseFont * 1.2}px sans-serif`;
        ctx.fillText(`Task ${cardNum}`, cardX + margin, currentY);
        currentY += lineHeight * 1.5;

        // Header 2
        ctx.font = `bold ${baseFont}px sans-serif`;
        ctx.fillText('Overview', cardX + margin, currentY);
        currentY += lineHeight * 1.2;

        // Paragraph 1
        ctx.fillStyle = '#333333';
        ctx.font = `${baseFont}px sans-serif`;
        const text1 = `This is a detailed description of task ${cardNum}. It contains important information.`;
        const words1 = text1.split(' ');
        let line = '';
        for (const word of words1) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > cardWidth - margin * 2 && line !== '') {
            ctx.fillText(line, cardX + margin, currentY);
            currentY += lineHeight;
            line = word + ' ';
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(line, cardX + margin, currentY);
          currentY += lineHeight * 1.5;
        }

        // Header 3
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold ${baseFont}px sans-serif`;
        ctx.fillText('Requirements', cardX + margin, currentY);
        currentY += lineHeight * 1.2;

        // List 1
        ctx.fillStyle = '#333333';
        ctx.font = `${baseFont}px sans-serif`;
        const listItems1 = [
          'High priority',
          'Must be completed',
          'Requires review',
        ];
        for (const item of listItems1) {
          ctx.fillText(`• ${item}`, cardX + margin, currentY);
          currentY += lineHeight;
        }
        currentY += lineHeight * 0.5;

        // Paragraph 2 with bold/italic
        const text2 = 'Implementation notes: ';
        ctx.fillText(text2, cardX + margin, currentY);
        const boldText = 'critical section';
        const italicText = ' needs attention';

        const textWidth = ctx.measureText(text2).width;
        ctx.font = `bold ${baseFont}px sans-serif`;
        ctx.fillText(boldText, cardX + margin + textWidth, currentY);

        const boldWidth = ctx.measureText(boldText).width;
        ctx.font = `italic ${baseFont}px sans-serif`;
        ctx.fillText(
          italicText,
          cardX + margin + textWidth + boldWidth,
          currentY
        );
        currentY += lineHeight * 1.5;

        // List 2
        ctx.font = `${baseFont}px sans-serif`;
        const listItems2 = ['Step 1: Analysis', 'Step 2: Design'];
        for (const item of listItems2) {
          ctx.fillText(`→ ${item}`, cardX + margin, currentY);
          currentY += lineHeight;
        }
      };

      // Only render visible cards with simplified text during dragging
      for (const card of visibleCards) {
        const { x, y, id } = card;

        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, cardWidth, cardHeight);

        // Card border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2 / viewState.scale;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        // Draw text content (simplified when dragging for performance)
        drawCardText(x, y, id + 1, isDragging);
      }

      ctx.restore();
    },
    [viewState, isDragging, visibleCards]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw(ctx, canvas);
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, canvas);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      // Left or middle mouse button
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    // Use requestAnimationFrame for smooth panning
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setViewState((prev) => ({
        ...prev,
        offsetX: prev.offsetX + deltaX,
        offsetY: prev.offsetY + deltaY,
      }));
    });

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      // Left or middle mouse button
      setIsDragging(false);
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const scaleMultiplier = 1.1;
    const newScale =
      e.deltaY > 0
        ? viewState.scale / scaleMultiplier
        : viewState.scale * scaleMultiplier;

    // Clamp scale between reasonable limits
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    // Calculate zoom point to zoom towards mouse cursor
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new offset to zoom towards cursor
    const scaleDiff = clampedScale / viewState.scale;
    const newOffsetX = mouseX - (mouseX - viewState.offsetX) * scaleDiff;
    const newOffsetY = mouseY - (mouseY - viewState.offsetY) * scaleDiff;

    setViewState({
      scale: clampedScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent right-click context menu
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
};

import React, { useRef, useEffect, useState, useCallback } from 'react';

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
    offsetY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / viewState.scale;
    
    const gridSize = 50;
    const startX = Math.floor(-viewState.offsetX / viewState.scale / gridSize) * gridSize;
    const endX = startX + (canvas.width / viewState.scale) + gridSize;
    const startY = Math.floor(-viewState.offsetY / viewState.scale / gridSize) * gridSize;
    const endY = startY + (canvas.height / viewState.scale) + gridSize;
    
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
    
    // Draw 200 cards in a grid
    const cardWidth = 200;
    const cardHeight = 300;
    const cardsPerRow = 10;
    const cardSpacing = 20;
    
    const drawCardText = (cardX: number, cardY: number, cardNum: number) => {
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
      const listItems1 = ['High priority', 'Must be completed', 'Requires review'];
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
      ctx.fillText(italicText, cardX + margin + textWidth + boldWidth, currentY);
      currentY += lineHeight * 1.5;
      
      // List 2
      ctx.font = `${baseFont}px sans-serif`;
      const listItems2 = ['Step 1: Analysis', 'Step 2: Design'];
      for (const item of listItems2) {
        ctx.fillText(`→ ${item}`, cardX + margin, currentY);
        currentY += lineHeight;
      }
    };
    
    for (let i = 0; i < 200; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      
      const x = col * (cardWidth + cardSpacing);
      const y = row * (cardHeight + cardSpacing);
      
      // Card background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cardWidth, cardHeight);
      
      // Card border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2 / viewState.scale;
      ctx.strokeRect(x, y, cardWidth, cardHeight);
      
      // Draw rich text content
      drawCardText(x, y, i + 1);
    }
    
    ctx.restore();
  }, [viewState]);

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
    if (e.button === 0 || e.button === 1) { // Left or middle mouse button
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setViewState(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) { // Left or middle mouse button
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const scaleMultiplier = 1.1;
    const newScale = e.deltaY > 0 
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
      offsetY: newOffsetY
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
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
};

export default InfiniteCanvas;

import { memo, useState } from 'react';
import { type Card as CardType } from './store';

export const Card = memo(function Card({ card }: { card: CardType }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!card) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute select-none pointer-events-auto"
      style={{
        height: card.height,
        width: card.width,
        transform: `translate(${card.x}px, ${card.y}px)`,
        willChange: 'transform',
      }}
    >
      <div
        // Inner div handles SCALING and STYLING
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-full w-full bg-[#edeef3] rounded-3xl p-4 shadow-xl"
        style={{
          transform: `scale(${isHovered ? 1.02 : 1})`,
          transition: 'transform 150ms ease-in-out',
          // you can keep these here
          contentVisibility: 'auto',
          containIntrinsicSize: '192px 280px',
        }}
      >
        <h1 className="font-bold text-lg">{card.title}</h1>
        <p className="">{card.content}</p>
      </div>
    </div>
  );
});

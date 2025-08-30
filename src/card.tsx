import { forwardRef, memo, useState } from 'react';
import { useMainStore } from './store';

export const Card = memo(
  forwardRef<
    HTMLDivElement,
    {
      id: string;
    }
  >(function Card({ id }, ref) {
    const card = useMainStore((state) => state.cardsMap.get(id)!);
    const [isHovered, setIsHovered] = useState(false);

    if (!card) {
      return null;
    }

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={ref}
        className="absolute select-none h-72 w-48 bg-[#edeef3] rounded-3xl p-4 shadow-xl backface-hidden origin-center"
        style={{
          transform: `translate(${card.position.x}px, ${card.position.y}px) scale(${isHovered ? 1.02 : 1})`,
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

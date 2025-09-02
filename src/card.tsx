import { memo } from 'react';
import { type Card as CardType } from './store';

// const LOD_THRESHOLD = 0.4;

export const Card = memo(function Card({
  card,
  // zoom,
}: {
  card: CardType;
  // zoom: number;
}) {
  if (!card) {
    return null;
  }

  // if (zoom < LOD_THRESHOLD) {
  //   return (
  //     <div
  //       className="absolute select-none pointer-events-auto bg-[#edeef3] rounded-3xl"
  //       style={{
  //         height: card.height,
  //         width: card.width,
  //         transform: `translate(${card.x}px, ${card.y}px)`,
  //       }}
  //     >
  //       <div
  //         className="h-full w-full bg-[#edeef3] rounded-3xl p-4"
  //         style={{
  //           contentVisibility: 'auto',
  //           containIntrinsicSize: '192px 280px',
  //         }}
  //       >
  //         <h1 className="font-bold text-lg">{card.title}</h1>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className="absolute select-none pointer-events-auto"
      style={{
        height: card.height,
        width: card.width,
        transform: `translate(${card.x}px, ${card.y}px)`,
        willChange: 'transform',
        contain: 'layout style',
      }}
    >
      <div
        className="h-full w-full bg-[#edeef3] rounded-3xl p-4 shadow-xl hover:scale-105 duration-150 ease-in"
        style={{
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

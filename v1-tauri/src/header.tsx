import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { twMerge } from 'tailwind-merge';

// const toOptionalFixed = (num, digits) =>
//   `${Number.parseFloat(num.toFixed(digits))}`;

export function Header() {
  const cwd = useChatStore(useShallow((state) => state.cwd));

  const contextWindow = 1_000_000;
  const usage = useChatStore(useShallow((state) => state.usage));
  const totalTokensUsed = 500_500; //usage.totalTokens;
  const usagePercent = Math.ceil((100 * totalTokensUsed) / contextWindow);

  const isRunning = false;

  return (
    <div className="relative w-full pt-2 z-1000 tracking-wide cursor-pointer select-none bg-[#212121] flex items-center justify-between">
      <div data-tauri-drag-region className="absolute inset-0 pt-2" />

      {/* <div className="text-[#f9f9f9] font-semibold whitespace-nowrap w-1/3 overflow-clip pointer-events-auto text-xs">
        <span>{cwd}</span>
      </div> */}

      <div className="w-auto bg-[#0c0c0c] light-out-2 px-3 py-1 rounded-md pointer-events-none flex items-center gap-2">
        <span
          className={twMerge(
            // "size-[0.875rem] bg-[#c03031]",
            'size-[0.875rem] bg-[#c03031] opacity-30 rounded-full',
            isRunning && 'bg-[#c03031] animate-blip'
            // isRunning && "bg-[#35c030]"
          )}
        ></span>
        <p className="text-xs drop-shadow-sm text-[#e4e4e4] font-mono">
          <span>a</span>
          <span>i</span>
          <span>t</span>
          <span>e</span>
          <span>t</span>
          <span>s</span>
          <span>u</span>
        </p>
      </div>

      <div className="bg-[#0c0c0c] light-out-2 px-3 py-1 rounded-md justify-end items-center flex gap-2 pointer-events-auto">
        <ContextWindowStatus percent={usagePercent} />

        <span
          className={twMerge(
            'text-[#aaaaaa] cursor-help text-xs',
            usagePercent > 70 && 'text-[#c03031]',
            usagePercent > 50 && usagePercent < 70 && 'text-[#c06a30]'
          )}
          title={`${totalTokensUsed} / ${contextWindow} tokens used`}
        >
          {usagePercent}%
        </span>
      </div>
    </div>
  );
}

function ContextWindowStatus({ percent }: { percent: number }) {
  let activeBars = Math.ceil((10 * percent) / 100) - 1;
  if (activeBars <= 0) {
    activeBars = 1;
  }

  const nonActiveBars = 10 - activeBars - 1;

  return (
    <div className="flex gap-[0.125rem]">
      {Array(activeBars)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-2 w-px bg-[#666666]"></div>
        ))}

      {/* TODO: as it fills up, turn it into red more */}
      <div
        className={twMerge(
          'h-2 w-0.5 bg-[#aaaaaa]',
          percent > 70 && 'bg-[#c03031]',
          percent > 50 && percent < 70 && 'bg-[#c06a30]'
        )}
      ></div>
      {/* <div className="h-2 w-0.5 bg-[#f7f7f7]"></div> */}

      {Array(nonActiveBars)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-2 w-px bg-[#2d2d2d]"></div>
        ))}
    </div>
  );
}

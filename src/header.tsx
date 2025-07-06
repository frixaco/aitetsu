import { useShallow } from "zustand/shallow";
import { useChatStore } from "./store";

// const toOptionalFixed = (num, digits) =>
//   `${Number.parseFloat(num.toFixed(digits))}`;

export function Header() {
  const cwd = useChatStore(useShallow((state) => state.cwd));

  const contextWindow = 1_000_000;
  const usage = useChatStore(useShallow((state) => state.usage));
  const totalTokensUsed = 500_500; //usage.totalTokens;
  const usagePercent = Math.ceil((100 * totalTokensUsed) / contextWindow);

  return (
    <div className="relative h-12 w-full z-1000 px-6 tracking-wide cursor-pointer py-1 select-none bg-[#212121] bottom-sh flex items-center justify-between">
      <div data-tauri-drag-region className="absolute inset-0" />

      {/* <div className="text-[#f9f9f9] font-semibold whitespace-nowrap w-1/3 overflow-clip pointer-events-auto text-xs">
        <span>{cwd}</span>
      </div> */}

      <div className="w-1/3 pointer-events-auto">
        <p className="text-sm drop-shadow-sm text-[#e4e4e4] font-sans tracking-[0.16em] uppercase font-semibold">
          <span>a</span>
          <span>i</span>
          <span>t</span>
          <span>e</span>
          <span>t</span>
          <span>s</span>
          <span>u</span>
        </p>
      </div>

      <div className="bg-[#0c0c0c] light-out-2 px-3 py-1 rounded-md justify-end items-center flex gap-3 pointer-events-auto">
        <ContextWindowStatus percent={usagePercent} />

        <span
          className="text-[#666666] cursor-help text-xs font-mono"
          title={`${totalTokensUsed} / ${contextWindow} tokens used`}
        >
          {usagePercent}%
        </span>
      </div>
    </div>
  );
}

function ContextWindowStatus({ percent }: { percent: number }) {
  let activeBars = Math.ceil((15 * percent) / 100) - 1;
  if (activeBars <= 0) {
    activeBars = 1;
  }

  const nonActiveBars = 15 - activeBars - 1;

  return (
    <div className="flex gap-[0.125rem]">
      {Array(activeBars)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-2 w-px bg-[#666666]"></div>
        ))}

      {/* TODO: as it fills up, turn it into red more */}
      <div className="h-2 w-0.5 bg-[#666666]"></div>
      {/* <div className="h-2 w-0.5 bg-[#f7f7f7]"></div> */}

      {Array(nonActiveBars)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-2 w-px bg-[#2d2d2d]"></div>
        ))}
    </div>
  );
}

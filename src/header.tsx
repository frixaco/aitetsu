import { useShallow } from "zustand/shallow";
import { useChatStore } from "./store";
import { Aitetsu } from "./aitetsu";

export function Header() {
  const cwd = useChatStore(useShallow((state) => state.cwd));

  return (
    <div className="relative h-7 w-full px-2 cursor-pointer py-1 select-none border-b border-b-ctp-mauve flex items-center justify-between">
      <div data-tauri-drag-region className="absolute inset-0" />

      <div className="w-1/3">
        <Aitetsu />
      </div>

      <div className="text-ctp-blue whitespace-nowrap w-1/3 text-center overflow-clip">
        <span>{cwd}</span>
      </div>

      <div className="w-1/3 justify-end items-center flex gap-3 text-xs font-mono font-sm">
        <span className="text-ctp-subtext0">1000 / 200,000</span>
      </div>
    </div>
  );
}

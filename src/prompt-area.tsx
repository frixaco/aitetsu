import { useEffect, useRef, useState } from "react";
import { FileDirPicker } from "./file-dir-picker";
import { useDebounce } from "./utils";
import { useChat } from "./useChat";

export function PromptArea() {
  const [inputValue, setInputValue] = useState("");
  const prompt = useDebounce(inputValue, 300);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    promptInputRef.current?.focus();
  }, []);

  const [pickerValue, setPickerValue] = useState("");

  const pickerActive = prompt.lastIndexOf("@") !== -1;
  const searchTerm = !pickerActive
    ? null
    : prompt.slice(prompt.lastIndexOf("@") + 1);

  const { start } = useChat();

  return (
    <div className="h-48 relative top-sh w-full px-6 py-4 bg-[#212121] ">
      {pickerActive && (
        <FileDirPicker
          searchTerm={searchTerm}
          onInput={(v) => setPickerValue(v)}
        />
      )}

      <textarea
        ref={promptInputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        onKeyDown={async (e) => {
          const key = e.key;

          if (key === "Enter" && pickerActive) {
            e.preventDefault();
            const i = inputValue.lastIndexOf("@");
            const path = inputValue.slice(0, i) + pickerValue;
            setInputValue(path);
          }

          if (e.metaKey && key === "Enter") {
            e.preventDefault();
            setInputValue("");

            await start(prompt);
          }
        }}
        className="bg-inherit size-full px-2 py-1 outline-none"
        autoFocus
      />
    </div>
  );
}

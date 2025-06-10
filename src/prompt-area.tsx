import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { FileDirPicker } from "./file-dir-picker";
import { useDebounce } from "./utils";
import { ChatMessage, Role, StreamEvent, useChatStore } from "./store";

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

  return (
    <div className="h-32 relative w-full p-2">
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
            console.log("asldajslkdj");
            e.preventDefault();
            const messages: ChatMessage[] = [
              {
                role: Role.SYSTEM,
                content: useChatStore.getState().systemPrompt,
              },
              ...useChatStore.getState().messages,
              {
                role: Role.USER,
                content: prompt,
              },
            ];

            const onEvent = new Channel<StreamEvent>();
            onEvent.onmessage = (message) => {
              console.log(message.data);
            };

            await invoke("call_llm", {
              messages,
              onEvent,
            });
          }
        }}
        className="bg-ctp-base size-full px-2 py-1 text-ctp-pink border rounded border-ctp-surface2 focus:border-ctp-mauve outline-none"
        autoFocus
      />
    </div>
  );
}

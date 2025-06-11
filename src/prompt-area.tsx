import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { FileDirPicker } from "./file-dir-picker";
import { useDebounce } from "./utils";
import {
  ChatMessage,
  FinishReason,
  Role,
  StreamEvent,
  useChatStore,
} from "./store";
import { useShallow } from "zustand/shallow";

export function PromptArea() {
  const addMessages = useChatStore(useShallow((state) => state.addMessage));
  const updateLastMessage = useChatStore(
    useShallow((state) => state.updateLastMessage)
  );

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
            e.preventDefault();
            setInputValue("");

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
              console.log(
                `${message.event} ${JSON.stringify(message.data, null, 2)}`
              );
              if (message.event === "started") {
                useChatStore.getState().generating = true;
              }

              if (message.event === "finished") {
                if (message.data.reason === FinishReason.Stop) {
                  console.log("Stopping cuz Stop");
                  useChatStore.getState().generating = false;

                  if (!message.data.usage) {
                    throw new Error(
                      "No usage reported. This shouldn't happen?"
                    );
                  }
                  useChatStore.getState().updateUsage(message.data.usage);

                  const lastMessage = useChatStore.getState().lastMessage;
                  if (lastMessage) {
                    useChatStore.getState().updateLastMessage(null);
                    addMessages({
                      role: lastMessage.role,
                      content: lastMessage.content || "",
                    });
                  }
                }

                if (message.data.reason === FinishReason.ToolCalls) {
                  console.log("Stopping cuz ToolCalls");
                  const lastMessage = useChatStore.getState().lastMessage;
                  addMessages({
                    role: Role.ASSISTANT,
                    content: lastMessage?.content + "\n\nCALLING TOOLS\n",
                  });
                }
              }

              if (message.event === "delta") {
                if (message.data.role === Role.ASSISTANT) {
                  updateLastMessage({
                    role: Role.ASSISTANT,
                    content: message.data.content || "",
                  });
                }

                // TODO: improve the check for tool_calls(?)
                if (message.data.role === Role.TOOL) {
                  // if (message.data.tool_calls) {
                  //   addMessages({
                  //     role: Role.ASSISTANT,
                  //     content:
                  //       useChatStore.getState().lastMessage?.content || "",
                  //   });
                  //   updateLastMessage({
                  //     role: Role.TOOL,
                  //     // TODO: improve this as well
                  //     content: `Running ${message.data.tool_calls[0]}`,
                  //   });
                  // } else {
                  //   // Only add "Finished running tools" message if there's a current tool message
                  //   const lastMessage = useChatStore.getState().lastMessage;
                  //   if (lastMessage?.role === Role.TOOL && lastMessage.content?.startsWith("Running")) {
                  //     addMessages({
                  //       role: Role.TOOL,
                  //       content: `Finished running tools`,
                  //     });
                  //     updateLastMessage({
                  //       role: Role.ASSISTANT,
                  //       content: "",
                  //     });
                  //   }
                  // }
                }
              }
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

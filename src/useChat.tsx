import { Channel, invoke } from "@tauri-apps/api/core";
import {
  addMessage,
  ChatMessage,
  FinishReason,
  Role,
  setGenerating,
  setToolStatus,
  StreamEvent,
  updateLastMessage,
  updateUsage,
  useChatStore,
} from "./store";
import { useCallback } from "react";

export function useChat() {
  const start = useCallback(async (prompt: string) => {
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
      console.log(`${message.event} ${JSON.stringify(message.data, null, 2)}`);

      const lastMessage = useChatStore.getState().lastMessage;

      if (message.event === "started") {
        setGenerating(true);
      }

      if (message.event === "finished") {
        if (message.data.reason === FinishReason.Stop) {
          setGenerating(false);
          setToolStatus({
            name: null,
            active: false,
          });

          if (message.data.usage) {
            updateUsage(message.data.usage);
          }

          addMessage({
            role: lastMessage!.role,
            content: lastMessage!.content || "",
          });
          updateLastMessage(null);
        }

        if (message.data.reason === FinishReason.ToolCalls) {
          // addMessage({
          //   role: Role.ASSISTANT,
          //   content: lastMessage?.content + "\n\nCALLING TOOLS\n",
          // });
        }
      }

      if (message.event === "delta") {
        if (message.data.role === Role.ASSISTANT) {
          if (useChatStore.getState().toolStatus.active) {
            setToolStatus({
              name: null,
              active: false,
            });
          }
          updateLastMessage({
            role: Role.ASSISTANT,
            content: message.data.content || "",
          });
        }

        if (message.data.role === Role.TOOL) {
          addMessage({
            role: lastMessage!.role,
            content: lastMessage!.content || "",
          });

          setToolStatus({
            name: message.data.toolCalls![0],
            active: true,
          });

          updateLastMessage({
            role: Role.TOOL,
            content: `RUNNING ${message.data.toolCalls![0]}`,
          });
        }
      }
    };

    await invoke("call_llm", {
      messages,
      onEvent,
    });
  }, []);

  return { start };
}

import { Channel, invoke } from "@tauri-apps/api/core";
import {
  addMessage,
  ChatMessage,
  FinishReason,
  NonStreamEvent,
  Role,
  setGenerating,
  setToolStatus,
  updateLastMessage,
  updateUsage,
  useChatStore,
} from "./store";
import { useCallback } from "react";

export function useChat() {
  const start = useCallback(async (prompt: string) => {
    const history = useChatStore.getState().messages;
    console.log("HISTORY: ", history);

    const messages: ChatMessage[] = [
      {
        role: Role.SYSTEM,
        content: useChatStore.getState().systemPrompt,
      },
      ...history,
      {
        role: Role.USER,
        content: prompt,
      },
    ];

    addMessage({
      role: Role.USER,
      content: prompt,
    });

    // const onEvent = new Channel<StreamEvent>();
    const onEvent = new Channel<NonStreamEvent>();
    onEvent.onmessage = (message) => {
      console.log(`${message.event} ${JSON.stringify(message.data, null, 2)}`);

      const lastMessage = useChatStore.getState().lastMessage;

      if (message.event === "started") {
        setGenerating(true);
      }

      if (message.event === "usage") {
        updateUsage(message.data.usage);
      }

      if (message.event === "finished") {
        if (message.data.reason === FinishReason.Stop) {
          setGenerating(false);
          setToolStatus({
            name: null,
            active: false,
          });

          if (message.data.response) {
            addMessage({
              role: message.data.response.role,
              content: message.data.response.content,
              toolCalls: message.data.response.toolCalls,
            });
            updateLastMessage(null);
          }
        }

        if (message.data.reason === FinishReason.ToolCalls) {
          addMessage({
            role: Role.ASSISTANT,
            content:
              "CALLING TOOLS: " + message.data.response?.toolCalls!.join(", "),
          });
        }
      }

      // if (message.event === "delta") {
      //   if (message.data.role === Role.ASSISTANT) {
      //     if (useChatStore.getState().toolStatus.active) {
      //       addMessage({
      //         role: Role.TOOL,
      //         content: `FINISHED RUNNING ${
      //           useChatStore.getState().toolStatus.name
      //         }`,
      //       });

      //       setToolStatus({
      //         name: null,
      //         active: false,
      //       });
      //     }
      //     updateLastMessage({
      //       role: Role.ASSISTANT,
      //       content: message.data.content || "",
      //     });
      //   }

      //   if (message.data.role === Role.TOOL) {
      //     if (lastMessage?.content) {
      //       addMessage({
      //         role: lastMessage.role,
      //         content: lastMessage.content,
      //       });
      //     }

      //     setToolStatus({
      //       name: message.data.toolCalls![0],
      //       active: true,
      //     });

      //     updateLastMessage({
      //       role: Role.TOOL,
      //       content: `RUNNING ${message.data.toolCalls![0]}`,
      //     });
      //   }
      // }
    };

    await invoke("run_agent", {
      messages,
      onEvent,
    });
  }, []);

  return { start };
}

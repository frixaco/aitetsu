import { Message } from "./message";
import { useChatStore } from "./store";
import { useShallow } from "zustand/shallow";

export function Chat() {
  const messages = useChatStore(useShallow((state) => state.messages));
  const generating = useChatStore(useShallow((state) => state.generating));
  const lastMessage = useChatStore(useShallow((state) => state.lastMessage));

  return (
    <div className="flex flex-col gap-2 flex-1 overflow-y-auto p-2 text-Entered-pink">
      {messages.map((m) => (
        <Message data={m} streaming={false} />
      ))}

      {lastMessage && generating && (
        <Message data={lastMessage} streaming={true} />
      )}
    </div>
  );
}

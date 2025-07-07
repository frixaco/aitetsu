import { Message } from "./message";
import { useChatStore } from "./store";
import { useShallow } from "zustand/shallow";

export function Chat() {
  const messages = useChatStore(useShallow((state) => state.messages));
  const generating = useChatStore(useShallow((state) => state.generating));
  const lastMessage = useChatStore(useShallow((state) => state.lastMessage));

  return (
    <div className="light-out-black-in bg-[#0c0c0c] rounded-2xl flex flex-col gap-2 flex-1 text-sm overflow-y-auto p-2">
      {messages.map((m, i) => (
        <Message key={i} data={m} streaming={false} />
      ))}

      {lastMessage && generating && (
        <Message data={lastMessage} streaming={true} />
      )}
    </div>
  );
}

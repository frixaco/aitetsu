import { create } from "zustand";

interface ChatState {
  systemPrompt: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage | null;
  generating: boolean;
  cwd: string | null;
  setCwd: (cwd: string | null) => void;
}

export type ChatMessage = {
  role: Role;
  content: string;
  tool_calls?: string[];
};

const SYSTEM_PROMPT: string = `You are a Senior Software Engineer with extensive knowledge in many programming languages, frameworks, libraries, design patterns and best practices.

Answer in two phases.
Phase 1 - present the solution and a detailed plan.
Phase 2 - call tools if they are needed to accomplish given task; otherwise omit Phase 2.
`;

export const useChatStore = create<ChatState>()((set) => ({
  systemPrompt: SYSTEM_PROMPT,
  setSystemPrompt: (systemPrompt: string) =>
    set((_state) => ({ systemPrompt })),
  messages: [],
  addMessage: (message: ChatMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setGenerating: (generating: boolean) => set((_state) => ({ generating })),
  updateLastMessage: (lastMessage: ChatMessage | null) =>
    set((_state) => ({ lastMessage })),
  lastMessage: null,
  generating: false,
  cwd: null,
  setCwd: (cwd: string | null) => set((_state) => ({ cwd })),
}));

export enum Role {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool",
  DEVELOPER = "developer",
}

export type StreamEvent =
  | {
      event: "started";
      data: {};
    }
  | {
      event: "delta";
      data: {
        role: Role;
        content: string | null;
        tool_calls: string[] | null;
      };
    }
  | {
      event: "finished";
      data: {};
    };

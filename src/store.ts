import { create } from 'zustand';

export enum Role {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool',
  DEVELOPER = 'developer',
}

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export enum FinishReason {
  ToolCalls = 'toolCalls',
  Stop = 'stop',
  Length = 'length',
  ContentFilter = 'contentFilter',
  Error = 'error',
}

export type ChatMessage = {
  role: Role;
  content: string | null;
  toolCalls?: string[] | null;
};

export type ToolStatus =
  | { name: null; active: false }
  | { name: string; active: true };

interface ChatState {
  systemPrompt: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage | null;
  generating: boolean;
  cwd: string | null;
  usage: TokenUsage;
  toolStatus: ToolStatus;
}

const SYSTEM_PROMPT: string = `You are a smart assistant with extensive knowledge in many programming languages, frameworks, libraries, design patterns and best practices.

Always provide a concise summary after completing each task user asks you to do.
`;

export const useChatStore = create<ChatState>()(() => ({
  systemPrompt: SYSTEM_PROMPT,
  messages: [],
  lastMessage: null,
  generating: false,
  toolStatus: {
    name: null,
    active: false,
  },
  cwd: null,
  usage: {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  },
}));

export const setSystemPrompt = (systemPrompt: string) =>
  useChatStore.setState({ systemPrompt });

export const addMessage = (message: ChatMessage) =>
  useChatStore.setState((state) => ({
    messages: [...state.messages, message],
  }));

export const setGenerating = (generating: boolean) =>
  useChatStore.setState({ generating });

export const updateLastMessage = (lastMessage: ChatMessage | null) =>
  useChatStore.setState({ lastMessage });

export const setCwd = (cwd: string | null) => useChatStore.setState({ cwd });

export const updateUsage = (usage: TokenUsage) =>
  useChatStore.setState({ usage: { ...usage } });

export const setToolStatus = (toolStatus: ToolStatus) =>
  useChatStore.setState({ toolStatus });

export type NonStreamEvent =
  | { event: 'started'; data: {} }
  | {
      event: 'finished';
      data: {
        response?: {
          role: Role;
          content: string | null;
          toolCalls: string[] | null;
        };
        reason: FinishReason;
      };
    }
  | {
      event: 'usage';
      data: {
        usage: TokenUsage;
      };
    };

export type StreamEvent =
  | {
      event: 'started';
      data: {};
    }
  | {
      event: 'delta';
      data: {
        role: Role;
        content: string | null;
        toolCalls: string[] | null;
      };
    }
  | {
      event: 'finished';
      data: {
        usage?: TokenUsage;
        reason: FinishReason;
      };
    };

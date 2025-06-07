import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { FileDirPicker } from "./file-dir-picker";

const SYSTEM_PROMPT: string = `You are a Senior Software Engineer with extensive knowledge in many programming languages, frameworks, libraries, design patterns and best practices.

Answer in two phases.
Phase 1 - present the solution and a detailed plan.
Phase 2 - call tools if they are needed to accomplish given task; otherwise omit Phase 2.
`;

type StreamEvent =
  | {
      event: "started";
      data: {
        prompt: string;
      };
    }
  | {
      event: "delta";
      data: {
        content: string | null;
        tool_calls: string[] | null;
      };
    }
  | {
      event: "finished";
      data: {
        full_response: string | null;
      };
    };

export function PromptArea() {
 
    return (
        <div className="h-32 relative w-full p-2">
            <FileDirPicker path={""} />

            {/* textarea */}
            <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.currentTarget.value)}
                onKeyDown={onShortcut}
                className="bg-ctp-base size-full px-2 py-1 text-ctp-pink border rounded border-ctp-surface2 focus:border-ctp-mauve outline-none"
                autoFocus
            />
        </div>
    )
}
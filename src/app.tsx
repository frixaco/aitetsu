import { useEffect } from "react";
import "./global.css";

import { exit } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
// import markdownit from 'markdown-it'
// import { marked } from "marked";
import { PromptArea } from "./prompt-area";
import { Chat } from "./chat";
import { setCwd } from "./store";
import { Header } from "./header";

const useGlobalShortcuts = () => {
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "o") {
        const cwd = await open({ directory: true, multiple: false });
        if (cwd !== null) {
          await invoke("set_project_dir", {
            path: cwd,
          });
          setCwd(cwd);
        }
      }

      if (e.ctrlKey && e.key === "q") {
        await exit(1);
      }
    };

    document.addEventListener("keypress", handler);

    return () => document.removeEventListener("keypress", handler);
  }, []);
};

function App() {
  useGlobalShortcuts();

  return (
    <main className="flex flex-col h-full font-mono">
      <Header />

      <Chat />

      <PromptArea />
    </main>
  );
}

export default App;

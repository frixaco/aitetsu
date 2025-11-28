import { useEffect } from 'react';
import './global.css';

import { exit } from '@tauri-apps/plugin-process';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

// import markdownit from 'markdown-it'
// import { marked } from "marked";

import { PromptArea } from './prompt-area';
import { Chat } from './chat';
import { setCwd } from './store';
import { Header } from './header';
import { UnwatchFn, watch } from '@tauri-apps/plugin-fs';

const useGlobalSettings = () => {
  useEffect(() => {
    let unwatch: UnwatchFn | undefined;
    const initializeWatch = async () => {
      const existingCwd: string = await invoke('get_project_dir');
      console.log('existingCwd', existingCwd);
      if (existingCwd) {
        setCwd(existingCwd);
        unwatch = await watch(
          existingCwd,
          (event) => {
            console.log('cwd event', event);
          },
          {
            delayMs: 500,
            recursive: true,
          }
        );
      }
    };
    initializeWatch();

    return () => unwatch?.();
  });

  useEffect(() => {
    let unwatch: UnwatchFn | undefined;

    const handler = async (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'o') {
        const cwd = await open({ directory: true, multiple: false });
        if (cwd !== null) {
          await invoke('set_project_dir', {
            path: cwd,
          });
          setCwd(cwd);

          unwatch = await watch(
            cwd,
            (event) => {
              console.log('cwd event', event);
            },
            {
              delayMs: 500,
              recursive: true,
            }
          );
        }
      }

      if (e.ctrlKey && e.key === 'q') {
        await exit(1);
      }
    };

    document.addEventListener('keypress', handler);

    return () => {
      document.removeEventListener('keypress', handler);
      unwatch?.();
    };
  }, []);
};

function App() {
  useGlobalSettings();

  return (
    <main className="flex flex-col h-full font-sans px-2 pb-2 gap-2">
      <Header />

      <Chat />

      <PromptArea />
    </main>
  );
}

export default App;

import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

type Props = {
  searchTerm: string | null;
  onInput: (path: string) => void;
};

export function FileDirPicker({ searchTerm = '', onInput }: Props) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const results: string[] = await invoke('fuzzy_search', { searchTerm });
      setItems(results);
      onInput(results[0]);
    })();
  }, [searchTerm]);

  return (
    <div className="absolute h-32 w-full text-ctp-green text-sm px-1 py-1 bottom-[8.5rem] rounded bg-ctp-mantle flex flex-col-reverse gap-1 overflow-auto">
      {items.length === 0 ? (
        <div>No results</div>
      ) : (
        items.map((item, idx) => {
          const isDirectory = item.endsWith('/');
          return (
            <button
              key={idx}
              className="flex items-center justify-start gap-1 rounded hover:bg-ctp-surface0 px-1 py-0.5"
              onClick={() => onInput(item)}
            >
              {isDirectory ? (
                <svg
                  className="size-5 text-ctp-blue"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M2.07 5.258C2 5.626 2 6.068 2 6.95V14c0 3.771 0 5.657 1.172 6.828S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.172S22 17.771 22 14v-2.202c0-2.632 0-3.949-.77-4.804a3 3 0 0 0-.224-.225C20.151 6 18.834 6 16.202 6h-.374c-1.153 0-1.73 0-2.268-.153a4 4 0 0 1-.848-.352C12.224 5.224 11.816 4.815 11 4l-.55-.55c-.274-.274-.41-.41-.554-.53a4 4 0 0 0-2.18-.903C7.53 2 7.336 2 6.95 2c-.883 0-1.324 0-1.692.07A4 4 0 0 0 2.07 5.257M12.25 10a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="size-5 text-ctp-lavender"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m19.352 7.617l-3.96-3.563c-1.127-1.015-1.69-1.523-2.383-1.788L13 5c0 2.357 0 3.536.732 4.268S15.643 10 18 10h3.58c-.362-.704-1.012-1.288-2.228-2.383"
                  />
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M10 22h4c3.771 0 5.657 0 6.828-1.172S22 17.771 22 14v-.437c0-.873 0-1.529-.043-2.063h-4.052c-1.097 0-2.067 0-2.848-.105c-.847-.114-1.694-.375-2.385-1.066c-.692-.692-.953-1.539-1.067-2.386c-.105-.781-.105-1.75-.105-2.848l.01-2.834q0-.124.02-.244C11.121 2 10.636 2 10.03 2C6.239 2 4.343 2 3.172 3.172C2 4.343 2 6.229 2 10v4c0 3.771 0 5.657 1.172 6.828S6.229 22 10 22m.97-6.53a.75.75 0 0 1 1.06 0l1 1a.75.75 0 0 1 0 1.06l-1 1a.75.75 0 1 1-1.06-1.06l.47-.47l-.47-.47a.75.75 0 0 1 0-1.06m-.268-1.207a.75.75 0 1 0-1.404-.526l-1.5 4a.75.75 0 1 0 1.404.526zM7.53 13.47a.75.75 0 0 1 0 1.06l-.47.47l.47.47a.75.75 0 1 1-1.06 1.06l-1-1a.75.75 0 0 1 0-1.06l1-1a.75.75 0 0 1 1.06 0"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p
                className={isDirectory ? 'text-ctp-blue' : 'text-ctp-lavender'}
              >
                {item}
              </p>
            </button>
          );
        })
      )}
    </div>
  );
}

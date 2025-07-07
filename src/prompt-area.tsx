import { useEffect, useRef, useState } from "react";
import { FileDirPicker } from "./file-dir-picker";
import { useDebounce } from "./utils";
import { useChat } from "./useChat";
import { twMerge } from "tailwind-merge";

export function PromptArea() {
  const [inputValue, setInputValue] = useState("");
  const prompt = useDebounce(inputValue, 300);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    promptInputRef.current?.focus();
  }, []);

  const [pickerValue, setPickerValue] = useState("");

  const pickerActive = prompt.lastIndexOf("@") !== -1;
  const searchTerm = !pickerActive
    ? null
    : prompt.slice(prompt.lastIndexOf("@") + 1);

  const { start } = useChat();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="h-48 relative w-full bg-[#212121]">
      {pickerActive && (
        <FileDirPicker
          searchTerm={searchTerm}
          onInput={(v) => setPickerValue(v)}
        />
      )}

      <div className="flex h-full gap-1">
        <textarea
          className="font-semibold drop-shadow-sm border-black border-4 flex-1 h-full p-2 font-mono text-[#c0b930] outline-none rounded-xl light-in-out-3 black-in bg-[#121212]"
          // className="drop-shadow-sm size-full p-3 font-mono text-sm text-[#ffffff] outline-none rounded-xl light-out-2 black-in bg-[#111111]"
          // className="drop-shadow-sm size-full border-black border-4 p-3 font-mono text-sm text-[#ffffff] tracking-wider caret-[#30c03c] outline-none rounded-xl light-in-out-2 black-in bg-[#212121]"
          // className="size-full border-black border-4 px-4 font-mono text-sm text-[#c6c6c6] tracking-wide caret-[#e4e4e4] py-4 outline-none rounded-xl light-in-out-2 black-in bg-[#212121]"
          autoFocus
          ref={promptInputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={async (e) => {
            const key = e.key;

            if (key === "Enter" && pickerActive) {
              e.preventDefault();
              const i = inputValue.lastIndexOf("@");
              const path = inputValue.slice(0, i) + pickerValue;
              setInputValue(path);
            }

            if (e.metaKey && key === "Enter") {
              e.preventDefault();
              setInputValue("");

              await start(prompt);
            }
          }}
        />

        {/* <svg
              className="-rotate-90 fill-[#3065c0]"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path d="M3 13h6v-2H3V1.846a.5.5 0 0 1 .741-.439l18.462 10.155a.5.5 0 0 1 0 .876L3.741 22.592A.5.5 0 0 1 3 22.154z"></path>
            </svg> */}

        {/* <div className="flex flex-col text-[#282828] items-stretch justify-center">
          <button className="px-4 py-2 flex gap-1 items-center justify-center bg-[#e4e4e4] light-in-out-3 rounded-xl border-black border-4">
            <svg
              className="fill-[#282828] inline"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.5 2a2.5 2.5 0 0 0 0 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a2.5 2.5 0 0 0 0 5A2.5 2.5 0 0 0 7 11.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a2.5 2.5 0 0 0 5 0A2.5 2.5 0 0 0 11.5 9h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a2.5 2.5 0 0 0 0-5A2.5 2.5 0 0 0 9 4.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1A2.5 2.5 0 0 0 4.5 2M9 7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zm-3-3v1a.5.5 0 0 1-.5.5h-1A1.5 1.5 0 1 1 6 4.5M11.5 6h-1a.5.5 0 0 1-.5-.5v-1A1.5 1.5 0 1 1 11.5 6M6 11.5v-1a.5.5 0 0 0-.5-.5h-1A1.5 1.5 0 1 0 6 11.5m5.5-1.5h-1a.5.5 0 0 0-.5.5v1a1.5 1.5 0 1 0 1.5-1.5"
                clipRule="evenodd"
              ></path>
            </svg>
            <svg
              className="fill-[#282828]"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            >
              <path d="M16 4.5a.5.5 0 0 0-1 0V8H1.7l3.15-3.15a.5.5 0 0 0-.707-.707l-4 4a.5.5 0 0 0 0 .707l4 4a.5.5 0 0 0 .707-.707L1.7 8.993H15a1 1 0 0 0 1-1v-3.5z"></path>
            </svg>
          </button>
          <button className="flex-1">HISTORY</button>
        </div> */}

        {/* <div className="flex flex-col gap-1 text-[#e4e4e4]">
          <button
            className={twMerge(
              "group py-3 px-2 flex flex-col items-center justify-center bg-[#282828] rounded-xl border-black border-4",
              isPressed ? "light-out-black-in" : "light-in-out-2"
            )}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
          > */}
        {/* record */}
        {/* <svg
              className="fill-[#c03031]"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 1 1-18.001-.001A9 9 0 0 1 21 12"></path>
            </svg> */}

        {/* arrows */}
        {/* <svg
              className={twMerge(
                "fill-[#ffffff] -rotate-90 transition-transform ease-out duration-200 size-6",
                isPressed && "scale-[99%] -translate-y-px"
              )}
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path d="M12.6 3.09a1 1 0 0 0-.59.912v16a1 1 0 0 0 1.66.747l9-8a1 1 0 0 0 0-1.494l-9-8a.99.99 0 0 0-1.07-.165m-12.01 0a1 1 0 0 0-.59.912v16a1 1 0 0 0 1.66.747l9-8a1 1 0 0 0 0-1.494l-9-8A.99.99 0 0 0 .59 3.09"></path>
            </svg> */}

        {/* play */}
        {/* <svg
              className="fill-[#e4e4e4] group-active:fill-[#dbdbdb] -rotate-90 leading-none"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 16 24"
            >
              <path d="M9.42 2.31A1.502 1.502 0 0 0 7.001 3.5v17c0 .572.325 1.09.839 1.35c.513.252 1.13.19 1.58-.16l11-8.5a1.5 1.5 0 0 0 .583-1.19a1.51 1.51 0 0 0-.583-1.19z"></path>
            </svg>
            <span className="text-center text-xs -mt-2">SEND</span> */}

        {/* stop */}
        {/* <svg
              className="fill-[#e4e4e4]"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                d="M4 10.4c0-2.24 0-3.36.436-4.22a4.03 4.03 0 0 1 1.75-1.75c.856-.436 1.98-.436 4.22-.436h3.2c2.24 0 3.36 0 4.22.436c.753.384 1.36.995 1.75 1.75c.436.856.436 1.98.436 4.22v3.2c0 2.24 0 3.36-.436 4.22a4.03 4.03 0 0 1-1.75 1.75c-.856.436-1.98.436-4.22.436h-3.2c-2.24 0-3.36 0-4.22-.436a4.03 4.03 0 0 1-1.75-1.75C4 16.964 4 15.84 4 13.6z"
              ></path>
            </svg> */}

        {/* cmd */}
        {/* <svg
              className="fill-[#e4e4e4] inline"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.5 2a2.5 2.5 0 0 0 0 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a2.5 2.5 0 0 0 0 5A2.5 2.5 0 0 0 7 11.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a2.5 2.5 0 0 0 5 0A2.5 2.5 0 0 0 11.5 9h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a2.5 2.5 0 0 0 0-5A2.5 2.5 0 0 0 9 4.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1A2.5 2.5 0 0 0 4.5 2M9 7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zm-3-3v1a.5.5 0 0 1-.5.5h-1A1.5 1.5 0 1 1 6 4.5M11.5 6h-1a.5.5 0 0 1-.5-.5v-1A1.5 1.5 0 1 1 11.5 6M6 11.5v-1a.5.5 0 0 0-.5-.5h-1A1.5 1.5 0 1 0 6 11.5m5.5-1.5h-1a.5.5 0 0 0-.5.5v1a1.5 1.5 0 1 0 1.5-1.5"
                clipRule="evenodd"
              ></path>
            </svg> */}

        {/* enter */}
        {/* <svg
              className="fill-[#e4e4e4]"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            >
              <path d="M16 4.5a.5.5 0 0 0-1 0V8H1.7l3.15-3.15a.5.5 0 0 0-.707-.707l-4 4a.5.5 0 0 0 0 .707l4 4a.5.5 0 0 0 .707-.707L1.7 8.993H15a1 1 0 0 0 1-1v-3.5z"></path>
            </svg> */}
        {/* </button> */}
        {/* <span className="text-center text-sm">STOP</span> */}
        {/* </div> */}
      </div>
    </div>
  );
}

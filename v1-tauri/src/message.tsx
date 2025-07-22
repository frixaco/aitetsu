import { ChatMessage, Role } from "./store";

type Props = {
  streaming: boolean;
  data: ChatMessage;
};

const GreenSpinner = () => {
  return (
    <div
      className="flex w-4 h-4 border-4 border-ctp-green-500 border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

const SuccessCheckmark = () => {
  return (
    <div
      className="w-4 h-4 flex items-center justify-center rounded-full bg-ctp-green text-white shrink-0"
      role="img"
      aria-label="Success"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        className="w-2/3 h-2/3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    </div>
  );
};

export function Message({ data, streaming }: Props) {
  return (
    <div className="border flex rounded border-ctp-surface0 px-2 py-1 items-center gap-1">
      {streaming && data.role === Role.TOOL && <GreenSpinner />}
      {!streaming && data.role === Role.TOOL && <SuccessCheckmark />}

      <pre
        className={
          "whitespace-pre-wrap " +
          (data.role === Role.TOOL ? "text-ctp-green" : "text-ctp-subtext0")
        }
      >
        {data.content}
      </pre>
      {/* <div
                className="prose !max-w-none prose-sm leading-tight prose-headings:text-ctp-pink prose-strong:text-ctp-mauve prose-em:text-ctp-maroon prose-a:text-ctp-blue hover:prose-a:text-ctp-teal prose-code:text-ctp-peach prose-pre:bg-ctp-surface0 prose-pre:text-ctp-text prose-p:text-ctp-subtext1 prose-ul:text-ctp-subtext0 prose-ol:list-inside"
                dangerouslySetInnerHTML={{ __html: text }}
            /> */}
    </div>
  );
}

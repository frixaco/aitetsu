import { ChatMessage } from "./store";

type Props = {
  streaming: boolean;
  data: ChatMessage;
};

export function Message({ data, streaming }: Props) {
  return (
    <div
      className={`border flex rounded border-ctp-surface0 px-2 py-1 ${
        streaming ? "border-ctp-pink" : ""
      }`}
    >
      {streaming && (
        <span className="inline-block w-[1ch] bg-ctp-surface0">&nbsp;</span>
      )}
      <p>{data.content}</p>
      {/* <div
                className="prose !max-w-none prose-sm leading-tight prose-headings:text-ctp-pink prose-strong:text-ctp-mauve prose-em:text-ctp-maroon prose-a:text-ctp-blue hover:prose-a:text-ctp-teal prose-code:text-ctp-peach prose-pre:bg-ctp-surface0 prose-pre:text-ctp-text prose-p:text-ctp-subtext1 prose-ul:text-ctp-subtext0 prose-ol:list-inside"
                dangerouslySetInnerHTML={{ __html: text }}
            /> */}
    </div>
  );
}

import {
  CopyIcon,
  EditIcon,
  GlobeIcon,
  MinusIcon,
  PinIcon,
  RefreshCcwIcon,
  SplitIcon,
} from "lucide-react";
import { Button } from "@base-ui-components/react/button";
import { ContextMenu } from "@base-ui-components/react/context-menu";
import "./global.css";

function MessageMenu({
  children,
  items,
}: React.PropsWithChildren<{
  items: {
    labelOrIcon: string | React.ReactNode;
    onClick: () => void;
  }[];
}>) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="flex items-center justify-center select-none">
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="outline-none">
          <ContextMenu.Popup className="bg-muted origin-[var(--transform-origin)] rounded py-1 text-gray-900 shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[opacity] data-[ending-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            {items.map((item) => (
              <>
                <ContextMenu.Item
                  onClick={() => item.onClick()}
                  className="data-[highlighted]:text-ink data-[highlighted]:before:bg-hover flex cursor-default px-4 py-2 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm"
                >
                  {item.labelOrIcon}
                </ContextMenu.Item>
                {/* <ContextMenu.Separator className="mx-4 my-1.5 h-px bg-gray-200" /> */}
              </>
            ))}
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function Prompt() {
  const items = [
    {
      labelOrIcon: <RefreshCcwIcon size={16} />,
      onClick: () => {},
    },
    {
      labelOrIcon: <EditIcon size={16} />,
      onClick: () => {},
    },
    {
      labelOrIcon: <CopyIcon size={16} />,
      onClick: () => {},
    },
  ];

  return (
    <div className="group text-ink relative flex justify-end px-8">
      <div className="bg-muted rounded px-3 py-2 transition-shadow duration-150 hover:shadow-md">
        <MessageMenu items={items}>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing. Lorem ipsum
            dolor sit amet, consectetur adipisicing elit. Id
          </p>
        </MessageMenu>
      </div>
    </div>
  );
}

function Response() {
  return (
    <div className="group relative flex pl-8">
      <div className="">
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cupiditate
          maiores neque aut hic, tempora commodi sequi temporibus error
          veritatis possimus fugit iste a, impedit consequuntur odio aliquam
          dignissimos? Tempora modi perspiciatis similique dicta quam, vel
          assumenda ducimus id non ut amet esse nulla, ea reprehenderit
          repudiandae illum sequi repellat quos. Officia iusto fugiat voluptas
          repellendus, nam dicta itaque eveniet maxime possimus similique ad
          nisi harum repudiandae doloribus explicabo inventore quos quo quidem
          dignissimos earum quis? Voluptatum temporibus vel, recusandae ut
          pariatur maxime obcaecati, nesciunt ipsa ea officiis ex consectetur
          asperiores incidunt rem, cumque quo voluptates ratione dignissimos
          voluptatem facere dolorem?
        </p>
      </div>

      <div className="pointer-events-none sticky bottom-0 self-end bg-transparent opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="bg-muted flex w-fit flex-col rounded">
          <Button className="text-ink-soft hover:text-ink hover:bg-hover cursor-pointer rounded-md p-2 transition-colors duration-100">
            <MinusIcon size={16} />
          </Button>
          <Button className="text-ink-soft hover:text-ink hover:bg-hover cursor-pointer rounded-md p-2 transition-colors duration-100">
            <CopyIcon size={16} />
          </Button>
          <Button className="text-ink-soft hover:text-ink hover:bg-hover cursor-pointer rounded-md p-2 transition-colors duration-100">
            <PinIcon size={16} />
          </Button>
          <Button className="text-ink-soft hover:text-ink hover:bg-hover cursor-pointer rounded-md p-2 transition-colors duration-100">
            <SplitIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col">
      <section
        id="convo"
        className="hide-scrollbar flex h-full flex-col gap-6 overflow-auto py-8"
      >
        {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map((n) => (
          <div key={n} className="flex flex-col gap-4">
            <Prompt />

            <Response />
          </div>
        ))}
      </section>

      <section
        id="input"
        className="sticky bottom-0 flex flex-col gap-2 px-8 pt-2 pb-6"
      >
        <div className="pointer-events-none absolute top-0 right-0 left-0 h-10 -translate-y-full bg-linear-to-t from-gray-100 to-transparent" />
        <textarea
          rows={1}
          placeholder="Message..."
          className="bg-elevated ring-muted focus:ring-ink-faint text-ink resize-none rounded px-4 py-3 ring-1 transition-shadow duration-100 outline-none"
        />

        <div className="flex items-center gap-3 px-2">
          <select className="text-ink-soft hover:text-ink cursor-pointer bg-transparent text-sm transition-colors duration-100 outline-none">
            <option>GPT5.1</option>
            <option>Gemini 3 Pro</option>
            <option>Claude Opus 4.5</option>
          </select>

          <button className="text-ink-soft hover:text-ink hover:bg-hover cursor-pointer rounded-md p-2 transition-colors duration-100">
            <GlobeIcon size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;

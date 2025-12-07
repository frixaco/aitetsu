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
import "./global.css";

function Prompt() {
  return (
    <div className="flex px-8 justify-end group relative text-ink">
      <div className="bg-muted transition-shadow duration-150 hover:shadow-md px-3 py-2 rounded">
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing. Lorem ipsum dolor
          sit amet, consectetur adipisicing elit. Id
        </p>
      </div>
      <div className="absolute pt-1 bg-transparent top-full right-8 z-10 flex opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
        <div className="flex bg-muted shadow-md rounded">
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <RefreshCcwIcon size={16} />
          </Button>
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <EditIcon size={16} />
          </Button>
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <CopyIcon size={16} />
          </Button>
        </div>
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

      <div className="sticky bottom-0 self-end bg-transparent opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
        <div className="flex flex-col bg-muted rounded w-fit">
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <MinusIcon size={16} />
          </Button>
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <CopyIcon size={16} />
          </Button>
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <PinIcon size={16} />
          </Button>
          <Button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <SplitIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="flex h-screen flex-col max-w-3xl mx-auto">
      <section
        id="convo"
        className="flex flex-col h-full overflow-auto gap-6 hide-scrollbar py-8"
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
        className="sticky bottom-0 flex flex-col px-8 pb-6 pt-2 gap-2"
      >
        <div className="absolute top-0 left-0 right-0 h-10 -translate-y-full bg-linear-to-t from-gray-100 to-transparent pointer-events-none" />
        <textarea
          rows={1}
          placeholder="Message..."
          className="bg-elevated rounded px-4 py-3 resize-none outline-none ring-1 ring-muted focus:ring-ink-faint transition-shadow duration-100 text-ink"
        />

        <div className="flex gap-3 px-2 items-center">
          <select className="bg-transparent text-ink-soft text-sm outline-none cursor-pointer hover:text-ink transition-colors duration-100">
            <option>GPT5.1</option>
            <option>Gemini 3 Pro</option>
            <option>Claude Opus 4.5</option>
          </select>

          <button className="p-2 rounded-md cursor-pointer text-ink-soft hover:text-ink hover:bg-hover transition-colors duration-100">
            <GlobeIcon size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;

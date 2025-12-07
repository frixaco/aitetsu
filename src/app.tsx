import {
  CopyIcon,
  EditIcon,
  GlobeIcon,
  PinIcon,
  RefreshCcwIcon,
  SplitIcon,
} from "lucide-react";
import "./global.css";

function App() {
  return (
    <main className="flex h-screen flex-col max-w-4xl mx-auto">
      <section
        id="convo"
        className="flex flex-col h-full overflow-auto gap-8 px-8 pb-4"
      >
        {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map((n) => (
          <div key={n} className="relative gap-2">
            <div className="group flex flex-col gap-1 relative">
              <div className="bg-gray-200 p-2 rounded text-gray-800">
                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing. Lorem
                  ipsum dolor sit amet, consectetur adipisicing elit. Id
                </p>
              </div>

              <div className="justify-start flex gap-2 text-xs w-fit bg-gray-300 rounded opacity-0 group-hover:opacity-100 group-hover:animate-glide-up">
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <RefreshCcwIcon size={16} />
                </button>
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <EditIcon size={16} />
                </button>
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <CopyIcon size={16} />
                </button>
              </div>
            </div>

            <div className="group gap-1 relative flex flex-col">
              <div className="rounded p-2 text-gray-800">
                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Cupiditate maiores neque aut hic, tempora commodi sequi
                  temporibus error veritatis possimus fugit iste a, impedit
                  consequuntur odio aliquam dignissimos? Tempora modi
                  perspiciatis similique dicta quam, vel assumenda ducimus id
                  non ut amet esse nulla, ea reprehenderit repudiandae illum
                  sequi repellat quos. Officia iusto fugiat voluptas
                  repellendus, nam dicta itaque eveniet maxime possimus
                  similique ad nisi harum repudiandae doloribus explicabo
                  inventore quos quo quidem dignissimos earum quis? Voluptatum
                  temporibus vel, recusandae ut pariatur maxime obcaecati,
                  nesciunt ipsa ea officiis ex consectetur asperiores incidunt
                  rem, cumque quo voluptates ratione dignissimos voluptatem
                  facere dolorem?
                </p>
              </div>

              <div className="justify-center flex gap-2 text-xs rounded opacity-0 group-hover:opacity-100 group-hover:animate-glide-up">
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <PinIcon size={20} />
                </button>
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <CopyIcon size={20} />
                </button>
                <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
                  <SplitIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section
        id="input"
        className="sticky bottom-0 flex flex-col px-6 py-8 rounded-t-sm gap-2"
      >
        <div className="absolute top-0 left-0 right-0 h-8 -translate-y-full bg-linear-to-t from-[#d7d8dd] to-transparent pointer-events-none" />
        <textarea
          rows={1}
          placeholder="Enter prompt"
          className="rounded px-4 py-4 resize-none outline-none ring-0 focus:ring-1 transition-shadow duration-75 ring-gray-400"
        />

        <div className="flex gap-4 px-4">
          <select className="">
            <option>GPT5.1</option>
            <option>Gemini 3 Pro</option>
            <option>Claude Opus 4.5</option>
          </select>

          <button className="p-2 rounded cursor-pointer text-gray-900 hover:bg-gray-400 hover:text-gray-200">
            <GlobeIcon size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;


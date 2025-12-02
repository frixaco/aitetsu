import "./global.css";

function App() {
  return (
    <main className="flex h-screen flex-col max-w-4xl mx-auto">
      <section
        id="convo"
        className="flex flex-col h-full bg-red-500 overflow-auto gap-2"
      >
        {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map((n) => (
          <div key={n} className="bg-white flex group gap-4">
            <div className="sticky top-0 bg-yellow-500 h-fit group-hover:opacity-100 flex opacity-0 flex-col gap-1 text-xs">
              <button>BM</button>
              <button>CY</button>
              <button>BR</button>
            </div>

            <div className="border">
              <h1>{n}</h1>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Cupiditate maiores neque aut hic, tempora commodi sequi
                temporibus error veritatis possimus fugit iste a, impedit
                consequuntur odio aliquam dignissimos? Tempora modi perspiciatis
                similique dicta quam, vel assumenda ducimus id non ut amet esse
                nulla, ea reprehenderit repudiandae illum sequi repellat quos.
                Officia iusto fugiat voluptas repellendus, nam dicta itaque
                eveniet maxime possimus similique ad nisi harum repudiandae
                doloribus explicabo inventore quos quo quidem dignissimos earum
                quis? Voluptatum temporibus vel, recusandae ut pariatur maxime
                obcaecati, nesciunt ipsa ea officiis ex consectetur asperiores
                incidunt rem, cumque quo voluptates ratione dignissimos
                voluptatem facere dolorem?
              </p>
            </div>
          </div>
        ))}
      </section>

      <section id="input" className="sticky bottom-0 bg-blue-500 flex flex-col">
        <input type="text" placeholder="Enter prompt" />

        <select>
          <option>GPT5.1</option>
          <option>Gemini 3 Pro</option>
          <option>Claude Opus 4.5</option>
        </select>
      </section>
    </main>
  );
}

export default App;

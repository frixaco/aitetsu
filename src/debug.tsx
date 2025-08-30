import { useEffect, useRef, useState } from 'react';

export function Debug() {
  const [fps, setFPS] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        setFPS(Math.round((frameCount.current * 1000) / deltaTime));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-mono z-50 flex flex-col items-center">
      <span>FPS: {fps}</span>

      <div className="flex gap-2">
        <button
          // onClick={() => useMainStore.getState().setActiveTab('v1')}
          className="bg-gray-700 px-2 rounded-sm"
        >
          v1
        </button>
        <button
          // onClick={() => useMainStore.getState().setActiveTab('v2')}
          className="bg-gray-700 px-2 rounded-sm"
        >
          v2
        </button>
      </div>
    </div>
  );
}

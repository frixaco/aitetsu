import { useEffect, useState } from 'react';
import { useKeyboardShortcut } from './keyboard-shortcuts';
import { Viewport } from './viewport';
import { Titlebar } from './titlebar';
import { Drawer } from './drawer';
import { isTauri, getPlatformName } from './utils';

import './global.css';

function App() {
  const [openSheet, setOpenSheet] = useState(false);

  useKeyboardShortcut([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => {
        console.log('opening sheet');
        setOpenSheet((p) => !p);
      },
    },
    {
      key: 'Escape',
      callback: () => {
        if (openSheet) {
          setOpenSheet(false);
        }
      },
    },
  ]);

  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    if (!isTauri) return;

    (async () => {
      setIsWindows((await getPlatformName())!.isWindows);
    })();
  }, []);

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#d7d8dd]">
      {/* <Debug /> */}
      {isTauri && isWindows && <Titlebar openSheet={openSheet} />}

      {/* Viewport */}
      <Viewport />

      {/* Bottom drawer */}
      <Drawer isOpen={openSheet} />
    </main>
  );
}

export default App;

import { useState } from 'react';
import { useKeyboardShortcut } from './keyboardShortcuts';
import { Viewport } from './viewport';
import { Titlebar } from './titlebar';
import { Drawer } from './drawer';
import { isWindows } from './utils';

import './global.css';
import '@xyflow/react/dist/style.css';

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

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#d7d8dd] size-full">
      {/* <Debug /> */}
      {isWindows && <Titlebar openSheet={openSheet} />}

      {/* Viewport */}
      <Viewport />

      {/* Bottom drawer */}
      <Drawer isOpen={openSheet} />
    </main>
  );
}

export default App;

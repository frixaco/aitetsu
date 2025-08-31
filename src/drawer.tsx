import { twMerge } from 'tailwind-merge';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { useEffect, useMemo } from 'react';

export function Drawer({ isOpen }: { isOpen: boolean }) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Text,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Write something …',
      }),
    ],
    content: '',
  });

  useEffect(() => {
    if (isOpen && editor) {
      editor.commands.focus('end', { scrollIntoView: false });
    } else if (!isOpen && editor) {
      editor.commands.blur();
    }
  }, [isOpen, editor]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <>
      <div
        className={
          'absolute inset-x-0 bottom-0 z-10 flex will-change-transform flex-col items-center overflow-hidden bg-gray-100 pt-16 shadow-2xl duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] rounded-none top-10'
        }
        style={{
          transform: isOpen
            ? 'translate(0, 0) scale(1)'
            : // TODO:: is this better than translate(0%, 100%)?
              'translate(10%, 100%) scale(0.90)',
        }}
      >
        <div className="w-1/2 h-full contain-layout">
          <EditorContext.Provider value={providerValue}>
            <EditorContent editor={editor} />
          </EditorContext.Provider>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={twMerge(
          'absolute inset-0 transition-opacity duration-150 ease-out',
          !isOpen && 'pointer-events-none'
        )}
        // Note: won't work on macOS
        // style={{ backdropFilter: openSheet ? 'blur(5px)' : 'none' }}
      />
    </>
  );
}

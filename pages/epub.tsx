import React, { useEffect } from 'react';
import Head from 'next/head';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { copyToClipboard } from '@/utils/clipboard';

const EpubReader = () => {
  const { book, navigation, currentLocation, handleFileAccepted } = useEpubStore();

  return (
    <div className="h-full w-full bg-white">
      {!book ? (
        <div className="container mx-auto px-4 py-12">
          <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto" />
        </div>
      ) : (
        <div className="h-full relative">
          <Viewer
            book={book}
            currentLocation={currentLocation}
            navigation={navigation}
          />
        </div>
      )}
    </div>
  );
};

const EpubOutline = () => {
  const { navigation, setCurrentLocation, closeBook } = useEpubStore();

  return (
    <div className="h-full w-full bg-white">
      <div className="p-4 border-b">
        <button
          onClick={closeBook}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Close Book
        </button>
      </div>
      <Outline toc={navigation} onChapterSelect={setCurrentLocation} />
    </div>
  );
};

export default function EpubPage() {
  const { book, selectedText, currentLocation, navigation, loadLastBook } = useEpubStore();
  const { onOpen } = useCommandPaletteStore();

  useEffect(() => {
    loadLastBook();
  }, [loadLastBook]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);

  const commandSections = [
    {
      name: "Actions",
      items: [
        {
          id: "explain",
          title: "Explain",
          description: "Get an explanation of the selected text",
          onSelect: () => {
            if (!selectedText?.text) return;
            const prompt = `
You are a reading companion that enriches and clarifies questions a reader would have about this book.

- Use your background knowledge about the book, specifically.
- Use your general knowledge, to enrich your explanation. Be erudite.
- When asked to explain a word, consider the context.
- When explain a word, gives etymology, and history about the word.
- Avoid making broad statements about themes of the book, assume the reader is already familiar with the broad theme.

--- Explain ---

${selectedText.text}

--- Context ---

${selectedText.context}
`;

            copyToClipboard(prompt.trim());
          },
        },
        {
          id: "paraphrase",
          title: "Paraphrase",
          description: "Get a paraphrased version of the selected text",
          onSelect: () => {
            if (!selectedText?.text) return;

            const prompt = `
Rewrite the given text content in a more **engaging and readable style** (similar to ChatGPT LISTICLE responses). Avoid making it sound like an academic abstract. Instead:

1. Start with a **clear general overview**.
2. Break down the main ideas into **specific points** for better readability. Use list nesting for better structure.
3. Provide a **summary or conclusion** to wrap up the key points effectively.
4. Write a style that's clear, erudite, assuming a good education, not dumbed down. Visually accessible.
5. Don't feel restricted by the order/structure of the original text **prioritize clarity and flow**.
6. Output more text if you need more tokens to capture more ideas.

------

${selectedText.text}
`;

            copyToClipboard(prompt.trim());
          },
        },
        {
          id: "outline",
          title: "Outline",
          description: "Get a concise outline of the selected text",
          onSelect: () => {
            if (!selectedText?.text) return;

            const prompt = `
Distill the given text content in a more **engaging and readable style** (similar to ChatGPT LISTICLE responses).

- Be concise, but don't sacrifice clarity. 
- Start with a **clear general overview**.
- Break down the main ideas into **specific points** for better readability. 
- Use list nesting for better visual structure. Allow deep nestings.
- Write a style that's clear, erudite, assuming a good education, not dumbed down.

------

${selectedText.text}
`;

            copyToClipboard(prompt.trim());
          },
        },
      ],
    },
  ];

  const tabs = [
    {
      id: "reader",
      label: "Reader",
      content: (
        <div className="p-4">
          {currentLocation && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700">Current Location</div>
              <div className="mt-1 text-sm text-gray-600">{currentLocation}</div>
            </div>
          )}

          {selectedText && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700">Selected Text</div>
              <div className="mt-1 text-sm text-gray-600">{selectedText.text}</div>
              {selectedText.context && (
                <>
                  <div className="mt-2 text-sm font-medium text-gray-700">Context</div>
                  <div className="mt-1 text-sm text-gray-500">{selectedText.context}</div>
                </>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "navigation",
      label: "Navigation",
      content: <div className="p-4">
        {navigation && (
          <pre>
            {JSON.stringify(navigation, null, 2)}
          </pre>)}
      </div>,
    },
    {
      id: "settings",
      label: "Settings",
      content: <div className="p-4">Reader Settings (Coming Soon)</div>,
    },

  ];

  return (
    <>
      <Head>
        <title>EPUB Reader</title>
        <meta name="description" content="A web-based EPUB reader" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CommandPalette
        sections={commandSections}
        placeholder="Search actions..."
      />
      <AppFrame
        leftDrawerContent={<EpubReader />}
        rightDrawerContent={book ? <EpubOutline /> : null}
        tabs={tabs}
      />

    </>
  );
}

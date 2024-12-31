import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Dropzone } from '@/components/ui/dropzone';
import { Viewer } from '@/components/reader/viewer';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { copyToClipboard } from '@/utils/clipboard';
import { FloatingOutline } from '@/components/reader/FloatingOutline';

const EpubReader = () => {
  const { book, navigation, currentLocation, handleFileAccepted } = useEpubStore();
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  const handleCloseOutline = useCallback(() => {
    setIsOutlineOpen(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseOutline();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleCloseOutline]);

  return (
    <div className="h-full w-full bg-white">
      {!book ? (
        <div className="container mx-auto px-4 py-12">
          <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto" />
        </div>
      ) : (
        <div className="h-full relative">
          <button
            onClick={() => setIsOutlineOpen(!isOutlineOpen)}
            className="fixed left-4 top-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 outline-toggle"
            title="Toggle Contents"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <FloatingOutline
            isOpen={isOutlineOpen}
            onClose={handleCloseOutline}
          />

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

export default function EpubPage() {
  const { selectedText, currentLocation, navigation, loadLastBook } = useEpubStore();
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
          id: "distill",
          title: "Distill",
          description: "Distill the content into listicle",
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
      label: "Usage Guide",
      content: (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Usage Guide</h2>
          <p className="mb-4 text-gray-700">This is an example of how to use the Epub Reader.</p>
        </div>
      ),
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
        tabs={tabs}
      />

    </>
  );
}

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { Dropzone } from '@/components/ui/dropzone';
import { Viewer } from '@/components/reader/viewer';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { FloatingOutline } from '@/components/reader/FloatingOutline';
import { useChat } from '@/hooks/useChat';
import { ChatBox } from '@/components/ChatBox';
import { copyToClipboard } from '@/utils/clipboard';

const ReadingGuide = () => {
  const [position, setPosition] = useState(window.innerHeight / 2);
  const [isDragging, setIsDragging] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && guideRef.current) {
        const newPosition = e.clientY;
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={guideRef}
      style={{
        position: 'fixed',
        left: 0,
        top: position - 25,
        width: '100%',
        height: '50px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'rgba(128, 128, 128, 0.05)',
        }}
      />
    </div>
  );
};

const EpubReader = () => {
  const { book, navigation, currentLocation, handleFileAccepted, availableBooks, loadBook, deleteBook } = useEpubStore();
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

  const handleBookClick = (key: string) => {
    loadBook(key);
  };

  const handleDeleteClick = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook(key);
    }
  };

  return (
    <div className="h-full w-full bg-white">
      {!book ? (
        <div className="container mx-auto px-4 py-12">
          <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto mb-8" />

          {availableBooks.length > 0 && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Your Books</h2>
              <div className="space-y-4">
                {availableBooks.map(({ key, title, timestamp }) => (
                  <div
                    key={key}
                    onClick={() => handleBookClick(key)}
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="text-sm text-gray-500">
                        Added {new Date(timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

          <ReadingGuide />

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

interface ChatTab {
  id: string;
  prompt: string;
}


export default function EpubPage() {
  const { selectedText, currentLocation, navigation, refreshAvailableBooks, closeBook } = useEpubStore();
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([]);
  const { onOpen } = useCommandPaletteStore();

  const createChatTab = (prompt: string) => {
    const id = `chat-${Date.now()}`;
    setChatTabs(prev => [...prev, { id, prompt }]);
  };
  const ChatTabComponent = ({ prompt }: { prompt: string }) => {
    const { messages, sendMessage, isLoading } = useChat();

    useEffect(() => {
      if (prompt && messages.length === 0) {
        sendMessage(prompt);
      }
    }, [prompt, messages.length, sendMessage]);

    return (
      <ChatBox
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        className="h-full"
      />
    );
  };


  useEffect(() => {
    refreshAvailableBooks();
  }, [refreshAvailableBooks]);

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

            // createChatTab(prompt.trim());
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

            // createChatTab(prompt.trim());
            copyToClipboard(prompt.trim());
          },
        },
      ],
    },
  ];

  const tabs = useMemo(() => [
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
    ...chatTabs.map(tab => ({
      id: tab.id,
      label: 'Chat',
      content: <ChatTabComponent prompt={tab.prompt} />,
    })),
  ], [chatTabs]);

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
        rightDrawerContent={
          // close button for right drawer
          <button
            onClick={() => closeBook()}
            className="fixed right-4 top-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 outline-toggle"
            title="Close Book"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      />

    </>
  );
}

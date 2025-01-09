import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';

import { useChat } from '@/hooks/useChat';
import { ChatBox } from '@/components/ChatBox';
import { useRouter } from 'next/router';

import { EpubLibrary } from '@/components/reader/EpubLibrary';
import { EpubReader } from '@/components/reader/EpubReader';
import { CmdK } from '@/components/reader/CmdK';

interface ChatTab {
  id: string;
  prompt: string;
}

export default function EpubPage() {
  const { reader: book, loadBook, refreshAvailableBooks, closeBook } = useEpubStore();
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([]);

  const router = useRouter();

  useEffect(() => {
    const bookId = router.query.book;
    if (bookId) {
      const id = parseInt(bookId as string);
      if (!isNaN(id)) {
        loadBook(id);
      }
    }
  }, [router.query.book, loadBook]);

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


  const mainContent = (
    <div className="h-full w-full bg-white">
      {!book ? (
        <EpubLibrary />
      ) : (
        <EpubReader />
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>EPUB Reader</title>
        <meta name="description" content="A web-based EPUB reader" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CmdK />

      <AppFrame
        leftDrawerContent={mainContent}
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

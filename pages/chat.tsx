import { useState, useEffect } from 'react';
import { ChatBox } from '../components/ChatBox';
import { useChatStore } from '../store/chatStore';

function ChatTab({ sessionId }: { sessionId: string }) {
  return (
    <ChatBox
      sessionId={sessionId}
      className="h-full"
    />
  );
}

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState(['chat-0']);
  const createSession = useChatStore((state) => state.createSession);

  // Initialize first session
  useEffect(() => {
    createSession('chat-0');
  }, [createSession]);

  const createNewTab = () => {
    const newSessionId = `chat-${tabs.length}`;
    createSession(newSessionId);
    setTabs(prev => [...prev, newSessionId]);
    setActiveTab(tabs.length); // Switch to new tab
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="container mx-auto max-w-4xl px-4 py-4 flex-1 min-h-0 flex flex-col">
        <div className="mb-4 flex gap-2 items-center">
          <button
            onClick={createNewTab}
            className="px-3 py-1 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            title="Create new chat"
          >
            +
          </button>
          {tabs.map((sessionId, index) => (
            <button
              key={sessionId}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-lg ${activeTab === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              Chat {index + 1}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0">
          <ChatTab sessionId={tabs[activeTab]} />
        </div>
      </div>
    </div>
  );
}

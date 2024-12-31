import { useState } from 'react';
import { ChatBox } from '../components/ChatBox';
import { useChat } from '../hooks/useChat';

function ChatTab() {
  // Call useChat in a stable, top-level place
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <ChatBox
      messages={messages}
      onSendMessage={sendMessage}
      isLoading={isLoading}
      className="h-full"
    />
  );
}

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState(0);
  // Instead of storing the hook's return value, store just IDs for each tab
  const [tabs, setTabs] = useState([0]);

  const createNewTab = () => {
    setTabs(prev => [...prev, prev.length]);
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
          {tabs.map((tabId, index) => (
            <button
              key={tabId}
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

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {tabs.map((tabId, index) => (
            <div
              key={tabId}
              className={`${index === activeTab ? 'col-span-2' : 'hidden'} flex-1 min-h-0`}
            >
              <ChatTab />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

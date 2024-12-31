import { useState } from 'react';
import { ChatBox } from '../components/ChatBox';
import { useChat } from '../hooks/useChat';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState(0);
  const chats = [useChat(), useChat(), useChat()];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="container mx-auto max-w-4xl px-4 py-4 flex-1 min-h-0 flex flex-col">
        <div className="mb-4 flex gap-2">
          {chats.map((_, index) => (
            <button
              key={index}
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
          {chats.map((chat, index) => (
            <div key={index} className={`${index === activeTab ? 'col-span-2' : 'hidden'} flex-1 min-h-0`}>
              <ChatBox
                messages={chat.messages}
                onSendMessage={chat.sendMessage}
                isLoading={chat.isLoading}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

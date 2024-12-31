import { LucideArrowDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
    setShouldAutoScroll(true);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Detect any upward scroll
      if (scrollTop < lastScrollTop) {
        setShouldAutoScroll(false);
      }

      // Only re-enable at exact bottom
      if (scrollHeight - scrollTop === clientHeight) {
        setShouldAutoScroll(true);
      }

      // Show scroll button when scrolled up more than 300px from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 300);

      lastScrollTop = scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShouldAutoScroll(true); // Reset auto-scroll when user sends a message

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = response.body;
      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = accumulatedResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-4 min-h-0 flex flex-col">
        <div className="flex-1 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={scrollContainerRef}>
            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              if (isUser) {
                return (
                  <div key={index} className="mb-4 text-right">
                    <div className="inline-block p-3 rounded-lg bg-blue-500 text-white">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="mt-4 text-left">
                  <ReactMarkdown className="prose max-w-none">{message.content}</ReactMarkdown>
                  {/* <div className="inline-block">
                    
                  </div> */}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          {showScrollButton && (
            <button
              onClick={handleScrollToBottom}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
              <LucideArrowDown className="h-4 w-4" />
            </button>
          )}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        AutoScroll: {shouldAutoScroll ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}

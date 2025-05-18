/**
 * ChatBox is a reusable chat interface component that handles message display,
 * user input, and scroll behavior.
 *
 * Features:
 * - Displays messages in a scrollable container
 * - Auto-scrolls to bottom on new messages
 * - Shows scroll-to-bottom button when scrolled up
 * - Handles message input and submission
 * - Supports markdown rendering for assistant messages
 * - Maintains independent scroll state
 *
 * @example
 * ```tsx
 * // Basic usage
 * function Chat() {
 *   const { messages, sendMessage, isLoading } = useChat();
 *
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i}>{msg.content}</div>
 *       ))}
 *       <button onClick={() => sendMessage("Hello")} disabled={isLoading}>
 *         Send
 *       </button>
 *     </div>
 *   );
 * }
 *
 * // Multiple independent chats
 * function MultiChat() {
 *   const chat1 = useChat();
 *   const chat2 = useChat();
 *
 *   return (
 *     <div>
 *       <ChatBox {...chat1} />
 *       <ChatBox {...chat2} />
 *     </div>
 *   );
 * }
 * ```
 */

import { LucideArrowDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../store/chatStore';

interface ChatBoxProps {
  sessionId: string;
  className?: string;
}

export function ChatBox({ sessionId, className = '' }: ChatBoxProps) {
  const session = useChatStore((state) => state.sessions[sessionId]);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const [input, setInput] = useState('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView();
    }
  };

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
    setShouldAutoScroll(true);
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, shouldAutoScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop < lastScrollTop) {
        setShouldAutoScroll(false);
      }

      if (scrollHeight - scrollTop === clientHeight) {
        setShouldAutoScroll(true);
      }

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 300);

      lastScrollTop = scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || session?.isLoading) return;

    sendMessage(sessionId, content);
    setInput('');
    setShouldAutoScroll(true);
  };

  return (
    <div className={`flex flex-col bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollContainerRef}>
        {session?.messages.map((message, index) => {
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
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={session?.isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={session?.isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

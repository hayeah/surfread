import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Shift+Enter for new line)"
        className="w-full min-h-[60px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        style={{
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      />
    </div>
  );
};

// /store/chatStore.ts
import { create } from 'zustand';
import { Message } from '../types/chat';

interface ChatSession {
  messages: Message[];
  isLoading: boolean;
}

interface ChatStore {
  sessions: Record<string, ChatSession>;
  createSession: (sessionId: string) => void;
  sendMessage: (sessionId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: {},

  createSession: (sessionId) => {
    set((state) => {
      if (state.sessions[sessionId]) return state; // session already exists
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            messages: [],
            isLoading: false,
          },
        },
      };
    });
  },

  sendMessage: async (sessionId, content) => {
    const currentSession = get().sessions[sessionId];
    if (!currentSession) return;
    if (!content.trim() || currentSession.isLoading) return;

    // Push user message
    const userMessage: Message = { role: 'user', content };
    set((state) => {
      const session = state.sessions[sessionId];
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            messages: [...session.messages, userMessage],
            isLoading: true,
          },
        },
      };
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...currentSession.messages, userMessage],
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

      // Append an empty assistant message first
      set((state) => {
        const session = state.sessions[sessionId];
        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              messages: [
                ...session.messages,
                { role: 'assistant', content: '' },
              ],
            },
          },
        };
      });

      // Stream the response chunks
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;

        // Update the content of the last assistant message
        set((state) => {
          const session = state.sessions[sessionId];
          const messagesCopy = [...session.messages];
          messagesCopy[messagesCopy.length - 1].content = accumulatedResponse;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: messagesCopy,
              },
            },
          };
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      set((state) => {
        const session = state.sessions[sessionId];
        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              isLoading: false,
            },
          },
        };
      });
    }
  },
}));

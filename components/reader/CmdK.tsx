import { useEffect } from 'react';

import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { useEpubStore } from '@/store/epubStore';
import { copyToClipboard } from '@/utils/clipboard';

export function CmdK() {
  const { reader } = useEpubStore();
  const selectedText = reader?.selectedText;
  const { onOpen } = useCommandPaletteStore();

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

  return (
    <CommandPalette
      sections={commandSections}
      placeholder="Search actions..."
    />
  );

}

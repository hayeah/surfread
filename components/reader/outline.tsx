import React from 'react';
import { NavItem } from 'epubjs';

interface OutlineProps {
  toc: NavItem[];
  onChapterSelect: (href: string) => void;
}

export function Outline({ toc, onChapterSelect }: OutlineProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <nav>
        {toc.map((chapter, index) => (
          <button
            key={index}
            onClick={() => onChapterSelect(chapter.href)}
            className="block w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
          >
            {chapter.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

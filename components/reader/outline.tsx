import React from 'react';
import { FlatTOC } from '../../store/epubStore';

interface OutlineProps {
  toc: FlatTOC;
  onChapterSelect: (href: string) => void;
}

export function Outline({ toc, onChapterSelect }: OutlineProps) {
  return (
    <div className="h-full">
      <nav>
        {toc.map((item, index) => (
          <button
            key={index}
            onClick={() => onChapterSelect(item.href)}
            className={`block w-full text-left py-2 hover:bg-gray-100 rounded ${item.level === 0 ? 'font-bold' : ''
              }`}
            style={{ paddingLeft: `${item.level * 1}rem` }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

import React from 'react';
import { NavItem } from 'epubjs';

interface OutlineProps {
  toc: NavItem[];
  onChapterSelect: (href: string) => void;
}

export function Outline({ toc, onChapterSelect }: OutlineProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <nav>
        {toc.map((chapter, index) => {
          const hasSubitems = chapter.subitems && chapter.subitems.length > 0;

          if (hasSubitems) {
            return (
              <div key={index}>
                <div className="py-2 px-4 font-medium text-gray-700">
                  {chapter.label}
                </div>
                {chapter.subitems!.map((subitem, subIndex) => (
                  <button
                    key={`${index}-${subIndex}`}
                    onClick={() => onChapterSelect(subitem.href)}
                    className="block w-full text-left py-2 pl-8 pr-4 hover:bg-gray-100 rounded text-sm"
                  >
                    {subitem.label}
                  </button>
                ))}
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => onChapterSelect(chapter.href)}
              className="block w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
            >
              {chapter.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

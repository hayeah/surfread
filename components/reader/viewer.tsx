import React, { useEffect, useRef } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface ViewerProps {
  book: Book;
  currentLocation?: string;
}

export function Viewer({ book, currentLocation }: ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const displayPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (viewerRef.current && book) {
      renditionRef.current = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none'
      });
      displayPromiseRef.current = renditionRef.current.display();
    }

    return () => {
      if (renditionRef.current) {
        // Wait for display to finish before destroying
        displayPromiseRef.current!.then(() => {
          if (renditionRef.current) {
            renditionRef.current.destroy();
          }
        });
      }
    };
  }, [book]);

  // useEffect(() => {
  //   if (currentLocation && renditionRef.current) {
  //     renditionRef.current.display(currentLocation);
  //   }
  // }, [currentLocation]);

  return (
    <div ref={viewerRef} className="w-full h-full bg-white" />
  );
}

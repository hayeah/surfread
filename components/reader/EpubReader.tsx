import { useEffect, useState, useCallback } from 'react';
import { ReadingGuide } from '@/components/reader/ReadingGuide';
import { Viewer } from '@/components/reader/viewer';
import { useEpubStore } from '@/store/epubStore';
import { FloatingOutline } from '@/components/reader/FloatingOutline';

export function EpubReader() {
  const { reader: book } = useEpubStore();
  const { epub: epub, currentLocation, flatTOC } = book!;

  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  const handleCloseOutline = useCallback(() => {
    setIsOutlineOpen(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseOutline();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleCloseOutline]);


  return (
    <div className="h-full relative">
      <button
        onClick={() => setIsOutlineOpen(!isOutlineOpen)}
        className="fixed left-4 top-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 outline-toggle"
        title="Toggle Contents"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button >

      <FloatingOutline
        isOpen={isOutlineOpen}
        onClose={handleCloseOutline}
      />

      <ReadingGuide />

      <Viewer
        book={epub}
        currentLocation={currentLocation}
      />
    </div >
  );
}

import React from 'react';
import { Outline } from './outline';
import { useEpubStore } from '@/store/epubStore';

interface FloatingOutlineProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingOutline: React.FC<FloatingOutlineProps> = ({ isOpen, onClose }) => {
  const { reader, setCurrentLocation, closeBook } = useEpubStore();

  if (!isOpen) return null;

  const { flatTOC } = reader!;

  return (
    <div className="fixed left-16 top-4 z-50 w-80 bg-white rounded-lg shadow-lg border outline-panel">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Contents</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-[80vh] overflow-y-auto px-4">
        <Outline toc={flatTOC} onChapterSelect={(location) => {
          setCurrentLocation(location);
          onClose();
        }} />
      </div>
    </div>
  );
};

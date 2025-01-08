import React from 'react';
import { useRouter } from 'next/router';
import { useEpubStore } from '@/store/epubStore';
import { Dropzone } from '@/components/ui/dropzone';

export const EpubLibrary = () => {

  const { handleFileAccepted, availableBooks, loadBook, deleteBook } = useEpubStore();

  const router = useRouter();

  const handleBookClick = (key: string) => {
    loadBook(key).then(() => {
      router.push(`/epub?book=${key}`, undefined, { shallow: true });
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook(key);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto mb-8" />

      {availableBooks.length > 0 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Your Books</h2>
          <div className="space-y-4">
            {availableBooks.map(({ key, title, timestamp }) => (
              <div
                key={key}
                onClick={() => handleBookClick(key)}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-gray-500">
                    Added {new Date(timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, key)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};
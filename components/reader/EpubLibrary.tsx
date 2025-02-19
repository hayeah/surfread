import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEpubStore } from '@/store/epubStore';
import { Dropzone } from '@/components/ui/dropzone';

export const EpubLibrary = () => {

  const { handleFileAccepted, availableBooks, loadBook, deleteBook } = useEpubStore();

  const router = useRouter();
  const { book: bookId } = router.query;

  const handleBookClick = (id: number) => {
    router.push(`/epub?book=${id}`, undefined, { shallow: true });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto mb-8" />

      {availableBooks.length > 0 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Your Books</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-8">
            {availableBooks.map(({ id, title, timestamp }) => (
              <div
                key={id}
                onClick={() => handleBookClick(id)}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-gray-500">
                    Added {new Date(timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, id)}
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
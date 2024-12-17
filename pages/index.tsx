import { useState, useEffect } from 'react';
import Head from 'next/head';
import ePub, { Book, NavItem } from 'epubjs';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';

export default function Home() {
  const [book, setBook] = useState<Book | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>();

  useEffect(() => {
    // Try to load the last opened file from localStorage
    const lastFile = localStorage.getItem('lastEpubFile');
    if (lastFile) {
      const arrayBuffer = new Uint8Array(JSON.parse(lastFile)).buffer;
      const newBook = ePub(arrayBuffer);
      newBook.ready.then(() => {
        setNavigation(newBook.navigation.toc);
        setBook(newBook);
      }).catch((error) => {
        console.error('Error loading EPUB from localStorage:', error);
        localStorage.removeItem('lastEpubFile');
      });
    }
  }, []);

  const handleFileAccepted = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        // Save the file to localStorage
        const arrayBuffer = e.target.result as ArrayBuffer;
        localStorage.setItem('lastEpubFile', JSON.stringify(Array.from(new Uint8Array(arrayBuffer))));

        const newBook = ePub(e.target.result);
        try {
          await newBook.ready;
          setNavigation(newBook.navigation.toc);
          setBook(newBook);
        } catch (error) {
          console.error('Error loading EPUB:', error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Head>
        <title>EPUB Reader</title>
        <meta name="description" content="A web-based EPUB reader" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        {!book ? (
          <div className="container mx-auto px-4 py-12">
            <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto" />
          </div>
        ) : (
          <div className="flex h-screen">
            {/* Left sidebar - Table of Contents */}
            <div className="w-64 border-r bg-white overflow-y-auto hidden md:block">
              <div className="p-4 border-b">
                <button
                  onClick={() => {
                    setBook(null);
                    setNavigation([]);
                    localStorage.removeItem('lastEpubFile');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close Book
                </button>
              </div>
              {navigation && (
                <Outline
                  toc={navigation}
                  onChapterSelect={href => setCurrentLocation(href)}
                />
              )}
            </div>

            {/* Main content - centered with max width */}
            <div className="flex-1 flex justify-center bg-gray-50">
              <div className="max-w-[600px] w-full relative">
                {book && (
                  <Viewer
                    book={book}
                    currentLocation={currentLocation}
                    navigation={navigation}
                  />
                )}
              </div>
            </div>

            {/* Right toolbar - only visible on large screens */}
            <div className="w-64 border-l bg-white overflow-y-auto hidden lg:block">
              <div className="p-4">
                <h3 className="font-medium mb-4">Tools</h3>
                {/* Add toolbar buttons/controls here */}
                <button className="w-full mb-2 px-4 py-2 text-left hover:bg-gray-100 rounded">
                  Font Size
                </button>
                <button className="w-full mb-2 px-4 py-2 text-left hover:bg-gray-100 rounded">
                  Theme
                </button>
                <button className="w-full mb-2 px-4 py-2 text-left hover:bg-gray-100 rounded">
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

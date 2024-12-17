import { useState } from 'react';
import Head from 'next/head';
import ePub, { Book, NavItem } from 'epubjs';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';

export default function Home() {
  const [book, setBook] = useState<Book | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>();

  const handleFileAccepted = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
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
            <div className="w-64 border-r bg-white overflow-y-auto">
              {navigation && (
                <Outline
                  toc={navigation}
                  onChapterSelect={href => setCurrentLocation(href)}
                />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <Viewer book={book} currentLocation={currentLocation} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

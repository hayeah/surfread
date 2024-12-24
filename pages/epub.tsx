import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ePub, { Book, NavItem } from 'epubjs';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';
import AppFrame from "../components/Frame/AppFrame";

const EpubReader = ({
  onBookLoaded,
  onNavigationLoaded,
  currentLocation,
  onLocationChange,
  onScrollPositionChange,
  onTextSelect,
}: {
  onBookLoaded: (book: Book) => void;
  onNavigationLoaded: (nav: NavItem[]) => void;
  currentLocation?: string;
  onLocationChange: (location: string) => void;
  onScrollPositionChange: (position: number) => void;
  onTextSelect: (selection: { text: string; context: string; cfi?: string }) => void;
}) => {
  const [book, setBook] = useState<Book | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([]);

  useEffect(() => {
    // Try to load the last opened file from localStorage
    const lastFile = localStorage.getItem('lastEpubFile');
    if (lastFile) {
      const arrayBuffer = new Uint8Array(JSON.parse(lastFile)).buffer;
      const newBook = ePub(arrayBuffer);
      newBook.ready.then(() => {
        const nav = newBook.navigation.toc;
        setNavigation(nav);
        setBook(newBook);
        onBookLoaded(newBook);
        onNavigationLoaded(nav);
      }).catch((error) => {
        console.error('Error loading EPUB from localStorage:', error);
        localStorage.removeItem('lastEpubFile');
      });
    }
  }, [onBookLoaded, onNavigationLoaded]);

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
          const nav = newBook.navigation.toc;
          setNavigation(nav);
          setBook(newBook);
          onBookLoaded(newBook);
          onNavigationLoaded(nav);
        } catch (error) {
          console.error('Error loading EPUB:', error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="h-full w-full bg-white">
      {!book ? (
        <div className="container mx-auto px-4 py-12">
          <Dropzone onFileAccepted={handleFileAccepted} className="max-w-xl mx-auto" />
        </div>
      ) : (
        <div className="h-full relative">
          <Viewer
            book={book}
            currentLocation={currentLocation}
            navigation={navigation}
            onScrollPositionChange={onScrollPositionChange}
            onTextSelect={onTextSelect}
          />
        </div>
      )}
    </div>
  );
};

const EpubOutline = ({ navigation, onChapterSelect, onCloseBook }: {
  navigation: NavItem[],
  onChapterSelect: (href: string) => void,
  onCloseBook: () => void
}) => {
  return (
    <div className="h-full w-full bg-white">
      <div className="p-4 border-b">
        <button
          onClick={onCloseBook}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Close Book
        </button>
      </div>
      {navigation && (
        <Outline
          toc={navigation}
          onChapterSelect={onChapterSelect}
        />
      )}
    </div>
  );
};

const EpubPage = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>();
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<{ text: string; context: string; cfi?: string } | undefined>();

  const tabs = [
    {
      id: "reader",
      label: "Reader",
      content: (
        <div className="p-4">
          <div className="text-sm text-gray-500">
            Progress: {Math.round(scrollPosition * 100)}%
          </div>

          {selectedText && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700">Selected Text</div>
              <div className="mt-1 text-sm text-gray-600">{selectedText.text}</div>
              {selectedText.context && (
                <>
                  <div className="mt-2 text-sm font-medium text-gray-700">Context</div>
                  <div className="mt-1 text-sm text-gray-500">{selectedText.context}</div>
                </>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      content: <div className="p-4">Reader Settings (Coming Soon)</div>,
    },
  ];

  return (
    <>
      <Head>
        <title>EPUB Reader</title>
        <meta name="description" content="A web-based EPUB reader" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppFrame
        leftDrawerContent={
          <EpubReader
            onBookLoaded={setBook}
            onNavigationLoaded={setNavigation}
            currentLocation={currentLocation}
            onLocationChange={setCurrentLocation}
            onScrollPositionChange={setScrollPosition}
            onTextSelect={setSelectedText}
          />
        }
        rightDrawerContent={
          <EpubOutline
            navigation={navigation}
            onChapterSelect={(href) => setCurrentLocation(href)}
            onCloseBook={() => {
              setBook(null);
              setNavigation([]);
              localStorage.removeItem('lastEpubFile');
            }}
          />
        }
        tabs={tabs}
      />
    </>
  );
};

export default EpubPage;

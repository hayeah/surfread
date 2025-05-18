import { useState, useEffect } from 'react';
import Head from 'next/head';
import ePub, { Book, NavItem } from 'epubjs';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';

interface LeftSidebarProps {
  navigation: NavItem[];
  onChapterSelect: (href: string) => void;
  onCloseBook: () => void;
}

function LeftSidebar({ navigation, onChapterSelect, onCloseBook }: LeftSidebarProps) {
  return (
    <div className="w-64 border-r bg-white overflow-y-auto hidden md:block">
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
}

interface RightSidebarProps {
  book: Book;
  scrollPosition: number;
  selectedText?: {
    text: string;
    context: string;
    cfi?: string;
  };
}

function RightSidebar({ book, scrollPosition, selectedText }: RightSidebarProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedText) {
      setExplanation("");
      setError("");
      return;
    }

    async function getExplanation() {
      // disable for now
      return
      if (!selectedText) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: selectedText.text,
            context: selectedText.context,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get explanation');
        }

        setExplanation(data.explanation);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to get explanation');
      } finally {
        setIsLoading(false);
      }
    }

    getExplanation();
  }, [selectedText]);

  return (
    <div className="w-64 border-l bg-white overflow-y-auto hidden lg:block">
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

            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700">Explanation</div>
              {isLoading ? (
                <div className="mt-2 text-sm text-gray-500">Loading explanation...</div>
              ) : error ? (
                <div className="mt-2 text-sm text-red-500">{error}</div>
              ) : explanation ? (
                <div className="mt-2 text-sm text-gray-600">{explanation}</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [book, setBook] = useState<Book | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>();
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<{ text: string; context: string; cfi?: string } | undefined>();

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
        // localStorage.setItem('lastEpubFile', JSON.stringify(Array.from(new Uint8Array(arrayBuffer))));

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
            <LeftSidebar
              navigation={navigation}
              onChapterSelect={href => setCurrentLocation(href)}
              onCloseBook={() => {
                setBook(null);
                setNavigation([]);
                localStorage.removeItem('lastEpubFile');
              }}
            />

            {/* Main content - centered with max width */}
            <div className="flex-1 flex justify-center bg-gray-50">
              <div className="max-w-[600px] w-full relative">
                {book && (
                  <Viewer
                    book={book}
                    currentLocation={currentLocation}
                    navigation={navigation}
                    onScrollPositionChange={setScrollPosition}
                    onTextSelect={setSelectedText}
                  />
                )}
              </div>
            </div>

            <RightSidebar
              book={book}
              scrollPosition={scrollPosition}
              selectedText={selectedText}
            />
          </div>
        )}
      </main>
    </>
  );
}

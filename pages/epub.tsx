import React, { useEffect } from 'react';
import Head from 'next/head';
import { Dropzone } from '@/components/ui/dropzone';
import { Outline } from '@/components/reader/outline';
import { Viewer } from '@/components/reader/viewer';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const EpubReader = () => {
  const { book, navigation, currentLocation, handleFileAccepted, setCurrentLocation, setScrollPosition, setSelectedText } = useEpubStore();

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
          />
        </div>
      )}
    </div>
  );
};

const EpubOutline = () => {
  const { navigation, setCurrentLocation, closeBook } = useEpubStore();

  return (
    <div className="h-full w-full bg-white">
      <div className="p-4 border-b">
        <button
          onClick={closeBook}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Close Book
        </button>
      </div>
      <Outline toc={navigation} onChapterSelect={setCurrentLocation} />
    </div>
  );
};

export default function EpubPage() {
  const { book, selectedText, currentLocation, loadLastBook } = useEpubStore();

  useEffect(() => {
    loadLastBook();
  }, [loadLastBook]);

  const tabs = [
    {
      id: "reader",
      label: "Reader",
      content: (
        <div className="p-4">
          {currentLocation && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700">Current Location</div>
              <div className="mt-1 text-sm text-gray-600">{currentLocation}</div>
            </div>
          )}

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
        leftDrawerContent={<EpubReader />}
        rightDrawerContent={book ? <EpubOutline /> : null}
        tabs={tabs}
      />
    </>
  );
}

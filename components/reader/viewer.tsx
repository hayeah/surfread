import { useEffect, useRef } from 'react';
import { Book, Rendition, NavItem } from 'epubjs';
import debounce from 'lodash/debounce';
import { useEpubStore } from '@/store/epubStore';
import { getSelectionContext } from './getSelectionContext';


interface ViewerProps {
  book: Book;
  currentLocation?: string;
}

export function Viewer({ book, currentLocation }: ViewerProps) {
  const { setCurrentLocation, setSelectedText, saveProgress, goToNextNavItem, goToPreviousNavItem } = useEpubStore();
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const displayPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (viewerRef.current && book) {
      renditionRef.current = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'scrolled-doc',
        // view: 'inline',
      });

      // Epub.js enforces rigid layout for iframes and sets inline body styles.
      //   - It explicitly sets something like `padding: 0 (width / 12)px` on the <body>.
      //   - Bottom padding on <body> gets ignored because epub.js measures content height
      //     and fixes the iframe size accordingly, clipping any extra space.
      // Hence, to create bottom spacing in scrolled-doc flow, we target the last child
      //   and add padding to it. That way the actual content's height increases and
      //   epub.js won't clip it.
      renditionRef.current.themes.default({
        'body': {
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'font-size': '16px',
          // 'color': 'red',

          'padding': '0px 1empx 0px 1em  !important',

          // This doesn't work
          // 'padding-bottom': '300px !important',
        },

        "p": {
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'text-align': 'start !important',
          'line-height': '1.5',
        },

        'body > *:last-child': {
          'padding-bottom': '100px !important'
        },
      });

      // Wait for the rendition to be ready
      renditionRef.current.on('rendered', () => {
        // Now the iframe should be available.
        const iframe = viewerRef.current?.querySelector('iframe');
        if (iframe?.contentWindow) {
          iframe.contentWindow.addEventListener('keydown', (event) => {
            window.dispatchEvent(new KeyboardEvent('keydown', {
              key: event.key,
              metaKey: event.metaKey,
              ctrlKey: event.ctrlKey,
              altKey: event.altKey,
              shiftKey: event.shiftKey,
              bubbles: true
            }));
          });
        }
      });

      displayPromiseRef.current = renditionRef.current.display();

      const debounceSaveProgress = debounce(saveProgress, 300);

      // Save location to db without updating current location in store
      renditionRef.current.on("locationChanged", (location: any) => {
        debounceSaveProgress(location.start);
      });

      // Add selection event handler
      const debounceSelectText = debounce(setSelectedText, 300);

      renditionRef.current.on("selected", (cfiRange: string, contents: any) => {
        const selection = contents.window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const selectedText = selection.toString().trim();
        if (!selectedText) return;

        debounceSelectText({
          text: selectedText,
          context: getSelectionContext(selection),
          cfi: cfiRange
        });
      });

      return () => {
        if (renditionRef.current) {
          renditionRef.current.destroy();
        }
      };
    }
  }, [book]);

  useEffect(() => {
    if (currentLocation && renditionRef.current) {
      renditionRef.current.display(currentLocation);
    }
  }, [currentLocation]);

  return (
    <div className="relative h-full">
      {/* IMPORTANT: The width and height must be set to 100%, else locationChanged event will not be triggered */}
      <div className="h-full w-full" ref={viewerRef}></div>
      <button
        onClick={goToPreviousNavItem}
        className="fixed bottom-8 left-8 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        title="Previous Chapter"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNextNavItem}
        className="fixed bottom-8 right-8 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        title="Next Chapter"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

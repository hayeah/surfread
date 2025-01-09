import { useEffect, useRef } from 'react';
import { Book, Rendition, NavItem } from 'epubjs';
import debounce from 'lodash/debounce';
import { useEpubStore } from '@/store/epubStore';
import { getSelectionContext } from './getSelectionContext';

interface ViewerProps {
  book: Book;
  currentLocation?: string;
  navigation: NavItem[];
}

export function Viewer({ book, currentLocation }: ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const displayPromiseRef = useRef<Promise<any> | null>(null);
  const { setCurrentLocation, setSelectedText, saveProgress } = useEpubStore();

  useEffect(() => {
    if (viewerRef.current && book) {
      renditionRef.current = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'scrolled-doc',
      });

      renditionRef.current.themes.default({
        'body': {
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'font-size': '16px',
          'line-height': '1.6',
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
    // IMPORTANT: The width and height must be set to 100%, else locationChanged event will not be triggered
    <div className="h-full w-full" ref={viewerRef}></div>
  );
}

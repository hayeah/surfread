import React, { useEffect, useRef, useCallback } from 'react';
import { Book, Rendition, NavItem, Location } from 'epubjs';
import { findNavItemByHref, encodeLocation, decodeLocation } from '@/lib/navigation';
import debounce from 'lodash/debounce';
import { useEpubStore } from '@/store/epubStore';

interface ViewerProps {
  book: Book;
  currentLocation?: string;
  navigation: NavItem[];
}

export function Viewer({ book, currentLocation, navigation }: ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const displayPromiseRef = useRef<Promise<any> | null>(null);
  const { setCurrentLocation, setSelectedText } = useEpubStore();

  const debouncedTextSelect = useCallback(
    debounce((selection: { text: string; context: string; cfi?: string }) => {
      console.log("selected", selection);
      setSelectedText(selection);
    }, 100),
    [setSelectedText]
  );

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

      // Add keyboard event listener to the iframe's content window
      const iframe = viewerRef.current.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.addEventListener('keydown', (event) => {
          console.log('iframe keydown event:', event);
          if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.stopPropagation();
            // Post message to parent window
            window.postMessage({ type: 'COMMAND_PALETTE_TOGGLE' }, '*');
          }
        });
      }

      // Get initial location from localStorage or hash
      let storedLocationString = localStorage.getItem('readerLocation');
      if (storedLocationString == "undefined") {
        storedLocationString = "null";
      }
      const storedLocation = storedLocationString ? JSON.parse(storedLocationString) : undefined;
      const initialHash = window.location.hash.slice(1);
      const initialLocation = storedLocation || (initialHash ? decodeLocation(navigation, initialHash) : undefined);

      displayPromiseRef.current = renditionRef.current.display(initialLocation);

      // Track current location when navigating
      renditionRef.current.on("locationChanged", (location: Location) => {
        localStorage.setItem('readerLocation', JSON.stringify(location.start));
        setCurrentLocation(location.start.href);
      });

      // Add selection event handler
      renditionRef.current.on("selected", (cfiRange: string, contents: any) => {
        const selection = contents.window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const selectedText = selection.toString().trim();
        if (!selectedText) return;

        debouncedTextSelect({
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
  }, [book, navigation, debouncedTextSelect, setCurrentLocation]);

  useEffect(() => {
    if (currentLocation && renditionRef.current) {
      renditionRef.current.display(currentLocation);
    }
  }, [currentLocation]);

  return (
    <div ref={viewerRef} className="h-full w-full" />
  );
}

function getSelectionContext(selection: Selection): string {
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const context = container.textContent || '';
  return context.trim();
}

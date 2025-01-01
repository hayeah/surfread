import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Book, Rendition, NavItem, Location } from 'epubjs';
import { findNavItemByHref, encodeLocation, decodeLocation } from '@/lib/navigation';
import debounce from 'lodash/debounce';
import { useEpubStore } from '@/store/epubStore';
import { getSelectionContext } from './getSelectionContext';

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
    <div className="h-full w-full flex flex-col overflow-y-auto">
      <div className="flex-grow" ref={viewerRef}></div>
      <div className="h-[400px] flex flex-col items-center justify-center text-gray-100 text-3xl select-none space-y-4 py-8">
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    </div>

  );
}

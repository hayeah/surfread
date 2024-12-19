import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition, NavItem, Location } from 'epubjs';
import { findNavItemByHref, encodeLocation, decodeLocation } from '@/lib/navigation';

interface ViewerProps {
  book: Book;
  currentLocation?: string;
  navigation: NavItem[];
  onScrollPositionChange?: (position: number) => void;
  onTextSelect?: (selection: { text: string; context: string; cfi?: string }) => void;
}

export function Viewer({ book, currentLocation, navigation, onScrollPositionChange, onTextSelect }: ViewerProps) {
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
      });

      renditionRef.current.themes.default({
        'body': {
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'font-size': '16px',
          'line-height': '1.6',
          'margin': '0 auto',
          'padding': '0 1rem'
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

      // Handle location changes
      // renditionRef.current.on('relocated', (location: Location) => {
      //   const href = location.start.href;
      //   if (href) {
      //     const navItem = findNavItemByHref(navigation, href);
      //     const hash = encodeLocation(navItem, href);
      //     window.history.replaceState(null, '', `#${hash}`);
      //   }
      // });

      // Track current location when navigating
      renditionRef.current.on("locationChanged", (location: Location) => {
        // Store location in localStorage
        localStorage.setItem('readerLocation', JSON.stringify(location.start));
        console.log("Current location:", location);
      });

      // Add selection event handler
      renditionRef.current.on("selected", (cfiRange: string, contents: any) => {
        if (!onTextSelect) return;

        const selection = contents.window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const selectedText = selection.toString().trim();
        
        // Get the current section's content
        const section = contents.document.body;
        const walker = contents.document.createTreeWalker(
          section,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        // Find the selected range's start and end positions
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        // Collect all text nodes
        const textNodes: Text[] = [];
        let currentNode: Node | null = walker.nextNode();
        
        while (currentNode) {
          textNodes.push(currentNode as Text);
          currentNode = walker.nextNode();
        }

        // Find indices of start and end containers
        const startNodeIndex = textNodes.findIndex(node => node === startContainer);
        const endNodeIndex = textNodes.findIndex(node => node === endContainer);

        if (startNodeIndex === -1 || endNodeIndex === -1) return;

        // Get context nodes (up to 2 nodes before and after)
        const contextStart = Math.max(0, startNodeIndex - 2);
        const contextEnd = Math.min(textNodes.length - 1, endNodeIndex + 2);

        // Build context string
        let beforeContext = '';
        let afterContext = '';

        // Get text before selection
        for (let i = contextStart; i < startNodeIndex; i++) {
          beforeContext += textNodes[i].textContent || '';
        }
        beforeContext += startContainer.textContent?.slice(0, range.startOffset) || '';

        // Get text after selection
        afterContext += endContainer.textContent?.slice(range.endOffset) || '';
        for (let i = endNodeIndex + 1; i <= contextEnd; i++) {
          afterContext += textNodes[i].textContent || '';
        }

        // Trim and limit context length
        const maxContextLength = 200;
        beforeContext = beforeContext.trim().slice(-maxContextLength);
        afterContext = afterContext.trim().slice(0, maxContextLength);

        // Store CFI range for potential future use
        const cfi = cfiRange;

        onTextSelect({
          text: selectedText,
          context: `...${beforeContext} [${selectedText}] ${afterContext}...`,
          cfi // This might be useful for future enhancements
        });
      });

    }

    return () => {
    if (renditionRef.current) {
      displayPromiseRef.current!.then(() => {
        if (renditionRef.current) {
          renditionRef.current.destroy();
        }
      });
    }
  };
}, [book, navigation]);

useEffect(() => {
  if (currentLocation && renditionRef.current) {
    renditionRef.current.display(currentLocation);
  }
}, [currentLocation]);

return (
  <div ref={viewerRef} className="w-full h-full bg-white" />
);
}

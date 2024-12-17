import React, { useEffect, useRef } from 'react';
import ePub, { Book, Rendition, NavItem } from 'epubjs';
import { findNavItemByHref, encodeLocation, decodeLocation } from '@/lib/navigation';

interface ViewerProps {
  book: Book;
  currentLocation?: string;
  navigation: NavItem[];
}

export function Viewer({ book, currentLocation, navigation }: ViewerProps) {
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

      // Get initial location from hash, handling both encoded chapter names and raw hrefs
      const initialHash = window.location.hash.slice(1);
      const initialLocation = initialHash ? decodeLocation(navigation, initialHash) : undefined;
      displayPromiseRef.current = renditionRef.current.display(initialLocation);

      // Handle location changes
      renditionRef.current.on('relocated', (location: {
        start: { href: string };
        end: { href: string };
      }) => {
        const href = location.start.href;
        if (href) {
          const navItem = findNavItemByHref(navigation, href);
          const hash = encodeLocation(navItem, href);
          window.history.replaceState(null, '', `#${hash}`);
        }
      });

      // Handle browser back/forward
      const handlePopState = () => {
        const hash = window.location.hash.slice(1);
        if (hash && renditionRef.current) {
          const href = decodeLocation(navigation, hash);
          renditionRef.current.display(href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
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

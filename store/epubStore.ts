import { create } from 'zustand';
import ePub, { Book, NavItem } from 'epubjs';
import { EpubIndexedDB } from './epubIndexedDB';

interface EpubStore {
  book: Book | null;
  navigation: NavItem[];
  currentLocation: string | undefined;
  scrollPosition: number;
  selectedText: { text: string; context: string; cfi?: string } | null;
  availableBooks: { key: string; title: string; timestamp: number }[];
  setBook: (book: Book) => void;
  setNavigation: (nav: NavItem[]) => void;
  setCurrentLocation: (location: string) => void;
  setScrollPosition: (position: number) => void;
  setSelectedText: (selection: { text: string; context: string; cfi?: string } | null) => void;
  // loadLastBook: () => Promise<void>;
  loadBook: (key: string) => Promise<void>;
  handleFileAccepted: (file: File) => Promise<void>;
  closeBook: () => void;
  refreshAvailableBooks: () => Promise<void>;
  deleteBook: (key: string) => Promise<void>;
}

export const useEpubStore = create<EpubStore>((set, get) => ({
  book: null,
  navigation: [],
  currentLocation: undefined,
  scrollPosition: 0,
  selectedText: null,
  availableBooks: [],

  setBook: (book) => set({ book }),
  setNavigation: (navigation) => set({ navigation }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setScrollPosition: (scrollPosition) => set({ scrollPosition }),
  setSelectedText: (selectedText) => set({ selectedText }),

  refreshAvailableBooks: async () => {
    const epubDB = await EpubIndexedDB.singleton();
    const epubs = await epubDB.getAllEpubs();
    console.log(epubs);
    set({
      availableBooks: epubs.map(({ title, timestamp }) => ({
        key: epubDB.titleToKey(title),
        title,
        timestamp,
      })),
    });
  },

  loadBook: async (key: string) => {
    try {
      const epubDB = await EpubIndexedDB.singleton();
      const entry = await epubDB.getEpub(key);
      if (entry) {
        const newBook = ePub(entry.data);
        await newBook.ready;
        const nav = newBook.navigation.toc;
        set({ book: newBook, navigation: nav });
      }
    } catch (error) {
      console.error('Error loading EPUB:', error);
    }
  },

  handleFileAccepted: async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Save to IndexedDB
      const epubDB = await EpubIndexedDB.singleton();
      const title = file.name.replace(/\.epub$/, '');
      await epubDB.saveEpub(title, arrayBuffer);
      await get().refreshAvailableBooks();
    } catch (error) {
      console.error('Error loading EPUB:', error);
    }
  },

  deleteBook: async (key: string) => {
    try {
      const epubDB = await EpubIndexedDB.singleton();
      await epubDB.deleteEpub(key);
      await get().refreshAvailableBooks();
    } catch (error) {
      console.error('Error deleting EPUB:', error);
    }
  },

  closeBook: async () => {
    const { book } = get();
    if (book) {
      book.destroy();
    }
    set({ book: null, navigation: [], currentLocation: undefined, scrollPosition: 0, selectedText: null });
  },
}));

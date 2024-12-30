import { create } from 'zustand';
import ePub, { Book, NavItem } from 'epubjs';
import { EpubIndexedDB } from './epubIndexedDB';

interface EpubStore {
  book: Book | null;
  navigation: NavItem[];
  currentLocation: string | undefined;
  scrollPosition: number;
  selectedText: { text: string; context: string; cfi?: string } | null;
  setBook: (book: Book) => void;
  setNavigation: (nav: NavItem[]) => void;
  setCurrentLocation: (location: string) => void;
  setScrollPosition: (position: number) => void;
  setSelectedText: (selection: { text: string; context: string; cfi?: string } | null) => void;
  loadLastBook: () => Promise<void>;
  handleFileAccepted: (file: File) => Promise<void>;
  closeBook: () => void;
}

export const useEpubStore = create<EpubStore>((set, get) => ({
  book: null,
  navigation: [],
  currentLocation: undefined,
  scrollPosition: 0,
  selectedText: null,

  setBook: (book) => set({ book }),
  setNavigation: (navigation) => set({ navigation }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setScrollPosition: (scrollPosition) => set({ scrollPosition }),
  setSelectedText: (selectedText) => set({ selectedText }),

  loadLastBook: async () => {
    try {
      const epubDB = await EpubIndexedDB.singleton();
      const arrayBuffer = await epubDB.getLastEpub();
      if (arrayBuffer) {
        const newBook = ePub(arrayBuffer);
        await newBook.ready;
        const nav = newBook.navigation.toc;
        set({ book: newBook, navigation: nav });
      }
    } catch (error) {
      console.error('Error loading EPUB from IndexedDB:', error);
      const epubDB = await EpubIndexedDB.singleton();
      await epubDB.clearLastEpub();
    }
  },

  handleFileAccepted: async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const newBook = ePub(arrayBuffer);
      await newBook.ready;
      const nav = newBook.navigation.toc;
      set({ book: newBook, navigation: nav });

      // Save to IndexedDB
      const epubDB = await EpubIndexedDB.singleton();
      await epubDB.saveEpub(arrayBuffer);
    } catch (error) {
      console.error('Error loading EPUB:', error);
    }
  },

  closeBook: async () => {
    const { book } = get();
    if (book) {
      book.destroy();
    }

    const epubDB = await EpubIndexedDB.singleton();
    await epubDB.clearLastEpub();

    set({ book: null, navigation: [], currentLocation: undefined, scrollPosition: 0, selectedText: null });
  },
}));

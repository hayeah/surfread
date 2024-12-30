import { create } from 'zustand';
import ePub, { Book, NavItem } from 'epubjs';

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
    const lastFile = localStorage.getItem('lastEpubFile');
    if (lastFile) {
      try {
        const arrayBuffer = new Uint8Array(JSON.parse(lastFile)).buffer;
        const newBook = ePub(arrayBuffer);
        await newBook.ready;
        const nav = newBook.navigation.toc;
        set({ book: newBook, navigation: nav });
      } catch (error) {
        console.error('Error loading EPUB from localStorage:', error);
        localStorage.removeItem('lastEpubFile');
      }
    }
  },

  handleFileAccepted: async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // localStorage.setItem('lastEpubFile', JSON.stringify(Array.from(new Uint8Array(arrayBuffer))));

      const newBook = ePub(arrayBuffer);
      await newBook.ready;
      const nav = newBook.navigation.toc;
      set({ book: newBook, navigation: nav });
    } catch (error) {
      console.error('Error loading EPUB:', error);
    }
  },

  closeBook: () => {
    const { book } = get();
    if (book) {
      book.destroy();
    }
    set({
      book: null,
      navigation: [],
      currentLocation: undefined,
      scrollPosition: 0,
      selectedText: null
    });
    localStorage.removeItem('lastEpubFile');
    localStorage.removeItem('readerLocation');
  },
}));

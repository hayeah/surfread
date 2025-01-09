import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import ePub, { Book, NavItem } from 'epubjs';
import { EpubPgliteStore } from './epubPgliteStore';

let storePromise: Promise<EpubPgliteStore> | null = null;
async function getStore(): Promise<EpubPgliteStore> {
  if (!storePromise) {
    storePromise = EpubPgliteStore.init('idb://my-pgdata');
  }
  return storePromise;
}


interface CurrentBook {
  id: number;
  book: Book;
  toc: NavItem[];
  currentLocation: string | undefined;
  selectedText: { text: string; context: string; cfi?: string } | null;
}

interface EpubStore {
  book: CurrentBook | null;
  availableBooks: { id: number; title: string; timestamp: Date }[];

  // Action methods
  setCurrentLocation(location: string): void;
  setSelectedText(
    selection: { text: string; context: string; cfi?: string } | null
  ): void;
  loadBook(id: number): Promise<void>;
  handleFileAccepted(file: File): Promise<void>;
  closeBook(): void;
  refreshAvailableBooks(): Promise<void>;
  deleteBook(id: number): Promise<void>;
}

//
// 3. Create the store with Immer
//
export const useEpubStore = create<EpubStore>()(
  immer((set, get): EpubStore => ({
    book: null,
    availableBooks: [],


    setCurrentLocation: (currentLocation) => {
      set((state) => {
        if (state.book) {
          state.book.currentLocation = currentLocation;
        }
      });
      const { book } = get().book || {};
      if (book && currentLocation) {
        getStore().then((store) => {
          store.setReadingProgress(Number(book.key), currentLocation);
        });
      }
    },

    setSelectedText: (selectedText) => {
      set((state) => {
        if (state.book) {
          state.book.selectedText = selectedText;
        }
      });
    },

    refreshAvailableBooks: async () => {
      const store = await getStore();
      const books = await store.getAllEpubs();
      set((state) => {
        state.availableBooks = books.map(({ id, title, created_at }) => ({
          id,
          title,
          timestamp: created_at,
        }));
      });
    },

    loadBook: async (id: number) => {
      try {
        const store = await getStore();
        const book = await store.getEpub(id);
        if (book) {
          const newBook = ePub(book.epub_data);
          const nav = await newBook.loaded.navigation;
          const progress = await store.getReadingProgress(id);

          set((state) => {
            state.book = {
              id,
              book: newBook,
              toc: nav.toc,
              currentLocation: progress || undefined,
              selectedText: null
            };
          });

        }
      } catch (error) {
        console.error('Failed to load book:', error);
      }
    },

    handleFileAccepted: async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const store = await getStore();
        const title = file.name.replace(/\.epub$/, '');
        await store.addEpub(title, arrayBuffer);
        await get().refreshAvailableBooks();
      } catch (error) {
        console.error('Error loading EPUB:', error);
      }
    },

    deleteBook: async (id: number) => {
      try {
        const store = await getStore();
        await store.deleteEpub(id);
        await get().refreshAvailableBooks();
      } catch (error) {
        console.error('Error deleting EPUB:', error);
      }
    },

    closeBook: () => {
      const { book } = get();
      if (book) {
        book.book.destroy();
      }
      set((state) => {
        state.book = null;
        state.availableBooks = [];
      });
    },
  }))
);

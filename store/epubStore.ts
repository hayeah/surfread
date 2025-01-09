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

interface ReaderState {
  bookID: number;
  epub: Book;
  toc: NavItem[];
  currentLocation: string | undefined;
  selectedText: { text: string; context: string; cfi?: string } | null;
}

interface EpubStore {
  reader: ReaderState | null;
  availableBooks: { id: number; title: string; timestamp: Date }[];

  // Action methods
  setCurrentLocation(location: string): void;
  saveProgress(location: string): Promise<void>;
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
    reader: null,
    availableBooks: [],

    setCurrentLocation: async (currentLocation) => {
      set((state) => {
        if (state.reader) {
          state.reader.currentLocation = currentLocation;
        }
      });

      const { saveProgress } = get();
      await saveProgress(currentLocation);

      // const store = await getStore();
      // store.setReadingProgress(id, currentLocation);
    },

    saveProgress: async (location) => {
      const reader = get().reader;
      if (!reader) return;

      const store = await getStore();
      store.setReadingProgress(reader.bookID, location);
    },

    setSelectedText: (selectedText) => {
      set((state) => {
        if (state.reader) {
          state.reader.selectedText = selectedText;
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
        const progress = await store.getReadingProgress(id);

        if (book) {
          // Uint8Array to ArrayBuffer
          // IMPORTANT: ePub needs use ArrayBuffer. Uint8Array would cause it not to load, and silently fail.
          const arrayBuffer = new Uint8Array(book.epub_data).buffer;
          const newBook = ePub(arrayBuffer);
          await newBook.ready;

          const nav = newBook.navigation;

          set((state) => {
            state.reader = {
              bookID: id,
              epub: newBook,
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
      const { reader: book } = get();
      if (book) {
        book.epub.destroy();
      }
      set((state) => {
        state.reader = null;
        state.availableBooks = [];
      });
    },
  }))
);

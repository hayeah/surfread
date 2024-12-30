export class EpubIndexedDB {
  private static readonly DB_NAME = 'epubStorage';
  private static readonly STORE_NAME = 'epubs';
  private static readonly DB_VERSION = 1;
  private static instance: EpubIndexedDB | null = null;

  private constructor(private readonly db: IDBDatabase) { }

  static async singleton(): Promise<EpubIndexedDB> {
    if (this.instance) {
      return this.instance;
    }

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });

    this.instance = new EpubIndexedDB(db);
    return this.instance;
  }

  private async tx<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const transaction = this.db.transaction([EpubIndexedDB.STORE_NAME], mode);
    const store = transaction.objectStore(EpubIndexedDB.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = operation(store);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveEpub(arrayBuffer: ArrayBuffer): Promise<void> {
    await this.tx('readwrite', (store) => store.put(arrayBuffer, 'lastEpub'));
  }

  async getLastEpub(): Promise<ArrayBuffer | null> {
    return this.tx('readonly', (store) => store.get('lastEpub') || null);
  }

  async clearLastEpub(): Promise<void> {
    await this.tx('readwrite', (store) => store.delete('lastEpub'));
  }
}

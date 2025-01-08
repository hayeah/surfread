interface EpubEntry {
  title: string;
  data: ArrayBuffer;
  timestamp: number;
}

export class EpubIndexedDB {
  private static readonly DB_NAME = 'epubStorage';
  private static readonly STORE_NAME = 'epubs';
  private static readonly DB_VERSION = 2;
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

  // Convert title to URL-friendly string
  public titleToKey(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async saveEpub(title: string, arrayBuffer: ArrayBuffer): Promise<void> {
    const key = this.titleToKey(title);
    const entry: EpubEntry = {
      title,
      data: arrayBuffer,
      timestamp: Date.now(),
    };
    await this.tx('readwrite', (store) => store.put(entry, key));
  }

  async getEpub(key: string): Promise<EpubEntry | null> {
    return this.tx('readonly', (store) => store.get(key));
  }

  // Just get all records in the store:
  async getAllEpubs(): Promise<EpubEntry[]> {
    return this.tx('readonly', (store) => {
      // getAll() returns an IDBRequest<EpubEntry[]>, which is
      // exactly what the tx() helper expects.
      return store.getAll() as IDBRequest<EpubEntry[]>;
    });
  }

  async deleteEpub(key: string): Promise<void> {
    await this.tx('readwrite', (store) => store.delete(key));
  }

  // For backward compatibility
  async getLastEpub(): Promise<ArrayBuffer | null> {
    const epubs = await this.getAllEpubs();
    if (epubs.length === 0) return null;

    // Get the most recently added epub
    const latest = epubs.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
    return latest.data;
  }

  // For backward compatibility
  async clearLastEpub(): Promise<void> {
    // No-op since we don't have a single "last" epub anymore
  }
}

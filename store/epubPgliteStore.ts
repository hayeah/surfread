import { PGlite } from '@electric-sql/pglite';
import { Migrator, Migration } from '../db/Migrator';
import { BlobStore } from './blobStore';

/**
 * Migration definitions for the epub database schema.
 * Includes tables for storing epub books and their reading progress.
 */
const MIGRATIONS: Migration[] = [
  {
    name: '001_create_books_table',
    up: `
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '002_create_reading_progress_table',
    up: `
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        book_id INT NOT NULL REFERENCES books(id),
        session_key TEXT NOT NULL DEFAULT '',
        location TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (book_id, session_key)
      );
    `
  },
];

/**
 * Store for managing epub books and reading progress using PGlite.
 * Implements a singleton pattern and handles database migrations.
 */
export class EpubPgliteStore {
  private static instance: EpubPgliteStore | null = null;
  private db: PGlite;

  private constructor(db: PGlite) {
    this.db = db;
  }

  /**
   * Initialize the epub store with a PGlite database.
   * @param dbPath - Path to the database file. Empty string for in-memory database.
   * @returns Promise resolving to the singleton EpubPgliteStore instance.
   */
  static async init(dbPath: string = ""): Promise<EpubPgliteStore> {
    if (this.instance) {
      return this.instance;
    }

    const db = new PGlite(dbPath);
    const store = new EpubPgliteStore(db);
    const migrator = new Migrator(db);
    await migrator.up(MIGRATIONS);

    this.instance = store;
    return store;
  }

  /**
   * Convert a book title to a URL-friendly key.
   * @param title - The book title to convert.
   * @returns A lowercase, hyphen-separated string with only alphanumeric characters.
   */
  public titleToKey(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Add a new epub book to the store.
   * @param title - The title of the book.
   * @param data - The epub file contents as an ArrayBuffer.
   * @returns Promise resolving to the ID of the newly created book.
   */
  async addEpub(title: string, data: ArrayBuffer): Promise<number> {
    const result = await this.db.query<{ id: number }>(
      `INSERT INTO books (title)
       VALUES ($1)
       RETURNING id`,
      [title]
    );
    const id = result.rows[0].id;
    await BlobStore.singleton().then(store => store.put(id.toString(), data));
    return id;
  }

  /**
   * Retrieve an epub book by its ID.
   * @param id - The ID of the book to retrieve.
   * @returns Promise resolving to the book data or null if not found.
   */
  async getEpub(id: number): Promise<EpubBook | null> {
    const result = await this.db.query<Omit<EpubBook, 'epub_data'>>(
      'SELECT id, title FROM books WHERE id = $1',
      [id]
    );
    const book = result.rows[0];
    if (!book) return null;

    const store = await BlobStore.singleton();
    const epub_data = (await store.get(id.toString()))!;
    return { ...book, epub_data };
  }

  /**
   * Get a list of all epub books in the store.
   * @returns Promise resolving to an array of book metadata, ordered by creation date descending.
   */
  async getAllEpubs(): Promise<Array<EpubMetadata>> {
    const result = await this.db.query<EpubMetadata>(
      'SELECT id, title, created_at FROM books ORDER BY created_at DESC'
    );
    return result.rows;
  }

  /**
   * Delete an epub book and its associated reading progress.
   * Uses a transaction to ensure both operations succeed or fail together.
   * @param id - The ID of the book to delete.
   */
  async deleteEpub(id: number): Promise<void> {
    // Delete reading progress first due to foreign key constraint
    await this.db.transaction(async (tx) => {
      await tx.query('DELETE FROM reading_progress WHERE book_id = $1', [id]);
      await tx.query('DELETE FROM books WHERE id = $1', [id]);
    });

    const store = await BlobStore.singleton();
    await store.delete(id.toString());
  }

  /**
   * Set the reading progress for a book.
   * @param bookId - The ID of the book.
   * @param location - The reading location (e.g., chapter or position).
   * @param sessionKey - Optional session key for tracking multiple reading sessions of the same book.
   */
  async setReadingProgress(bookId: number, location: string, sessionKey: string = ''): Promise<void> {
    await this.db.query(
      `INSERT INTO reading_progress (book_id, session_key, location)
       VALUES ($1, $2, $3)
       ON CONFLICT (book_id, session_key)
       DO UPDATE SET location = $3, updated_at = CURRENT_TIMESTAMP`,
      [bookId, sessionKey, location]
    );
  }

  /**
   * Get the reading progress for a book.
   * @param bookId - The ID of the book.
   * @param sessionKey - Optional session key to get progress for a specific reading session.
   * @returns Promise resolving to the location string or null if no progress exists.
   */
  async getReadingProgress(bookId: number, sessionKey: string = ''): Promise<string | null> {
    const result = await this.db.query<{ location: string }>(
      'SELECT location FROM reading_progress WHERE book_id = $1 AND session_key = $2',
      [bookId, sessionKey]
    );
    return result.rows[0]?.location || null;
  }
}

export interface EpubBook {
  id: number;
  title: string;
  epub_data: ArrayBuffer;
}

export interface EpubMetadata {
  id: number;
  title: string;
  created_at: Date;
}

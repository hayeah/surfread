import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlobStore } from './blobStore';

import 'fake-indexeddb/auto';

describe('BlobStore', () => {
  let store: BlobStore;

  beforeEach(async () => {
    // Reset IndexedDB before each test
    // globalThis.indexedDB = new IDBFactory();
    store = await BlobStore.singleton();
  });

  afterEach(async () => {
    await store.clear();
  });

  it('should store and retrieve ArrayBuffer', async () => {
    const key = 'test-buffer';
    const data = new Uint8Array([1, 2, 3, 4]).buffer;

    await store.put(key, data);
    const retrieved = await store.get(key);

    expect(retrieved).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(retrieved!)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it('should return null for non-existent key', async () => {
    const result = await store.get('non-existent');
    expect(result).toBeNull();
  });

  it('should delete stored data', async () => {
    const key = 'test-delete';
    const data = new Uint8Array([1, 2, 3, 4]).buffer;

    await store.put(key, data);
    await store.delete(key);
    const result = await store.get(key);

    expect(result).toBeNull();
  });

  it('should clear all data', async () => {
    const keys = ['key1', 'key2', 'key3'];
    const data = new Uint8Array([1, 2, 3, 4]).buffer;

    // Store multiple items
    for (const key of keys) {
      await store.put(key, data);
    }

    await store.clear();

    // Check all keys are cleared
    for (const key of keys) {
      const result = await store.get(key);
      expect(result).toBeNull();
    }
  });
});

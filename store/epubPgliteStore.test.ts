import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { EpubPgliteStore } from './epubPgliteStore';

import 'fake-indexeddb/auto';
describe('EpubPgliteStore', () => {
  let store: EpubPgliteStore;

  const testData = new Uint8Array([1, 2, 3, 4, 5]).buffer;

  beforeAll(async () => {
    store = await EpubPgliteStore.init();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    const epubs = await store.getAllEpubs();
    for (const epub of epubs) {
      await store.deleteEpub(epub.id);
    }
  });

  it('should convert title to key correctly', () => {
    expect(store.titleToKey('Hello World!')).toBe('hello-world');
    expect(store.titleToKey('Test@123')).toBe('test-123');
    expect(store.titleToKey('  Spaces  ')).toBe('spaces');
  });

  it('should add and retrieve epub', async () => {
    const title = 'Test Book';
    const id = await store.addEpub(title, testData);
    const epub = await store.getEpub(id);

    expect(epub).not.toBeNull();
    expect(epub!.title).toBe(title);
    expect(epub!.epub_data).toEqual(testData);
  });

  it('should list all epubs', async () => {
    const titles = ['Book 1', 'Book 2'];
    await Promise.all(titles.map(title => store.addEpub(title, testData)));

    const epubs = await store.getAllEpubs();
    expect(epubs).toHaveLength(2);
    expect(epubs.map(e => e.title).sort()).toEqual(titles.sort());
  });

  it('should delete epub', async () => {
    const id = await store.addEpub('Test Book', testData);
    await store.deleteEpub(id);

    const epub = await store.getEpub(id);
    expect(epub).toBeNull();
  });

  it('should manage reading progress', async () => {
    const id = await store.addEpub('Test Book', testData);
    const location = 'chapter-1';

    // Default session
    await store.setReadingProgress(id, location);
    const savedProgress = await store.getReadingProgress(id);
    expect(savedProgress).toBe(location);

    // Custom session
    const sessionKey = 'session1';
    const sessionLocation = 'chapter-2';
    await store.setReadingProgress(id, sessionLocation, sessionKey);
    const sessionProgress = await store.getReadingProgress(id, sessionKey);
    expect(sessionProgress).toBe(sessionLocation);

    // Original session should be unchanged
    const originalProgress = await store.getReadingProgress(id);
    expect(originalProgress).toBe(location);
  });

  it('should handle non-existent epub progress', async () => {
    const progress = await store.getReadingProgress(999);
    expect(progress).toBeNull();
  });

  it('should update reading progress for same book and session', async () => {
    const id = await store.addEpub('Test Book', testData);
    const location1 = 'chapter-1';
    const location2 = 'chapter-2';

    await store.setReadingProgress(id, location1);
    await store.setReadingProgress(id, location2);

    const progress = await store.getReadingProgress(id);
    expect(progress).toBe(location2);
  });

  it('should not fail when writing large data', async () => {
    const title = 'Large Book';
    const largeData = new ArrayBuffer(30 * 1024 * 1024); // 30MB
    await expect(store.addEpub(title, largeData))
  });
});

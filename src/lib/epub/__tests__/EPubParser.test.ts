import { EPubParser } from '../EPubParser';

describe('EPubParser', () => {
  describe('load()', () => {
    it('should throw error if file does not exist', async () => {
      const parser = new EPubParser('nonexistent.epub');
      await expect(parser.load()).rejects.toThrow('File not found');
    });

    it('should throw error if file is not a valid epub', async () => {
      const parser = new EPubParser('test/fixtures/invalid.epub');
      await expect(parser.load()).rejects.toThrow('Invalid epub file');
    });
  });

  describe('metadata()', () => {
    it('should parse metadata from alice.epub', async () => {
      const parser = new EPubParser('test/fixtures/alice.epub');
      await parser.load();
      const metadata = await parser.metadata();
      
      expect(metadata).toEqual({
        title: "Alice's Adventures in Wonderland",
        author: "Lewis Carroll",
        language: "en-US",
        publisher: undefined,
        description: undefined,
        rights: "Public domain in the USA.",
        identifiers: [ "edu.nyu.itp.future-of-publishing.alice-in-wonderland" ],
        date: undefined
      });
    });
  });
});

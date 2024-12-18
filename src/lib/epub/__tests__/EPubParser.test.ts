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
});

import { EPubParser } from '../EPubParser';
import fs from 'fs';

describe('EPubParser', () => {
  describe('load()', () => {
    it('should throw error if file does not exist', async () => {
      await expect(EPubParser.load('nonexistent.epub')).rejects.toThrow('File not found');
    });

    it('should throw error if file is not a valid epub', async () => {
      await expect(EPubParser.load('test/fixtures/invalid.epub')).rejects.toThrow('Invalid epub file');
    });
  });

  describe('metadata()', () => {
    it('should parse metadata from alice.epub', async () => {
      const parser = await EPubParser.load('test/fixtures/alice.epub');
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

  describe('manifest()', () => {
    it('should parse manifest from alice.epub', async () => {
      const parser = await EPubParser.load('test/fixtures/alice.epub');
      const manifest = await parser.manifest();

      // write the manifest to a file
      fs.writeFileSync('test/fixtures/alice-manifest.json', JSON.stringify(manifest, null, 2));
      
      // Load expected manifest from fixture
      const expectedManifest = require('test/fixtures/alice-manifest.json');
      expect(manifest).toEqual(expectedManifest);
    });
  });

  describe('spine()', () => {
    it('should parse spine from alice.epub', async () => {
      const parser = await EPubParser.load('test/fixtures/alice.epub');
      const spine = await parser.spine();

      // write the spine to a file
      fs.writeFileSync('test/fixtures/alice-spine.json', JSON.stringify(spine, null, 2));

      // load expected spine from fixture
      const expectedSpine = require('test/fixtures/alice-spine.json');
      expect(spine).toEqual(expectedSpine);
    });
  });

  describe('toc()', () => {
    it('should parse table of contents from alice.epub', async () => {
      const parser = await EPubParser.load('test/fixtures/alice.epub');
      const toc = await parser.toc();

      // write toc to a file
      fs.writeFileSync('test/fixtures/alice-toc.json', JSON.stringify(toc, null, 2));

      const expectedToc = require('test/fixtures/alice-toc.json');

      expect(toc).toEqual(expectedToc);
    });
  });
});

import fs from 'fs/promises';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface EPubData {
  metadata: EPubMetadata;
  manifest: EPubManifestItem[];
  spine: EPubSpineItem[];
  toc: EPubTocItem[];
  chapters: EPubChapter[];
}

export interface EPubMetadata {
  title: string;
  author: string;
  language: string;
  publisher?: string;
  description?: string;
  rights?: string;
  identifiers: string[];
  date?: string;
}

export interface EPubManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string[];
}

export interface EPubSpineItem {
  idref: string;
  linear: boolean;
}

export interface EPubTocItem {
  label: string;
  href: string;
  subItems?: EPubTocItem[];
}

export interface EPubChapter {
  id: string;
  content: string;
}

export class EPubParser {
  private rawZipData: Uint8Array | null = null;
  private zip: JSZip | null = null;
  private xmlParser: XMLParser;

  constructor(private filePath: string) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
    });
  }

  async load(): Promise<void> {
    try {
      await fs.access(this.filePath);
      this.rawZipData = await fs.readFile(this.filePath);
      
      // Basic validation - check for epub magic numbers
      // EPub files should start with "PK\x03\x04"
      if (!this.rawZipData || this.rawZipData.length < 4 || 
          this.rawZipData[0] !== 0x50 || // P
          this.rawZipData[1] !== 0x4B || // K
          this.rawZipData[2] !== 0x03 || 
          this.rawZipData[3] !== 0x04) {
        throw new Error('Invalid epub file');
      }

      this.zip = await JSZip.loadAsync(this.rawZipData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  private async getContainerXml(): Promise<any> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const containerFile = this.zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid epub: missing container.xml');
    }

    const containerXml = await containerFile.async('text');
    return this.xmlParser.parse(containerXml);
  }

  private async getOpfPath(): Promise<string> {
    const container = await this.getContainerXml();
    const rootfile = container?.container?.rootfiles?.rootfile;
    
    if (!rootfile || !rootfile['full-path']) {
      throw new Error('Invalid epub: cannot find OPF file path');
    }

    return rootfile['full-path'];
  }

  async metadata(): Promise<EPubMetadata> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const opfPath = await this.getOpfPath();
    const opfFile = this.zip.file(opfPath);
    
    if (!opfFile) {
      throw new Error('Invalid epub: missing OPF file');
    }

    const opfContent = await opfFile.async('text');
    const opfData = this.xmlParser.parse(opfContent);
    const metadata = opfData.package?.metadata;

    if (!metadata) {
      throw new Error('Invalid epub: missing metadata in OPF');
    }

    // Helper function to handle both single values and arrays
    const getValue = (field: any): string[] => {
      if (!field) return [];
      if (Array.isArray(field)) {
        return field.map(item => typeof item === 'object' ? item['#text'] || '' : String(item));
      }
      return [typeof field === 'object' ? field['#text'] || '' : String(field)];
    };

    return {
      title: getValue(metadata['dc:title'])[0] || '',
      author: getValue(metadata['dc:creator'])[0] || '',
      language: getValue(metadata['dc:language'])[0] || '',
      publisher: getValue(metadata['dc:publisher'])[0],
      description: getValue(metadata['dc:description'])[0],
      rights: getValue(metadata['dc:rights'])[0],
      identifiers: getValue(metadata['dc:identifier']),
      date: getValue(metadata['dc:date'])[0],
    };
  }

  async manifest(): Promise<EPubManifestItem[]> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const opfPath = await this.getOpfPath();
    const opfFile = this.zip.file(opfPath);
    
    if (!opfFile) {
      throw new Error('Invalid epub: missing OPF file');
    }

    const opfContent = await opfFile.async('text');
    const opfData = this.xmlParser.parse(opfContent);
    
    
    const manifest = opfData.package?.manifest;

    if (!manifest?.item) {
      throw new Error('Invalid epub: missing manifest in OPF');
    }

    const items = Array.isArray(manifest.item) ? manifest.item : [manifest.item];
    
    return items.map((item: any) => ({
      id: item['id'],
      href: item['href'],
      mediaType: item['media-type'],
      properties: item['properties']?.split(' ') || undefined
    }));
  }

  async parse(): Promise<EPubData> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const metadata = await this.metadata();
    const manifest = await this.manifest();
    
    // TODO: Implement spine, toc, and chapters parsing
    return {
      metadata,
      manifest,
      spine: [],
      toc: [],
      chapters: [],
    };
  }

  private getFirstValue(value: any): string {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  private getArray(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  }
}

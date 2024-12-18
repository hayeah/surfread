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

  private async resolveFromOpf(href: string): Promise<string> {
    const opfPath = await this.getOpfPath();
    const opfDir = opfPath.split('/').slice(0, -1).join('/');
    return opfDir ? `${opfDir}/${href}` : href;
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

  async spine(): Promise<EPubSpineItem[]> {
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
    const spine = opfData.package?.spine;

    if (!spine?.itemref) {
      throw new Error('Invalid epub: missing spine in OPF');
    }

    const items = Array.isArray(spine.itemref) ? spine.itemref : [spine.itemref];
    
    return items.map((item: any) => ({
      idref: item.idref,
      linear: item.linear !== 'no'
    }));
  }

  private async tocEPUB3(navItem: EPubManifestItem): Promise<EPubTocItem[]> {
    const navPath = await this.resolveFromOpf(navItem.href);
    const navFile = this.zip?.file(navPath);
    
    if (!navFile) {
      throw new Error('Invalid epub: nav document not found');
    }

    const navContent = await navFile.async('text');
    const navData = this.xmlParser.parse(navContent);

    // Find the nav element with epub:type="toc"
    const nav = navData.html?.body?.section?.nav;
    // Check if this nav element has epub:type containing "toc"
    const isTocNav = nav?.['epub:type']?.includes('toc');

    if (!isTocNav || !nav?.ol?.li) {
      throw new Error('Invalid epub: nav document does not contain a valid table of contents');
    }

    const parseNavItems = (items: any[]): EPubTocItem[] => {
      return items.map((item: any) => {
        const a = item.a;
        return {
          label: a['#text'] || '',
          href: a.href || '',
          subItems: item.ol?.li ? parseNavItems(Array.isArray(item.ol.li) ? item.ol.li : [item.ol.li]) : []
        };
      });
    };

    const items = Array.isArray(nav.ol.li) ? nav.ol.li : [nav.ol.li];
    return parseNavItems(items);
  }

  private async tocNCX(ncxItem: EPubManifestItem): Promise<EPubTocItem[]> {
    const ncxPath = await this.resolveFromOpf(ncxItem.href);
    const ncxFile = this.zip?.file(ncxPath);
    
    if (!ncxFile) {
      throw new Error('Invalid epub: NCX document not found');
    }

    const ncxContent = await ncxFile.async('text');
    const ncxData = this.xmlParser.parse(ncxContent);

    const navMap = ncxData.ncx?.navMap;
    if (!navMap?.navPoint) {
      throw new Error('Invalid epub: missing navigation points');
    }

    const parseNavPoints = (items: any[]): EPubTocItem[] => {
      return items.map((item: any) => {
        const content = item.content || {};
        const href = content.src || '';
        return {
          label: item.navLabel?.text || '',
          href,
          subItems: item.navPoint ? parseNavPoints(Array.isArray(item.navPoint) ? item.navPoint : [item.navPoint]) : []
        };
      });
    };

    const navPoints = Array.isArray(navMap.navPoint) ? navMap.navPoint : [navMap.navPoint];
    return parseNavPoints(navPoints);
  }

  async toc(): Promise<EPubTocItem[]> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const manifest = await this.manifest();

    // Check for EPUB3 nav
    const navItem = manifest.find(item => item.properties?.includes('nav'));
    if (navItem) {
      return this.tocEPUB3(navItem);
    }

    // Check for NCX
    const ncxItem = manifest.find(item => item.mediaType === 'application/x-dtbncx+xml');
    if (ncxItem) {
      return this.tocNCX(ncxItem);
    }

    throw new Error('Invalid epub: no table of contents found (neither nav nor NCX)');
  }

  async parse(): Promise<EPubData> {
    if (!this.zip) {
      throw new Error('EPub file not loaded. Call load() first.');
    }

    const metadata = await this.metadata();
    const manifest = await this.manifest();
    const spine = await this.spine();
    const toc = await this.toc();
    
    // TODO: Implement chapters parsing
    return {
      metadata,
      manifest,
      spine,
      toc,
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

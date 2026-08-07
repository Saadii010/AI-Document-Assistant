import { logger } from '../utils/logger';

export interface ChunkOutput {
  chunkId: string;
  text: string;
  pageNumber: number;
  charCount: number;
  wordCount: number;
  index: number;
}

export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: { chunkSize?: number; chunkOverlap?: number; separators?: string[] } = {}) {
    this.chunkSize = options.chunkSize ?? 800;
    this.chunkOverlap = options.chunkOverlap ?? 150;
    this.separators = options.separators ?? ['\n\n', '\n', ' ', ''];
  }

  async createDocuments(texts: string[]): Promise<{ pageContent: string }[]> {
    const documents: { pageContent: string }[] = [];
    for (const text of texts) {
      const chunks = this.splitText(text);
      for (const chunk of chunks) {
        documents.push({ pageContent: chunk });
      }
    }
    return documents;
  }

  private splitText(text: string): string[] {
    const finalChunks: string[] = [];
    const splitOnSeparator = (txt: string, separatorIdx: number): string[] => {
      if (txt.length <= this.chunkSize) {
        return [txt];
      }
      if (separatorIdx >= this.separators.length) {
        // Hard slice fallback if no separators work
        const slices: string[] = [];
        let start = 0;
        while (start < txt.length) {
          slices.push(txt.substring(start, start + this.chunkSize));
          start += this.chunkSize - this.chunkOverlap;
        }
        return slices;
      }

      const separator = this.separators[separatorIdx];
      const parts = txt.split(separator);
      const results: string[] = [];
      let currentBuffer = '';

      for (const part of parts) {
        if (currentBuffer.length + part.length + (currentBuffer ? separator.length : 0) <= this.chunkSize) {
          currentBuffer += (currentBuffer ? separator : '') + part;
        } else {
          if (currentBuffer) {
            results.push(currentBuffer);
          }
          if (part.length > this.chunkSize) {
            const splitSubParts = splitOnSeparator(part, separatorIdx + 1);
            results.push(...splitSubParts);
            currentBuffer = '';
          } else {
            currentBuffer = part;
          }
        }
      }
      if (currentBuffer) {
        results.push(currentBuffer);
      }
      return results;
    };

    const initialChunks = splitOnSeparator(text, 0);
    let currentChunk = '';
    for (const chunk of initialChunks) {
      if (!currentChunk) {
        currentChunk = chunk;
      } else if (currentChunk.length + chunk.length + 1 <= this.chunkSize) {
        currentChunk += ' ' + chunk;
      } else {
        finalChunks.push(currentChunk);
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap);
        currentChunk = currentChunk.substring(overlapStart) + ' ' + chunk;
        if (currentChunk.length > this.chunkSize) {
          currentChunk = chunk;
        }
      }
    }
    if (currentChunk) {
      finalChunks.push(currentChunk);
    }
    return finalChunks;
  }
}

export class ChunkService {
  /**
   * Splits page-by-page text into overlapping semantic chunks using LangChain text splitters.
   */
  static async chunkPages(
    pages: { pageNumber: number; text: string }[],
    documentId: string,
    chunkSize = 800,
    chunkOverlap = 150
  ): Promise<ChunkOutput[]> {
    logger.info(`Running semantic chunking for document ${documentId}`);
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''],
    });

    const allChunks: ChunkOutput[] = [];
    let absoluteIndex = 0;

    for (const page of pages) {
      if (!page.text || page.text.trim() === '') {
        continue;
      }

      // Use LangChain Text Splitter to chunk this page's content
      const splitDocs = await splitter.createDocuments([page.text]);

      for (const doc of splitDocs) {
        const text = doc.pageContent.trim();
        if (text === '') continue;

        const charCount = text.length;
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        // Chunk ID format: docId_pageNum_chunkIdx
        const chunkId = `${documentId}_p${page.pageNumber}_c${absoluteIndex}`;

        allChunks.push({
          chunkId,
          text,
          pageNumber: page.pageNumber,
          charCount,
          wordCount,
          index: absoluteIndex,
        });

        absoluteIndex++;
      }
    }

    logger.info(`Generated ${allChunks.length} chunks for document ${documentId}`);
    return allChunks;
  }
}
export default ChunkService;

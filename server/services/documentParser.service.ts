import fs from 'fs';
import * as pdfImport from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger';

const pdf = (pdfImport as any).default || pdfImport;

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParserResult {
  text: string;
  pages: ParsedPage[];
  totalPages: number;
}

export class DocumentParserService {
  /**
   * Parse PDF, DOCX or TXT from a file path
   */
  static async parseFile(filePath: string, fileType: string): Promise<ParserResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const type = fileType.toLowerCase();

    if (type === 'pdf') {
      return this.parsePDF(buffer);
    } else if (type === 'docx') {
      return this.parseDOCX(buffer);
    } else if (type === 'txt') {
      return this.parseTXT(buffer);
    } else {
      throw new Error(`Unsupported file type for extraction: ${fileType}`);
    }
  }

  /**
   * Extract text from PDF page by page
   */
  private static async parsePDF(buffer: Buffer): Promise<ParserResult> {
    logger.info('Parsing PDF with page-aware hooks');

    const pages: ParsedPage[] = [];

    // Custom render option to tag each page during pdf-parse extraction
    const options = {
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let text = '';
          for (const item of textContent.items) {
            text += item.str + ' ';
          }
          // Insert unique separator including the 1-indexed page number
          const pageNum = pageData.pageIndex + 1;
          return `\n---PAGE_START_${pageNum}---\n${text}\n---PAGE_END_${pageNum}---\n`;
        });
      },
    };

    const parsed = await pdf(buffer, options);
    const rawText = parsed.text;

    // Regex to capture content between PAGE_START and PAGE_END tokens
    const pageRegex = /---PAGE_START_(\d+)---([\s\S]*?)---PAGE_END_\1---/g;
    let match;
    let totalPagesCount = 0;

    while ((match = pageRegex.exec(rawText)) !== null) {
      const pageNumber = parseInt(match[1], 10);
      const text = match[2].trim();
      pages.push({ pageNumber, text });
      totalPagesCount = Math.max(totalPagesCount, pageNumber);
    }

    // Fallback if regex matching failed for some reason
    if (pages.length === 0) {
      pages.push({ pageNumber: 1, text: rawText.trim() });
      totalPagesCount = parsed.numpages || 1;
    }

    // Clean total text of markers
    const cleanText = rawText
      .replace(/---PAGE_START_\d+---/g, '')
      .replace(/---PAGE_END_\d+---/g, '')
      .trim();

    return {
      text: cleanText,
      pages,
      totalPages: totalPagesCount || parsed.numpages || 1,
    };
  }

  /**
   * Extract text from DOCX
   */
  private static async parseDOCX(buffer: Buffer): Promise<ParserResult> {
    logger.info('Parsing DOCX document');
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    return {
      text,
      pages: [{ pageNumber: 1, text }],
      totalPages: 1,
    };
  }

  /**
   * Extract plain text
   */
  private static async parseTXT(buffer: Buffer): Promise<ParserResult> {
    logger.info('Parsing TXT document');
    const text = buffer.toString('utf8').trim();
    return {
      text,
      pages: [{ pageNumber: 1, text }],
      totalPages: 1,
    };
  }

  /**
   * Clean text content per requirements
   */
  static cleanText(text: string): string {
    if (!text) return '';
    
    // Normalize line endings
    let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove non-printable / control characters (keep whitespace, tab, and newlines)
    cleaned = cleaned.replace(/[^\x20-\x7E\t\n]/g, '');

    const lines = cleaned.split('\n');
    const cleanedLines: string[] = [];
    let prevLine = '';

    for (const line of lines) {
      // Normalize internal whitespace to single spaces
      const trimmed = line.replace(/\s+/g, ' ').trim();
      
      if (trimmed === '') {
        // Only push one blank line as paragraph separator, suppress duplicate blank lines
        if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
          cleanedLines.push('');
        }
        prevLine = '';
        continue;
      }

      // Suppress exact duplicate adjacent lines to fix broken copy/paste formatting loops
      if (trimmed === prevLine) {
        continue;
      }

      cleanedLines.push(trimmed);
      prevLine = trimmed;
    }

    return cleanedLines.join('\n').trim();
  }
}

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { EmbeddingModel } from '../models/embedding.model';
import { DocumentChunkModel } from '../models/chunk.model';

export interface VectorRecord {
  vector: number[];
  chunkId: string;
  documentId: string;
  ownerId: string;
  pageNumber: number;
  text: string;
  metadata: any;
}

const VECTOR_STORE_FILE = path.join('server', 'uploads', 'vector_store.json');

export class VectorStoreService {
  private static inMemoryIndex: VectorRecord[] = [];
  private static isInitialized = false;

  /**
   * Retrieves current vector store statistics for monitoring and health reporting
   */
  static getStats() {
    return {
      isInitialized: this.isInitialized,
      indexSize: this.inMemoryIndex.length,
      fileSize: fs.existsSync(VECTOR_STORE_FILE) ? fs.statSync(VECTOR_STORE_FILE).size : 0,
      filePath: VECTOR_STORE_FILE,
    };
  }

  /**
   * Initializes the vector store by loading persisted vectors from disk.
   * If disk file is missing, it falls back to rebuilding the index from MongoDB.
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure uploads directory exists
      const dir = path.dirname(VECTOR_STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(VECTOR_STORE_FILE)) {
        logger.info('Loading vector store from disk archive...');
        const raw = fs.readFileSync(VECTOR_STORE_FILE, 'utf8');
        this.inMemoryIndex = JSON.parse(raw);
        logger.info(`Vector store initialized. Loaded ${this.inMemoryIndex.length} vectors.`);
      } else {
        logger.info('Vector store file not found on disk. Rebuilding from MongoDB...');
        await this.rebuildFromDatabase();
      }
      this.isInitialized = true;
    } catch (err: any) {
      logger.error(`Failed to initialize VectorStore: ${err.message || err}`);
      this.inMemoryIndex = []; // keep empty array as safe fallback
      this.isInitialized = true;
    }
  }

  /**
   * Rebuild the in-memory vector index using records stored in MongoDB
   */
  static async rebuildFromDatabase(): Promise<void> {
    try {
      const dbEmbeddings = await (EmbeddingModel as any).find().lean();
      const records: VectorRecord[] = [];

      if (dbEmbeddings.length > 0) {
        // Fetch corresponding chunk texts in bulk to avoid N+1 query performance bottleneck
        const chunkIds = dbEmbeddings.map((emb: any) => emb.chunk);
        const chunks = await (DocumentChunkModel as any).find({ _id: { $in: chunkIds } }).lean();

        // Map chunks by ID for O(1) constant-time lookup
        const chunkMap = new Map<string, any>();
        for (const chunk of chunks) {
          chunkMap.set(chunk._id.toString(), chunk);
        }

        for (const emb of dbEmbeddings) {
          const chunk = chunkMap.get(emb.chunk.toString());
          if (chunk) {
            records.push({
              vector: emb.vector,
              chunkId: chunk.chunkId,
              documentId: emb.document.toString(),
              ownerId: emb.owner.toString(),
              pageNumber: chunk.pageNumber,
              text: chunk.text,
              metadata: {
                charCount: chunk.charCount,
                wordCount: chunk.wordCount,
                index: chunk.index,
              },
            });
          }
        }
      }

      this.inMemoryIndex = records;
      this.saveToDisk();
      logger.info(`Vector store index successfully rebuilt with ${records.length} records from MongoDB.`);
    } catch (err: any) {
      logger.error(`Error rebuilding vector store from Database: ${err.message || err}`);
    }
  }

  /**
   * Persists the in-memory index back to local disk
   */
  private static saveToDisk(): void {
    try {
      const dir = path.dirname(VECTOR_STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Compact JSON writing without indentation formatting for maximized disk throughput
      fs.writeFileSync(VECTOR_STORE_FILE, JSON.stringify(this.inMemoryIndex), 'utf8');
    } catch (err: any) {
      logger.error(`Failed to write vector store to disk: ${err.message || err}`);
    }
  }

  /**
   * Adds vectors to the local store and persists to disk
   */
  static async addVectors(records: VectorRecord[]): Promise<void> {
    await this.initialize();
    
    // Add to in-memory index
    this.inMemoryIndex.push(...records);
    this.saveToDisk();
    
    logger.info(`Added ${records.length} vectors to the VectorStore index.`);
  }

  /**
   * Deletes all vectors associated with a specific document ID (used during deletion or reprocessing)
   */
  static async deleteVectorsByDocument(documentId: string): Promise<void> {
    await this.initialize();
    
    const initialCount = this.inMemoryIndex.length;
    this.inMemoryIndex = this.inMemoryIndex.filter(
      (rec) => rec.documentId !== documentId
    );
    this.saveToDisk();

    logger.info(`Deleted vectors for document ${documentId}. Removed ${initialCount - this.inMemoryIndex.length} elements.`);
  }

  /**
   * Performs vector similarity search using Cosine Similarity
   */
  static async similaritySearch(
    queryVector: number[],
    ownerId: string,
    topK = 5,
    documentIdFilter?: string | string[]
  ): Promise<(VectorRecord & { score: number })[]> {
    await this.initialize();

    // Filter index by Owner (crucial for security) and optionally documentId
    let filteredRecords = this.inMemoryIndex.filter(
      (rec) => rec.ownerId === ownerId
    );

    if (documentIdFilter) {
      if (Array.isArray(documentIdFilter)) {
        filteredRecords = filteredRecords.filter(
          (rec) => documentIdFilter.includes(rec.documentId)
        );
      } else {
        filteredRecords = filteredRecords.filter(
          (rec) => rec.documentId === documentIdFilter
        );
      }
    }

    if (filteredRecords.length === 0) {
      return [];
    }

    // Calculate similarity score for each record
    const scored = filteredRecords.map((rec) => {
      const score = this.calculateCosineSimilarity(queryVector, rec.vector);
      return {
        ...rec,
        score,
      };
    });

    // Sort by descending score
    scored.sort((a, b) => b.score - a.score);

    // Return Top K results
    return scored.slice(0, topK);
  }

  /**
   * Helper mathematical method to compute cosine similarity between two vectors
   */
  private static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0; // standard fallback
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
export default VectorStoreService;

import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';

export class EmbeddingService {
  private static ai: GoogleGenAI | null = null;
  // High-performance in-memory cache to skip redundant embedding API calls
  private static embeddingCache = new Map<string, number[]>();

  /**
   * Initialize and return the GoogleGenAI instance.
   * Lazily initialized to avoid crashing on startup if API key is not yet set.
   */
  public static getAIInstance(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.warn('GEMINI_API_KEY is not defined in environment variables. Embedding generation will fail.');
      }
      this.ai = new GoogleGenAI({
        apiKey: apiKey || 'placeholder-key-to-prevent-immediate-crash',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  /**
   * Generates a single embedding vector for a given text.
   * Includes automatic retry logic with exponential backoff (max 3 retries).
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const aiInstance = this.getAIInstance();
    const maxRetries = 3;
    let delay = 1000; // start with 1s delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await aiInstance.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: text,
        });

        // Cast to any to bypass strict SDK response schema differences
        const res = response as any;
        let values: number[] | null = null;

        if (res && res.embedding && res.embedding.values) {
          values = res.embedding.values;
        } else if (res.embeddings && res.embeddings[0] && res.embeddings[0].values) {
          values = res.embeddings[0].values;
        } else if (res.values) {
          values = res.values;
        }

        if (values) {
          // Cache values for future identical lookups
          this.embeddingCache.set(cacheKey, values);
          // Limit cache size to prevent memory leaks in long-running processes (max 5000 items)
          if (this.embeddingCache.size > 5000) {
            const firstKey = this.embeddingCache.keys().next().value;
            if (firstKey !== undefined) {
              this.embeddingCache.delete(firstKey);
            }
          }
          return values;
        }

        throw new Error('Could not find embedding values in the Gemini API response.');
      } catch (err: any) {
        logger.error(`Embedding generation attempt ${attempt} failed: ${err.message || err}`);
        if (attempt === maxRetries) {
          throw err; // bubble up on last attempt
        }
        // Wait with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error('Embedding generation failed after all retry attempts.');
  }

  /**
   * Batch generation of embeddings with parallel execution pools for high performance.
   */
  static async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    logger.info(`Generating embeddings batch for ${texts.length} chunks`);
    const vectors: number[][] = new Array(texts.length);
    
    // Concurrency limit to optimize network pipeline without hitting API rate limits
    const CONCURRENCY_LIMIT = 5;
    const pool: Promise<void>[] = [];
    
    let currentIndex = 0;

    const worker = async () => {
      while (currentIndex < texts.length) {
        const index = currentIndex++;
        try {
          vectors[index] = await this.generateEmbedding(texts[index]);
        } catch (err: any) {
          logger.error(`Failed to generate embedding for index ${index}: ${err.message || err}`);
          // Set standard zero-vector fallback to keep the batch pipeline robust
          vectors[index] = new Array(768).fill(0);
        }
      }
    };

    // Spin up parallel workers
    for (let i = 0; i < Math.min(CONCURRENCY_LIMIT, texts.length); i++) {
      pool.push(worker());
    }

    await Promise.all(pool);
    return vectors;
  }
}
export default EmbeddingService;

import path from 'path';
import { DocumentModel } from '../models/document.model';
import { DocumentChunkModel } from '../models/chunk.model';
import { EmbeddingModel } from '../models/embedding.model';
import { ProcessingJobModel } from '../models/job.model';
import { DocumentParserService } from './documentParser.service';
import { ChunkService } from './chunk.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService, VectorRecord } from './vectorStore.service';
import { ProcessingLogger } from './processingLogger.service';
import { MetadataService } from './metadata.service';
import { logger } from '../utils/logger';

interface QueueItem {
  documentId: string;
  ownerId: string;
  isReprocessing?: boolean;
}

export class ProcessingQueueService {
  private static queue: QueueItem[] = [];
  private static isProcessing = false;

  /**
   * Enqueues a document for background RAG processing.
   * Runs asynchronously and returns immediately to avoid blocking file uploads.
   */
  static async enqueue(documentId: string, ownerId: string, isReprocessing = false): Promise<void> {
    logger.info(`Enqueuing document ${documentId} for RAG processing (Reprocess: ${isReprocessing})`);
    
    // Create or update Processing Job in MongoDB
    await (ProcessingJobModel as any).findOneAndUpdate(
      { document: documentId },
      {
        owner: ownerId,
        status: 'uploaded',
        $setOnInsert: { attempts: 0, errors: [] },
      },
      { upsert: true, new: true }
    );

    await (DocumentModel as any).findByIdAndUpdate(documentId, { status: 'processing' });

    // Add to in-memory processing list
    this.queue.push({ documentId, ownerId, isReprocessing });

    // Fire off queue worker (non-blocking)
    this.triggerWorker();
  }

  /**
   * Simple non-blocking queue trigger
   */
  private static triggerWorker(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    // Start async processing cycle
    this.runWorker().catch((err) => {
      logger.error(`Processing Queue worker crashed: ${err.message}`);
      this.isProcessing = false;
    });
  }

  /**
   * Queue worker execution loop
   */
  private static async runWorker(): Promise<void> {
    while (this.queue.length > 0) {
      const nextItem = this.queue.shift();
      if (!nextItem) continue;

      const { documentId, ownerId, isReprocessing } = nextItem;
      logger.info(`Worker picked up document ${documentId}`);

      try {
        await this.executePipeline(documentId, ownerId, isReprocessing);
      } catch (err: any) {
        logger.error(`Error executing pipeline for document ${documentId}: ${err.message}`);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Complete 10-Step RAG Processing Pipeline
   */
  private static async executePipeline(documentId: string, ownerId: string, isReprocessing = false): Promise<void> {
    const job = await (ProcessingJobModel as any).findOne({ document: documentId });
    if (!job) {
      logger.error(`No processing job found for document ${documentId}`);
      return;
    }

    job.status = 'processing';
    job.attempts += 1;
    await job.save();

    await (DocumentModel as any).findByIdAndUpdate(documentId, { status: 'processing' });

    // Initialize pipeline logs
    const attemptNum = job.attempts;
    await ProcessingLogger.startLog(documentId, ownerId);
    if (attemptNum > 1) {
      await ProcessingLogger.appendStep(documentId, `Processing retry attempt ${attemptNum} of 3`);
    }

    try {
      // Fetch Document record to find target file
      const doc = await (DocumentModel as any).findById(documentId);
      if (!doc) {
        throw new Error('Document record not found in database.');
      }

      const filePath = doc.filePath;
      const fileType = doc.fileType;

      // STEP 1 — Validate File
      await ProcessingLogger.appendStep(documentId, `[Step 1/10] Validating file details for "${doc.originalFilename}"`);
      if (!filePath) {
        throw new Error('Document does not have a valid relative file path.');
      }
      const absolutePath = path.resolve(filePath);
      logger.info(`RAG target resolved path: ${absolutePath}`);

      // Cleanup old indexing vectors/chunks if reprocessing
      if (isReprocessing) {
        await ProcessingLogger.appendStep(documentId, `[Cleanup] Wiping old indexing records, vector store chunks, and embeddings...`);
        await DocumentChunkModel.deleteMany({ document: documentId });
        await EmbeddingModel.deleteMany({ document: documentId });
        await VectorStoreService.deleteVectorsByDocument(documentId);
      }

      // STEP 2 — Extract Text (Page-by-page)
      await ProcessingLogger.appendStep(documentId, `[Step 2/10] Extracting raw text from ${fileType.toUpperCase()}`);
      const parsedResult = await DocumentParserService.parseFile(filePath, fileType);
      
      // STEP 3 — Clean Text
      await ProcessingLogger.appendStep(documentId, `[Step 3/10] Normalizing whitespaces, cleaning formats and invisible characters`);
      const cleanedOverallText = DocumentParserService.cleanText(parsedResult.text);

      // Clean individual pages
      const cleanedPages = parsedResult.pages.map((p) => ({
        pageNumber: p.pageNumber,
        text: DocumentParserService.cleanText(p.text),
      }));

      // STEP 4 — Page Detection
      await ProcessingLogger.appendStep(documentId, `[Step 4/10] Detecting layout pages. Found ${parsedResult.totalPages} pages.`);

      // STEP 5 — Split into overlapping Chunks (500-1000 chars, 100-200 overlap)
      await ProcessingLogger.appendStep(documentId, `[Step 5/10] Initiating LangChain recursive semantic splitter...`);
      const chunksData = await ChunkService.chunkPages(cleanedPages, documentId);
      if (chunksData.length === 0) {
        throw new Error('Semantic splitter failed to generate any text chunks.');
      }

      // STEP 6 — Generate Embeddings (using gemini-embedding-2-preview)
      await ProcessingLogger.appendStep(documentId, `[Step 6/10] Generating vector embeddings using Gemini Model...`);
      const textsToEmbed = chunksData.map((c) => c.text);
      const embeddingVectors = await EmbeddingService.generateEmbeddingsBatch(textsToEmbed);

      // STEP 7 — Store Chunks
      await ProcessingLogger.appendStep(documentId, `[Step 7/10] Storing generated chunks in MongoDB DocumentChunks collection...`);
      const chunkDocs = [];
      for (const rawChunk of chunksData) {
        const chunkDoc = await DocumentChunkModel.create({
          document: documentId,
          owner: ownerId,
          chunkId: rawChunk.chunkId,
          text: rawChunk.text,
          pageNumber: rawChunk.pageNumber,
          charCount: rawChunk.charCount,
          wordCount: rawChunk.wordCount,
          index: rawChunk.index,
        });
        chunkDocs.push(chunkDoc);
      }

      // STEP 8 — Store Embeddings (MongoDB and VectorStore persistence)
      await ProcessingLogger.appendStep(documentId, `[Step 8/10] Syncing embeddings in MongoDB and local vector file index...`);
      const vectorRecords: VectorRecord[] = [];

      for (let i = 0; i < chunkDocs.length; i++) {
        const chunkDoc = chunkDocs[i];
        const vector = embeddingVectors[i];

        await EmbeddingModel.create({
          chunk: chunkDoc._id,
          document: documentId,
          owner: ownerId,
          vector,
          status: 'completed',
        });

        vectorRecords.push({
          vector,
          chunkId: chunkDoc.chunkId,
          documentId,
          ownerId,
          pageNumber: chunkDoc.pageNumber,
          text: chunkDoc.text,
          metadata: {
            charCount: chunkDoc.charCount,
            wordCount: chunkDoc.wordCount,
            index: chunkDoc.index,
          },
        });
      }

      // Feed vector database
      await VectorStoreService.addVectors(vectorRecords);

      // STEP 9 — Save Metadata (Mongoose model updates)
      await ProcessingLogger.appendStep(documentId, `[Step 9/10] Analyzing documents metadata, detecting language, updating status...`);
      const language = MetadataService.detectLanguage(cleanedOverallText);
      const duration = Date.now() - job.createdAt.getTime();

      await MetadataService.updateDocumentMetadata(documentId, {
        totalPages: parsedResult.totalPages,
        extractedText: cleanedOverallText,
        chunkCount: chunkDocs.length,
        embeddingCount: chunkDocs.length,
        language,
        processingTime: duration,
        status: 'processed',
      });

      // STEP 10 — Mark Document as Ready
      await ProcessingLogger.appendStep(documentId, `[Step 10/10] Tagging document as "processed". Pipeline successfully completed.`);
      
      job.status = 'completed';
      await job.save();

      // Finalize Logger metrics
      await ProcessingLogger.finalizeLog(documentId, true, {
        chunkCount: chunkDocs.length,
        embeddingCount: chunkDocs.length,
        retries: attemptNum - 1,
      });

    } catch (pipelineError: any) {
      const errorMessage = pipelineError.message || pipelineError;
      await ProcessingLogger.recordError(documentId, errorMessage);

      // Handle Failures & Retries (Auto retry max 3 times)
      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying';
        job.errors.push(`Attempt ${attemptNum} failed: ${errorMessage}`);
        await job.save();
        
        await ProcessingLogger.finalizeLog(documentId, false, {
          chunkCount: 0,
          embeddingCount: 0,
        });

        logger.warn(`Auto-retrying RAG pipeline for document ${documentId} (Next attempt: ${job.attempts + 1})`);
        // Re-enqueue for automatic retry
        this.queue.push({ documentId, ownerId, isReprocessing: true });
        this.triggerWorker();
      } else {
        // Mark permanently failed
        job.status = 'failed';
        job.errors.push(`Attempt ${attemptNum} failed: ${errorMessage}`);
        await job.save();

        await (DocumentModel as any).findByIdAndUpdate(documentId, { status: 'failed' });

        await ProcessingLogger.finalizeLog(documentId, false, {
          chunkCount: 0,
          embeddingCount: 0,
        });

        logger.error(`Document ${documentId} has failed processing after ${job.attempts} attempts.`);
      }
    }
  }

  /**
   * Clear and reprocess document index entirely.
   */
  static async reprocessDocument(documentId: string, ownerId: string): Promise<void> {
    logger.info(`Triggered manual reprocessing of document ${documentId}`);
    
    // Reset Job parameters
    await (ProcessingJobModel as any).findOneAndUpdate(
      { document: documentId },
      {
        owner: ownerId,
        status: 'uploaded',
        attempts: 0,
        errors: [],
      },
      { upsert: true }
    );

    // Enqueue document as reprocessing task
    await this.enqueue(documentId, ownerId, true);
  }
}
export default ProcessingQueueService;

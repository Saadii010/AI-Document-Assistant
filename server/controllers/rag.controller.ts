import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/document.model';
import { ProcessingJobModel } from '../models/job.model';
import { ProcessingLogModel } from '../models/log.model';
import { DocumentChunkModel } from '../models/chunk.model';
import { EmbeddingModel } from '../models/embedding.model';
import { ProcessingQueueService } from '../services/processingQueue.service';
import { VectorStoreService } from '../services/vectorStore.service';
import { logger } from '../utils/logger';

export class RagController {
  /**
   * Ownership Validation Helper
   */
  private static async validateOwner(documentId: string, userId: string): Promise<boolean> {
    try {
      const doc = await (DocumentModel as any).findById(documentId);
      if (!doc) return false;
      return doc.owner.toString() === userId;
    } catch {
      return false;
    }
  }

  /**
   * POST /api/rag/process/:documentId
   * Enqueue a document for RAG processing
   */
  static async processDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied. You do not own this document.' });
        return;
      }

      await ProcessingQueueService.enqueue(documentId, userId);

      res.status(200).json({
        success: true,
        message: 'Document enqueued for RAG processing.',
      });
    } catch (err: any) {
      logger.error(`Error in processDocument API: ${err.message}`);
      res.status(500).json({ success: false, message: err.message || 'Failed to start processing.' });
    }
  }

  /**
   * POST /api/rag/reprocess/:documentId
   * Force manual reprocessing of a document (wipes old and starts fresh)
   */
  static async reprocessDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied. You do not own this document.' });
        return;
      }

      await ProcessingQueueService.reprocessDocument(documentId, userId);

      res.status(200).json({
        success: true,
        message: 'Document reprocessing initiated.',
      });
    } catch (err: any) {
      logger.error(`Error in reprocessDocument API: ${err.message}`);
      res.status(500).json({ success: false, message: err.message || 'Failed to start reprocessing.' });
    }
  }

  /**
   * GET /api/rag/status/:documentId
   * Fetch processing job status details
   */
  static async getStatus(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const job = await (ProcessingJobModel as any).findOne({ document: documentId });
      const doc = await (DocumentModel as any).findById(documentId);

      if (!job) {
        // Return default state if document was uploaded pre-RAG
        res.status(200).json({
          success: true,
          data: {
            documentId,
            status: doc?.status || 'uploaded',
            attempts: 0,
            maxAttempts: 3,
            errors: [],
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          documentId: job.document,
          status: job.status,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
          errors: job.errors,
          updatedAt: job.updatedAt,
        },
      });
    } catch (err: any) {
      logger.error(`Error in getStatus API: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve status.' });
    }
  }

  /**
   * GET /api/rag/logs/:documentId
   * Fetch detailed step logs for RAG pipeline
   */
  static async getLogs(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const log = await (ProcessingLogModel as any).findOne({ document: documentId });

      if (!log) {
        res.status(200).json({
          success: true,
          data: {
            logs: ['No processing logs available for this document.'],
            duration: 0,
            chunkCount: 0,
            embeddingCount: 0,
            retries: 0,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          logs: log.logs,
          startTime: log.startTime,
          endTime: log.endTime,
          duration: log.duration,
          chunkCount: log.chunkCount,
          embeddingCount: log.embeddingCount,
          retries: log.retries,
          errors: log.errors,
        },
      });
    } catch (err: any) {
      logger.error(`Error in getLogs API: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve logs.' });
    }
  }

  /**
   * GET /api/rag/chunks/:documentId
   * Get all extracted text chunks for the document
   */
  static async getChunks(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const chunks = await (DocumentChunkModel as any).find({ document: documentId })
        .sort({ index: 1 })
        .lean();

      res.status(200).json({
        success: true,
        data: chunks.map((c) => ({
          chunkId: c.chunkId,
          text: c.text,
          pageNumber: c.pageNumber,
          charCount: c.charCount,
          wordCount: c.wordCount,
          index: c.index,
        })),
      });
    } catch (err: any) {
      logger.error(`Error in getChunks API: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve chunks.' });
    }
  }

  /**
   * DELETE /api/rag/embeddings/:documentId
   * Wipes embeddings and chunks, returning document status to 'uploaded'
   */
  static async deleteEmbeddings(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const isOwner = await RagController.validateOwner(documentId, userId);
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      // 1. Delete chunk records
      await DocumentChunkModel.deleteMany({ document: documentId });

      // 2. Delete embedding records
      await EmbeddingModel.deleteMany({ document: documentId });

      // 3. Delete from flat Vector Index
      await VectorStoreService.deleteVectorsByDocument(documentId);

      // 4. Reset document status
      await (DocumentModel as any).findByIdAndUpdate(documentId, {
        status: 'uploaded',
        $set: {
          chunkCount: 0,
          embeddingCount: 0,
          extractedText: '',
          totalPages: 1,
        }
      });

      // 5. Update processing job status
      await (ProcessingJobModel as any).findOneAndUpdate(
        { document: documentId },
        {
          status: 'uploaded',
          attempts: 0,
          errors: [],
        }
      );

      res.status(200).json({
        success: true,
        message: 'Document chunks and embeddings deleted successfully.',
      });
    } catch (err: any) {
      logger.error(`Error in deleteEmbeddings API: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to delete embeddings.' });
    }
  }
}

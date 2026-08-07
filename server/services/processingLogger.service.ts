import { ProcessingLogModel } from '../models/log.model';
import { logger } from '../utils/logger';

export class ProcessingLogger {
  /**
   * Starts a new processing log entry for a document
   */
  static async startLog(documentId: string, ownerId: string): Promise<void> {
    try {
      // Clear any previous logs for this document
      await (ProcessingLogModel as any).deleteMany({ document: documentId });

      await (ProcessingLogModel as any).create({
        document: documentId,
        owner: ownerId,
        startTime: new Date(),
        logs: [`[${new Date().toISOString()}] Initiated document processing pipeline`],
      });
      logger.info(`Started RAG processing log for document ${documentId}`);
    } catch (err: any) {
      logger.error(`Failed to start processing log: ${err.message}`);
    }
  }

  /**
   * Appends a log message/step description to the active document log
   */
  static async appendStep(documentId: string, message: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const formattedLog = `[${timestamp}] ${message}`;

      await (ProcessingLogModel as any).findOneAndUpdate(
        { document: documentId },
        {
          $push: { logs: formattedLog },
        }
      );
      logger.info(`Document ${documentId}: ${message}`);
    } catch (err: any) {
      logger.error(`Failed to append log step: ${err.message}`);
    }
  }

  /**
   * Records an error during processing
   */
  static async recordError(documentId: string, errorMessage: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const formattedLog = `[${timestamp}] ERROR: ${errorMessage}`;

      await (ProcessingLogModel as any).findOneAndUpdate(
        { document: documentId },
        {
          $push: { logs: formattedLog, errors: errorMessage },
        }
      );
      logger.error(`Document ${documentId} pipeline error: ${errorMessage}`);
    } catch (err: any) {
      logger.error(`Failed to record error log: ${err.message}`);
    }
  }

  /**
   * Finalizes the log entry, computing total duration, chunks, and embeddings
   */
  static async finalizeLog(
    documentId: string,
    success: boolean,
    metrics: { chunkCount: number; embeddingCount: number; retries?: number }
  ): Promise<void> {
    try {
      const log = await (ProcessingLogModel as any).findOne({ document: documentId });
      if (!log) return;

      const endTime = new Date();
      const duration = endTime.getTime() - log.startTime.getTime();
      const timestamp = endTime.toISOString();
      
      const completionMessage = success
        ? `[${timestamp}] Document pipeline COMPLETED successfully. Chunks: ${metrics.chunkCount}, Embeddings: ${metrics.embeddingCount}`
        : `[${timestamp}] Document pipeline FAILED. Please review logs and retry.`;

      await (ProcessingLogModel as any).findOneAndUpdate(
        { document: documentId },
        {
          endTime,
          duration,
          chunkCount: metrics.chunkCount,
          embeddingCount: metrics.embeddingCount,
          retries: metrics.retries || log.retries,
          $push: { logs: completionMessage },
        }
      );
      logger.info(`Finalized RAG processing log for document ${documentId} (${duration}ms)`);
    } catch (err: any) {
      logger.error(`Failed to finalize log: ${err.message}`);
    }
  }
}
export default ProcessingLogger;

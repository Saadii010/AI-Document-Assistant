import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { logger } from '../utils/logger';

export class DocumentController {
  // Upload a new document
  static async upload(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized. Please sign in to upload files.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please select a valid PDF, DOCX, or TXT file to upload.' });
        return;
      }

      const meta = {
        category: req.body.category,
        description: req.body.description,
        tags: req.body.tags,
      };

      const document = await DocumentService.uploadDocument(userId, req.file, meta);
      
      res.status(201).json({
        success: true,
        message: 'Document uploaded and processed successfully.',
        data: document,
      });
    } catch (error: any) {
      logger.error('Error in upload controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to upload document.' });
    }
  }

  // Get list of documents (with query filters, sort, search, pagination)
  static async getDocuments(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const result = await DocumentService.getDocuments(userId, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully.',
        ...result,
      });
    } catch (error: any) {
      logger.error('Error in getDocuments controller: %O', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
    }
  }

  // Get a single document details (updating lastOpened)
  static async getDocumentById(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const document = await DocumentService.getDocumentById(userId, id);
      
      res.status(200).json({
        success: true,
        message: 'Document retrieved successfully.',
        data: document,
      });
    } catch (error: any) {
      logger.error('Error in getDocumentById controller: %O', error);
      res.status(404).json({ success: false, message: error.message || 'Document not found.' });
    }
  }

  // Update a document's details
  static async updateDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const updates = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        category: req.body.category,
      };

      const updated = await DocumentService.updateDocument(userId, id, updates);

      res.status(200).json({
        success: true,
        message: 'Document updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error in updateDocument controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to update document.' });
    }
  }

  // Delete a document
  static async deleteDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      await DocumentService.deleteDocument(userId, id);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully.',
      });
    } catch (error: any) {
      logger.error('Error in deleteDocument controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to delete document.' });
    }
  }

  // Toggle favorite
  static async toggleFavorite(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const document = await DocumentService.toggleFavorite(userId, id);

      res.status(200).json({
        success: true,
        message: document.isFavorite ? 'Added to favorites.' : 'Removed from favorites.',
        data: document,
      });
    } catch (error: any) {
      logger.error('Error in toggleFavorite controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to toggle favorite status.' });
    }
  }

  // Archive a document
  static async archiveDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const document = await DocumentService.setArchiveStatus(userId, id, true);

      res.status(200).json({
        success: true,
        message: 'Document moved to Archive.',
        data: document,
      });
    } catch (error: any) {
      logger.error('Error in archiveDocument controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to archive document.' });
    }
  }

  // Restore an archived document
  static async restoreDocument(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const document = await DocumentService.setArchiveStatus(userId, id, false);

      res.status(200).json({
        success: true,
        message: 'Document successfully restored to active workspace.',
        data: document,
      });
    } catch (error: any) {
      logger.error('Error in restoreDocument controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to restore document.' });
    }
  }

  // Fetch recent documents
  static async getRecent(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const limit = parseInt(String(req.query.limit || 5), 10);
      const recent = await DocumentService.getRecentDocuments(userId, limit);

      res.status(200).json({
        success: true,
        message: 'Recent documents retrieved.',
        data: recent,
      });
    } catch (error: any) {
      logger.error('Error in getRecent controller: %O', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve recent documents.' });
    }
  }

  // Fetch storage stats
  static async getStorage(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const stats = await DocumentService.getStorageStats(userId);

      res.status(200).json({
        success: true,
        message: 'Storage analytics calculated.',
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error in getStorage controller: %O', error);
      res.status(500).json({ success: false, message: 'Failed to calculate storage stats.' });
    }
  }

  // Get raw text preview content
  static async getPreview(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const content = DocumentService.getDocumentContent(userId, id);

      res.status(200).json({
        success: true,
        message: 'Content loaded.',
        data: { content },
      });
    } catch (error: any) {
      logger.error('Error in preview controller: %O', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to generate preview content.' });
    }
  }
}

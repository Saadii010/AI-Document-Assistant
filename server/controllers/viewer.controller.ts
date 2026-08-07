import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getIsMongoConnected } from '../config/db';
import { logger } from '../utils/logger';

// Import Mongoose Models
import { BookmarkModel as BookmarkModelOriginal } from '../models/bookmark.model';
import { AnnotationModel as AnnotationModelOriginal } from '../models/annotation.model';
import { ReadingHistoryModel as ReadingHistoryModelOriginal } from '../models/readingHistory.model';
import { ViewerSettingsModel as ViewerSettingsModelOriginal } from '../models/viewerSettings.model';
import { DocumentChunkModel as DocumentChunkModelOriginal } from '../models/chunk.model';
import { DocumentModel as DocumentModelOriginal } from '../models/document.model';

const BookmarkModel = BookmarkModelOriginal as any;
const AnnotationModel = AnnotationModelOriginal as any;
const ReadingHistoryModel = ReadingHistoryModelOriginal as any;
const ViewerSettingsModel = ViewerSettingsModelOriginal as any;
const DocumentChunkModel = DocumentChunkModelOriginal as any;
const DocumentModel = DocumentModelOriginal as any;

const LOCAL_DB_PATH = path.join('server', 'uploads', 'local_db.json');

// Ensure parent directory exists for local database
function ensureLocalDbExists() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(
      LOCAL_DB_PATH,
      JSON.stringify(
        {
          users: [],
          documents: [],
          bookmarks: [],
          annotations: [],
          readingHistories: [],
          viewerSettings: [],
        },
        null,
        2
      )
    );
  } else {
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.bookmarks) { parsed.bookmarks = []; updated = true; }
      if (!parsed.annotations) { parsed.annotations = []; updated = true; }
      if (!parsed.readingHistories) { parsed.readingHistories = []; updated = true; }
      if (!parsed.viewerSettings) { parsed.viewerSettings = []; updated = true; }
      if (updated) {
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    } catch (e) {
      fs.writeFileSync(
        LOCAL_DB_PATH,
        JSON.stringify(
          {
            users: [],
            documents: [],
            bookmarks: [],
            annotations: [],
            readingHistories: [],
            viewerSettings: [],
          },
          null,
          2
        )
      );
    }
  }
}

// Read local database
function readLocalDb(): any {
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    logger.error('Error reading local database in viewer controller: %O', err);
    return { users: [], documents: [], bookmarks: [], annotations: [], readingHistories: [], viewerSettings: [] };
  }
}

// Write local database
function writeLocalDb(data: any) {
  ensureLocalDbExists();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Error writing local database in viewer controller: %O', err);
  }
}

export class ViewerController {
  private static useMongo(): boolean {
    return getIsMongoConnected();
  }

  /**
   * GET /api/viewer/document/:id
   * Get document metadata, bookmarks, annotations, and register reading history entry
   */
  static async getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let document: any = null;
      let bookmarks: any[] = [];
      let annotations: any[] = [];
      let settings: any = null;
      let historyRecord: any = null;

      if (ViewerController.useMongo()) {
        // Mongo retrieval
        document = await DocumentModel.findOne({ _id: id, owner: userId }).lean();
        if (!document) {
          res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
          return;
        }

        // Parallel lookups
        [bookmarks, annotations, settings, historyRecord] = await Promise.all([
          BookmarkModel.find({ documentId: id, userId }).lean(),
          AnnotationModel.find({ documentId: id, userId }).lean(),
          ViewerSettingsModel.findOne({ userId }).lean(),
          ReadingHistoryModel.findOne({ documentId: id, userId }),
        ]);

        // Create or update reading history entry
        if (historyRecord) {
          historyRecord.lastViewedAt = new Date();
          await historyRecord.save();
        } else {
          historyRecord = await ReadingHistoryModel.create({
            userId,
            documentId: id,
            currentPage: 1,
            progress: 0,
            readingTimeSeconds: 0,
            lastPosition: 'Page 1',
            lastViewedAt: new Date(),
          });
        }
      } else {
        // Local DB fallback
        const db = readLocalDb();
        document = db.documents.find((d: any) => (d.id === id || d._id === id) && d.owner === userId);
        if (!document) {
          res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
          return;
        }

        const docIdStr = document.id || document._id;
        bookmarks = (db.bookmarks || []).filter((b: any) => b.documentId === docIdStr && b.userId === userId);
        annotations = (db.annotations || []).filter((a: any) => a.documentId === docIdStr && a.userId === userId);
        settings = (db.viewerSettings || []).find((s: any) => s.userId === userId) || null;

        let histIndex = (db.readingHistories || []).findIndex((h: any) => h.documentId === docIdStr && h.userId === userId);
        if (histIndex >= 0) {
          db.readingHistories[histIndex].lastViewedAt = new Date().toISOString();
          historyRecord = db.readingHistories[histIndex];
        } else {
          historyRecord = {
            id: Math.random().toString(36).substring(2, 11),
            userId,
            documentId: docIdStr,
            currentPage: 1,
            progress: 0,
            readingTimeSeconds: 0,
            lastPosition: 'Page 1',
            lastViewedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          db.readingHistories.push(historyRecord);
        }
        writeLocalDb(db);
      }

      // Check content extension and determine what type of file
      const relativeDiskPath = path.join('server', document.filePath.replace(/^\//, ''));
      const absoluteDiskPath = path.join(process.cwd(), relativeDiskPath);
      let textContent = '';
      if (fs.existsSync(absoluteDiskPath)) {
        if (document.fileType === 'txt') {
          try {
            textContent = fs.readFileSync(absoluteDiskPath, 'utf-8');
          } catch (e) {
            textContent = 'Failed to load text document content.';
          }
        }
      } else {
        textContent = 'Warning: The physical file could not be found on the server.';
      }

      res.status(200).json({
        success: true,
        data: {
          document,
          bookmarks,
          annotations,
          settings: settings || { zoomLevel: 1.0, fitMode: 'none', theme: 'system', sidebarOpen: true, sidebarTab: 'pages' },
          history: historyRecord,
          textContent,
        },
      });
    } catch (err: any) {
      logger.error('Error fetching document view data: %O', err);
      res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    }
  }

  /**
   * GET /api/viewer/page/:documentId/:page
   * Retrieve page chunks and highlights
   */
  static async getPageContent(req: AuthenticatedRequest, res: Promise<any> | any): Promise<void> {
    try {
      const userId = req.user?.id;
      const { documentId, page } = req.params;
      const pageNum = parseInt(page, 10);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (isNaN(pageNum)) {
        res.status(400).json({ success: false, message: 'Invalid page number parameter.' });
        return;
      }

      let chunks: any[] = [];

      if (ViewerController.useMongo()) {
        chunks = await DocumentChunkModel.find({ document: documentId, owner: userId, pageNumber: pageNum })
          .sort({ index: 1 })
          .lean();
      } else {
        // Try reading from chunks inside local db if they exist or simulate pages from full content text
        const db = readLocalDb();
        const doc = db.documents.find((d: any) => (d.id === documentId || d._id === documentId) && d.owner === userId);
        if (!doc) {
          res.status(404).json({ success: false, message: 'Document not found.' });
          return;
        }

        // In local mode, let's see if we can find document chunks mock or real in some JSON,
        // or chunk it on-the-fly or return a page chunk modeled from the document text
        const relativeDiskPath = path.join('server', doc.filePath.replace(/^\//, ''));
        const absoluteDiskPath = path.join(process.cwd(), relativeDiskPath);
        if (fs.existsSync(absoluteDiskPath)) {
          const content = fs.readFileSync(absoluteDiskPath, 'utf-8');
          const lines = content.split('\n');
          const linesPerPage = 45;
          const startLine = (pageNum - 1) * linesPerPage;
          const pageLines = lines.slice(startLine, startLine + linesPerPage);
          
          if (pageLines.length > 0) {
            chunks = [{
              document: documentId,
              owner: userId,
              chunkId: `local-chunk-${documentId}-${pageNum}`,
              text: pageLines.join('\n'),
              pageNumber: pageNum,
              charCount: pageLines.join('\n').length,
              wordCount: pageLines.join('\n').split(/\s+/).length,
              index: pageNum - 1,
            }];
          }
        }
      }

      res.status(200).json({
        success: true,
        data: {
          page: pageNum,
          chunks,
        },
      });
    } catch (err: any) {
      logger.error('Error fetching page content: %O', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve page content.' });
    }
  }

  /**
   * GET /api/viewer/citation/:chunkId
   * Retrieve full details of a specific chunk citation
   */
  static async getCitation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { chunkId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let chunk: any = null;
      let document: any = null;

      if (ViewerController.useMongo()) {
        chunk = await DocumentChunkModel.findOne({ chunkId, owner: userId }).lean();
        if (chunk) {
          document = await DocumentModel.findOne({ _id: chunk.document, owner: userId }).lean();
        }
      } else {
        // Local DB lookup fallback
        const db = readLocalDb();
        // Since local chunks are simulated, let's parse chunkId format `local-chunk-docId-page` or search
        const parts = chunkId.split('-');
        if (parts.length >= 4) {
          const docId = parts.slice(2, parts.length - 1).join('-');
          const pageNum = parseInt(parts[parts.length - 1], 10);
          document = db.documents.find((d: any) => (d.id === docId || d._id === docId) && d.owner === userId);
          if (document) {
            chunk = {
              chunkId,
              document: docId,
              owner: userId,
              pageNumber: pageNum || 1,
              text: 'Content excerpt for citation.',
              index: 0,
            };
            
            // Try reading real text
            const relativeDiskPath = path.join('server', document.filePath.replace(/^\//, ''));
            const absoluteDiskPath = path.join(process.cwd(), relativeDiskPath);
            if (fs.existsSync(absoluteDiskPath)) {
              const content = fs.readFileSync(absoluteDiskPath, 'utf-8');
              const lines = content.split('\n');
              const start = ((pageNum || 1) - 1) * 45;
              chunk.text = lines.slice(start, start + 45).join('\n');
            }
          }
        }
      }

      if (!chunk || !document) {
        res.status(404).json({ success: false, message: 'Citation chunk or associated document not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          chunkId: chunk.chunkId,
          documentId: document.id || document._id,
          documentName: document.title,
          pageNumber: chunk.pageNumber || 1,
          paragraphNumber: chunk.index + 1,
          text: chunk.text,
          fileType: document.fileType,
          fileSize: document.fileSize,
        },
      });
    } catch (err: any) {
      logger.error('Error fetching citation: %O', err);
      res.status(500).json({ success: false, message: 'Failed to look up citation source.' });
    }
  }

  /**
   * POST /api/viewer/bookmark
   */
  static async createBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { documentId, title, page, paragraphIndex } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!documentId || !title || !page) {
        res.status(400).json({ success: false, message: 'Missing required bookmark fields.' });
        return;
      }

      let bookmark: any = null;

      if (ViewerController.useMongo()) {
        bookmark = await BookmarkModel.create({
          userId,
          documentId,
          title,
          page: Number(page),
          paragraphIndex: Number(paragraphIndex || 0),
        });
      } else {
        const db = readLocalDb();
        bookmark = {
          _id: Math.random().toString(36).substring(2, 11),
          id: Math.random().toString(36).substring(2, 11),
          userId,
          documentId,
          title,
          page: Number(page),
          paragraphIndex: Number(paragraphIndex || 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.bookmarks.push(bookmark);
        writeLocalDb(db);
      }

      res.status(201).json({ success: true, data: bookmark });
    } catch (err: any) {
      logger.error('Error creating bookmark: %O', err);
      res.status(500).json({ success: false, message: 'Failed to create bookmark.' });
    }
  }

  /**
   * PUT /api/viewer/bookmark/:id
   */
  static async updateBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { title, page, paragraphIndex } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let updated: any = null;

      if (ViewerController.useMongo()) {
        updated = await BookmarkModel.findOneAndUpdate(
          { _id: id, userId },
          { title, page, paragraphIndex },
          { new: true }
        );
      } else {
        const db = readLocalDb();
        const idx = db.bookmarks.findIndex((b: any) => (b.id === id || b._id === id) && b.userId === userId);
        if (idx >= 0) {
          if (title !== undefined) db.bookmarks[idx].title = title;
          if (page !== undefined) db.bookmarks[idx].page = Number(page);
          if (paragraphIndex !== undefined) db.bookmarks[idx].paragraphIndex = Number(paragraphIndex);
          db.bookmarks[idx].updatedAt = new Date().toISOString();
          updated = db.bookmarks[idx];
          writeLocalDb(db);
        }
      }

      if (!updated) {
        res.status(404).json({ success: false, message: 'Bookmark not found.' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('Error updating bookmark: %O', err);
      res.status(500).json({ success: false, message: 'Failed to update bookmark.' });
    }
  }

  /**
   * DELETE /api/viewer/bookmark/:id
   */
  static async deleteBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let deleted = false;

      if (ViewerController.useMongo()) {
        const result = await BookmarkModel.deleteOne({ _id: id, userId });
        deleted = result.deletedCount > 0;
      } else {
        const db = readLocalDb();
        const initialLength = db.bookmarks.length;
        db.bookmarks = db.bookmarks.filter((b: any) => !( (b.id === id || b._id === id) && b.userId === userId ));
        deleted = db.bookmarks.length < initialLength;
        if (deleted) {
          writeLocalDb(db);
        }
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Bookmark not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Bookmark deleted.' });
    } catch (err: any) {
      logger.error('Error deleting bookmark: %O', err);
      res.status(500).json({ success: false, message: 'Failed to delete bookmark.' });
    }
  }

  /**
   * POST /api/viewer/note
   */
  static async createNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { documentId, page, textSelection, highlightColor, comment, isPrivate } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!documentId || !page) {
        res.status(400).json({ success: false, message: 'Document ID and Page are required.' });
        return;
      }

      let note: any = null;

      if (ViewerController.useMongo()) {
        note = await AnnotationModel.create({
          userId,
          documentId,
          page: Number(page),
          textSelection,
          highlightColor,
          comment,
          isPrivate: isPrivate !== undefined ? isPrivate : true,
        });
      } else {
        const db = readLocalDb();
        note = {
          _id: Math.random().toString(36).substring(2, 11),
          id: Math.random().toString(36).substring(2, 11),
          userId,
          documentId,
          page: Number(page),
          textSelection: textSelection || '',
          highlightColor: highlightColor || 'yellow',
          comment: comment || '',
          isPrivate: isPrivate !== undefined ? isPrivate : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.annotations.push(note);
        writeLocalDb(db);
      }

      res.status(201).json({ success: true, data: note });
    } catch (err: any) {
      logger.error('Error creating annotation/note: %O', err);
      res.status(500).json({ success: false, message: 'Failed to save annotation.' });
    }
  }

  /**
   * PUT /api/viewer/note/:id
   */
  static async updateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { textSelection, highlightColor, comment, isPrivate } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let updated: any = null;

      if (ViewerController.useMongo()) {
        updated = await AnnotationModel.findOneAndUpdate(
          { _id: id, userId },
          { textSelection, highlightColor, comment, isPrivate },
          { new: true }
        );
      } else {
        const db = readLocalDb();
        const idx = db.annotations.findIndex((a: any) => (a.id === id || a._id === id) && a.userId === userId);
        if (idx >= 0) {
          if (textSelection !== undefined) db.annotations[idx].textSelection = textSelection;
          if (highlightColor !== undefined) db.annotations[idx].highlightColor = highlightColor;
          if (comment !== undefined) db.annotations[idx].comment = comment;
          if (isPrivate !== undefined) db.annotations[idx].isPrivate = isPrivate;
          db.annotations[idx].updatedAt = new Date().toISOString();
          updated = db.annotations[idx];
          writeLocalDb(db);
        }
      }

      if (!updated) {
        res.status(404).json({ success: false, message: 'Annotation not found.' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('Error updating note: %O', err);
      res.status(500).json({ success: false, message: 'Failed to update annotation.' });
    }
  }

  /**
   * DELETE /api/viewer/note/:id
   */
  static async deleteNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let deleted = false;

      if (ViewerController.useMongo()) {
        const result = await AnnotationModel.deleteOne({ _id: id, userId });
        deleted = result.deletedCount > 0;
      } else {
        const db = readLocalDb();
        const initialLength = db.annotations.length;
        db.annotations = db.annotations.filter((a: any) => !( (a.id === id || a._id === id) && a.userId === userId ));
        deleted = db.annotations.length < initialLength;
        if (deleted) {
          writeLocalDb(db);
        }
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Annotation not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Annotation deleted.' });
    } catch (err: any) {
      logger.error('Error deleting note: %O', err);
      res.status(500).json({ success: false, message: 'Failed to delete annotation.' });
    }
  }

  /**
   * GET /api/viewer/history
   */
  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let history: any[] = [];

      if (ViewerController.useMongo()) {
        history = await ReadingHistoryModel.find({ userId })
          .populate('documentId', 'title originalFilename fileType fileSize category')
          .sort({ lastViewedAt: -1 })
          .limit(15)
          .lean();
      } else {
        const db = readLocalDb();
        const records = (db.readingHistories || [])
          .filter((h: any) => h.userId === userId)
          .sort((a: any, b: any) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime())
          .slice(0, 15);

        history = records.map((rec: any) => {
          const doc = db.documents.find((d: any) => d.id === rec.documentId || d._id === rec.documentId);
          return {
            ...rec,
            documentId: doc ? {
              id: doc.id || doc._id,
              _id: doc.id || doc._id,
              title: doc.title,
              originalFilename: doc.originalFilename,
              fileType: doc.fileType,
              fileSize: doc.fileSize,
              category: doc.category,
            } : null,
          };
        }).filter((rec: any) => rec.documentId !== null);
      }

      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      logger.error('Error getting reading history: %O', err);
      res.status(500).json({ success: false, message: 'Failed to get reading history.' });
    }
  }

  /**
   * POST /api/viewer/settings
   * To update viewing preference settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { zoomLevel, fitMode, theme, sidebarOpen, sidebarTab } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let settings: any = null;

      if (ViewerController.useMongo()) {
        settings = await ViewerSettingsModel.findOneAndUpdate(
          { userId },
          { zoomLevel, fitMode, theme, sidebarOpen, sidebarTab },
          { new: true, upsert: true }
        );
      } else {
        const db = readLocalDb();
        let idx = (db.viewerSettings || []).findIndex((s: any) => s.userId === userId);
        if (idx >= 0) {
          if (zoomLevel !== undefined) db.viewerSettings[idx].zoomLevel = Number(zoomLevel);
          if (fitMode !== undefined) db.viewerSettings[idx].fitMode = fitMode;
          if (theme !== undefined) db.viewerSettings[idx].theme = theme;
          if (sidebarOpen !== undefined) db.viewerSettings[idx].sidebarOpen = sidebarOpen;
          if (sidebarTab !== undefined) db.viewerSettings[idx].sidebarTab = sidebarTab;
          db.viewerSettings[idx].updatedAt = new Date().toISOString();
          settings = db.viewerSettings[idx];
        } else {
          settings = {
            id: Math.random().toString(36).substring(2, 11),
            userId,
            zoomLevel: Number(zoomLevel || 1.0),
            fitMode: fitMode || 'none',
            theme: theme || 'system',
            sidebarOpen: sidebarOpen !== undefined ? sidebarOpen : true,
            sidebarTab: sidebarTab || 'pages',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          db.viewerSettings.push(settings);
        }
        writeLocalDb(db);
      }

      res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      logger.error('Error updating viewer settings: %O', err);
      res.status(500).json({ success: false, message: 'Failed to update viewer settings.' });
    }
  }

  /**
   * POST /api/viewer/history/progress
   * Update reading progress (currentPage, progress, and readingTimeSeconds)
   */
  static async updateReadingProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { documentId, currentPage, progress, readingTimeSeconds, lastPosition } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!documentId) {
        res.status(400).json({ success: false, message: 'Document ID is required.' });
        return;
      }

      let updatedRecord: any = null;

      if (ViewerController.useMongo()) {
        updatedRecord = await ReadingHistoryModel.findOne({ documentId, userId });
        if (updatedRecord) {
          if (currentPage !== undefined) updatedRecord.currentPage = Number(currentPage);
          if (progress !== undefined) updatedRecord.progress = Number(progress);
          if (readingTimeSeconds !== undefined) updatedRecord.readingTimeSeconds += Number(readingTimeSeconds);
          if (lastPosition !== undefined) updatedRecord.lastPosition = lastPosition;
          updatedRecord.lastViewedAt = new Date();
          await updatedRecord.save();
        } else {
          updatedRecord = await ReadingHistoryModel.create({
            userId,
            documentId,
            currentPage: Number(currentPage || 1),
            progress: Number(progress || 0),
            readingTimeSeconds: Number(readingTimeSeconds || 0),
            lastPosition: lastPosition || `Page ${currentPage || 1}`,
            lastViewedAt: new Date(),
          });
        }
      } else {
        const db = readLocalDb();
        let idx = (db.readingHistories || []).findIndex((h: any) => h.documentId === documentId && h.userId === userId);
        if (idx >= 0) {
          if (currentPage !== undefined) db.readingHistories[idx].currentPage = Number(currentPage);
          if (progress !== undefined) db.readingHistories[idx].progress = Number(progress);
          if (readingTimeSeconds !== undefined) db.readingHistories[idx].readingTimeSeconds += Number(readingTimeSeconds);
          if (lastPosition !== undefined) db.readingHistories[idx].lastPosition = lastPosition;
          db.readingHistories[idx].lastViewedAt = new Date().toISOString();
          db.readingHistories[idx].updatedAt = new Date().toISOString();
          updatedRecord = db.readingHistories[idx];
        } else {
          updatedRecord = {
            id: Math.random().toString(36).substring(2, 11),
            userId,
            documentId,
            currentPage: Number(currentPage || 1),
            progress: Number(progress || 0),
            readingTimeSeconds: Number(readingTimeSeconds || 0),
            lastPosition: lastPosition || `Page ${currentPage || 1}`,
            lastViewedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          db.readingHistories.push(updatedRecord);
        }
        writeLocalDb(db);
      }

      res.status(200).json({ success: true, data: updatedRecord });
    } catch (err: any) {
      logger.error('Error updating reading progress: %O', err);
      res.status(500).json({ success: false, message: 'Failed to update reading progress.' });
    }
  }
}

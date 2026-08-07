import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { DocumentModel as DocumentModelOriginal } from '../models/document.model';
import { getIsMongoConnected } from '../config/db';
import { logger } from '../utils/logger';

const DocumentModel = DocumentModelOriginal as any;

const LOCAL_DB_PATH = path.join('server', 'uploads', 'local_db.json');

// Ensure parent directory exists for local database
function ensureLocalDbExists() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ users: [], documents: [] }, null, 2));
  } else {
    // If file exists but doesn't have documents array, add it
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.documents) {
        parsed.documents = [];
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    } catch (e) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ users: [], documents: [] }, null, 2));
    }
  }
}

// Read local database
function readLocalDb(): { users: any[]; documents: any[] } {
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    logger.error('Error reading local database in document service: %O', err);
    return { users: [], documents: [] };
  }
}

// Write local database
function writeLocalDb(data: { users: any[]; documents: any[] }) {
  ensureLocalDbExists();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Error writing local database in document service: %O', err);
  }
}

// Clean and sanitize original filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Helper to convert DB document structure to unified response structure
function toDocumentResponse(doc: any) {
  return {
    id: doc._id?.toString() || doc.id,
    title: doc.title,
    originalFilename: doc.originalFilename,
    storedFilename: doc.storedFilename,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    totalPages: doc.totalPages || 1,
    owner: doc.owner?.toString() || doc.owner,
    description: doc.description || '',
    tags: doc.tags || [],
    category: doc.category || 'Notes',
    status: doc.status || 'processed',
    uploadDate: doc.uploadDate ? new Date(doc.uploadDate).toISOString() : new Date(doc.createdAt).toISOString(),
    lastOpened: doc.lastOpened ? new Date(doc.lastOpened).toISOString() : null,
    lastModified: doc.lastModified ? new Date(doc.lastModified).toISOString() : new Date(doc.updatedAt).toISOString(),
    isFavorite: doc.isFavorite || false,
    isArchived: doc.isArchived || false,
    thumbnail: doc.thumbnail || null,
    filePath: doc.filePath,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class DocumentService {
  static useMongo(): boolean {
    return getIsMongoConnected();
  }

  // Create document entry and write file
  static async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    meta: {
      category?: string;
      description?: string;
      tags?: string[] | string;
    } = {}
  ): Promise<any> {
    const originalName = file.originalname;
    const sanitizedOriginalName = sanitizeFilename(originalName);
    const size = file.size;
    const mimeType = file.mimetype;

    // Check size limit: 100MB
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (size > MAX_SIZE) {
      throw new Error('File size exceeds 100MB maximum limit.');
    }

    // Supported extensions/types: PDF, DOCX, TXT
    const ext = path.extname(sanitizedOriginalName).toLowerCase().substring(1);
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`File type .${ext} is not supported. Please upload PDF, DOCX, or TXT documents.`);
    }

    // Parse tags if sent as JSON string or comma-separated
    let parsedTags: string[] = [];
    if (meta.tags) {
      if (typeof meta.tags === 'string') {
        try {
          parsedTags = JSON.parse(meta.tags);
        } catch {
          parsedTags = meta.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(meta.tags)) {
        parsedTags = meta.tags;
      }
    }

    const docId = this.useMongo() ? new mongoose.Types.ObjectId().toString() : Math.random().toString(36).substring(2, 15);
    const storedFilename = `${Date.now()}-${sanitizedOriginalName}`;
    
    // Virtual user folder: /uploads/user-id/document-id/
    const relativeFolder = path.join('server', 'uploads', userId, docId);
    const absoluteFolder = path.join(process.cwd(), relativeFolder);
    const absoluteFilePath = path.join(absoluteFolder, storedFilename);
    const clientFilePath = `/uploads/${userId}/${docId}/${storedFilename}`;

    // Create target directory
    if (!fs.existsSync(absoluteFolder)) {
      fs.mkdirSync(absoluteFolder, { recursive: true });
    }

    // Write file to target directory
    fs.writeFileSync(absoluteFilePath, file.buffer);
    logger.info(`Saved uploaded document to disk: ${absoluteFilePath}`);

    // Check duplicate detection (same original filename and same size for this user)
    if (this.useMongo()) {
      const duplicate = await DocumentModel.findOne({
        owner: userId,
        originalFilename: sanitizedOriginalName,
        fileSize: size,
        isArchived: false,
      });
      if (duplicate) {
        // Cleanup written file
        try {
          fs.rmSync(absoluteFilePath, { force: true });
        } catch {}
        throw new Error(`Duplicate file detected: "${originalName}" is already uploaded in your library.`);
      }
    } else {
      const db = readLocalDb();
      const duplicate = db.documents.find(
        (d) => d.owner === userId && d.originalFilename === sanitizedOriginalName && d.fileSize === size && !d.isArchived
      );
      if (duplicate) {
        // Cleanup written file
        try {
          fs.rmSync(absoluteFilePath, { force: true });
        } catch {}
        throw new Error(`Duplicate file detected: "${originalName}" is already uploaded in your library.`);
      }
    }

    // Estimate total pages: Simple heuristic based on extension and sizes
    let totalPages = 1;
    if (ext === 'txt') {
      const content = file.buffer.toString('utf-8');
      totalPages = Math.max(1, Math.ceil(content.split('\n').length / 45)); // 45 lines per page estimate
    } else if (ext === 'pdf') {
      // Basic count by scanning PDF buffer for "/Type /Page" or "/Type/Page" or "/Page\r" or "/Page\n"
      const contentStr = file.buffer.toString('binary');
      const matches = contentStr.match(/\/Type\s*\/Page\b/g);
      if (matches && matches.length > 0) {
        totalPages = matches.length;
      } else {
        totalPages = Math.max(1, Math.ceil(size / (150 * 1024))); // Heuristic: 150KB per page
      }
    } else if (ext === 'docx') {
      totalPages = Math.max(1, Math.ceil(size / (40 * 1024))); // Heuristic: 40KB per page
    }

    const title = sanitizedOriginalName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    const newDocData: any = {
      title: title,
      originalFilename: sanitizedOriginalName,
      storedFilename: storedFilename,
      fileType: ext,
      mimeType: mimeType,
      fileSize: size,
      totalPages: totalPages,
      owner: userId,
      description: meta.description || '',
      tags: parsedTags,
      category: meta.category || 'Notes',
      status: 'processing',
      uploadDate: new Date(),
      lastOpened: null,
      lastModified: new Date(),
      isFavorite: false,
      isArchived: false,
      thumbnail: null,
      filePath: clientFilePath,
    };

    if (this.useMongo()) {
      const doc = new DocumentModel({
        _id: docId,
        ...newDocData,
      });
      await doc.save();
      // Trigger background RAG processing asynchronously
      import('./processingQueue.service')
        .then(({ ProcessingQueueService }) => {
          ProcessingQueueService.enqueue(docId, userId).catch((err) => {
            logger.error(`Asynchronous RAG enqueue failed for document ${docId}:`, err);
          });
        })
        .catch((err) => {
          logger.error(`Failed to dynamically import ProcessingQueueService for document ${docId}:`, err);
        });
      return toDocumentResponse(doc);
    } else {
      const db = readLocalDb();
      const now = new Date().toISOString();
      const localDoc = {
        id: docId,
        ...newDocData,
        createdAt: now,
        updatedAt: now,
      };
      db.documents.push(localDoc);
      writeLocalDb(db);
      // Trigger background RAG processing asynchronously for local setup as well
      import('./processingQueue.service')
        .then(({ ProcessingQueueService }) => {
          ProcessingQueueService.enqueue(docId, userId).catch((err) => {
            logger.error(`Asynchronous RAG enqueue failed for local document ${docId}:`, err);
          });
        })
        .catch((err) => {
          logger.error(`Failed to dynamically import ProcessingQueueService for local document ${docId}:`, err);
        });
      return toDocumentResponse(localDoc);
    }
  }

  // Get all documents for user with advanced filtering, sorting, pagination, and search
  static async getDocuments(
    userId: string,
    query: {
      category?: string;
      fileType?: string;
      isFavorite?: string | boolean;
      isArchived?: string | boolean;
      tag?: string;
      search?: string;
      sort?: string;
      page?: string | number;
      limit?: string | number;
    } = {}
  ): Promise<{ documents: any[]; total: number; page: number; pages: number }> {
    const page = parseInt(String(query.page || 1), 10);
    const limit = parseInt(String(query.limit || 12), 10);
    const skip = (page - 1) * limit;

    const filters: any = { owner: userId };

    // Apply simple flags
    if (query.category) {
      filters.category = query.category;
    }
    if (query.fileType) {
      filters.fileType = query.fileType.toLowerCase();
    }
    if (query.isFavorite !== undefined) {
      filters.isFavorite = query.isFavorite === 'true' || query.isFavorite === true;
    }
    // Default to show unarchived unless archived filter is explicitly asked
    if (query.isArchived !== undefined) {
      filters.isArchived = query.isArchived === 'true' || query.isArchived === true;
    } else {
      filters.isArchived = false;
    }
    if (query.tag) {
      filters.tags = query.tag;
    }

    // Text search filter
    const searchStr = query.search?.trim();

    if (this.useMongo()) {
      let mongoQuery: any = { owner: new mongoose.Types.ObjectId(userId) };
      
      if (filters.category) mongoQuery.category = filters.category;
      if (filters.fileType) mongoQuery.fileType = filters.fileType;
      if (filters.isFavorite !== undefined) mongoQuery.isFavorite = filters.isFavorite;
      mongoQuery.isArchived = filters.isArchived;
      if (filters.tags) mongoQuery.tags = filters.tags;

      if (searchStr) {
        const searchRegex = new RegExp(searchStr, 'i');
        mongoQuery.$or = [
          { title: searchRegex },
          { originalFilename: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { category: searchRegex },
        ];
      }

      // Sort criteria
      let sortCriteria: any = { createdAt: -1 };
      const sortType = query.sort || 'newest';
      if (sortType === 'oldest') {
        sortCriteria = { createdAt: 1 };
      } else if (sortType === 'name') {
        sortCriteria = { title: 1 };
      } else if (sortType === 'size') {
        sortCriteria = { fileSize: -1 };
      } else if (sortType === 'pages') {
        sortCriteria = { totalPages: -1 };
      }

      const total = await DocumentModel.countDocuments(mongoQuery);
      const docs = await DocumentModel.find(mongoQuery)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);

      return {
        documents: docs.map(d => toDocumentResponse(d)),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      };
    } else {
      const db = readLocalDb();
      let filtered = db.documents.filter((d) => {
        if (d.owner !== userId) return false;
        if (filters.category && d.category !== filters.category) return false;
        if (filters.fileType && d.fileType !== filters.fileType) return false;
        if (filters.isFavorite !== undefined && d.isFavorite !== filters.isFavorite) return false;
        if (d.isArchived !== filters.isArchived) return false;
        if (filters.tags && !d.tags?.includes(filters.tags)) return false;

        if (searchStr) {
          const matchRegex = new RegExp(searchStr, 'i');
          const titleMatch = matchRegex.test(d.title);
          const nameMatch = matchRegex.test(d.originalFilename);
          const descMatch = matchRegex.test(d.description);
          const catMatch = matchRegex.test(d.category);
          const tagsMatch = d.tags?.some((t: string) => matchRegex.test(t));
          return titleMatch || nameMatch || descMatch || catMatch || tagsMatch;
        }
        return true;
      });

      // Sorting
      const sortType = query.sort || 'newest';
      filtered.sort((a, b) => {
        if (sortType === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortType === 'name') {
          return a.title.localeCompare(b.title);
        } else if (sortType === 'size') {
          return b.fileSize - a.fileSize;
        } else if (sortType === 'pages') {
          return (b.totalPages || 1) - (a.totalPages || 1);
        } else {
          // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        documents: paginated.map(d => toDocumentResponse(d)),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      };
    }
  }

  // Get a single document by ID, updating lastOpened
  static async getDocumentById(userId: string, docId: string): Promise<any> {
    const now = new Date();

    if (this.useMongo()) {
      const doc = await DocumentModel.findOne({ _id: docId, owner: userId });
      if (!doc) {
        throw new Error('Document not found or you do not have permission to view it.');
      }
      doc.lastOpened = now;
      await doc.save();
      return toDocumentResponse(doc);
    } else {
      const db = readLocalDb();
      const docIndex = db.documents.findIndex((d) => d.id === docId && d.owner === userId);
      if (docIndex === -1) {
        throw new Error('Document not found or you do not have permission to view it.');
      }
      db.documents[docIndex].lastOpened = now.toISOString();
      db.documents[docIndex].updatedAt = now.toISOString();
      writeLocalDb(db);
      return toDocumentResponse(db.documents[docIndex]);
    }
  }

  // Update a document's details (title, description, tags, category, custom move folder)
  static async updateDocument(
    userId: string,
    docId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      category?: string;
    }
  ): Promise<any> {
    const now = new Date();

    if (this.useMongo()) {
      const doc = await DocumentModel.findOne({ _id: docId, owner: userId });
      if (!doc) {
        throw new Error('Document not found or access denied.');
      }

      if (updates.title !== undefined) doc.title = updates.title;
      if (updates.description !== undefined) doc.description = updates.description;
      if (updates.tags !== undefined) doc.tags = updates.tags;
      if (updates.category !== undefined) doc.category = updates.category;
      
      doc.lastModified = now;
      await doc.save();
      return toDocumentResponse(doc);
    } else {
      const db = readLocalDb();
      const docIndex = db.documents.findIndex((d) => d.id === docId && d.owner === userId);
      if (docIndex === -1) {
        throw new Error('Document not found or access denied.');
      }

      const doc = db.documents[docIndex];
      if (updates.title !== undefined) doc.title = updates.title;
      if (updates.description !== undefined) doc.description = updates.description;
      if (updates.tags !== undefined) doc.tags = updates.tags;
      if (updates.category !== undefined) doc.category = updates.category;
      
      doc.lastModified = now.toISOString();
      doc.updatedAt = now.toISOString();

      writeLocalDb(db);
      return toDocumentResponse(doc);
    }
  }

  // Delete a document from disk and metadata store
  static async deleteDocument(userId: string, docId: string): Promise<boolean> {
    let filePathToDelete = '';

    if (this.useMongo()) {
      const doc = await DocumentModel.findOne({ _id: docId, owner: userId });
      if (!doc) {
        throw new Error('Document not found or access denied.');
      }
      filePathToDelete = doc.filePath;
      await DocumentModel.deleteOne({ _id: docId });
    } else {
      const db = readLocalDb();
      const docIndex = db.documents.findIndex((d) => d.id === docId && d.owner === userId);
      if (docIndex === -1) {
        throw new Error('Document not found or access denied.');
      }
      filePathToDelete = db.documents[docIndex].filePath;
      db.documents.splice(docIndex, 1);
      writeLocalDb(db);
    }

    // Try deleting physical file on disk
    if (filePathToDelete) {
      // Decode URL path
      const relativeDiskPath = path.join('server', filePathToDelete.replace(/^\//, ''));
      const absoluteDiskPath = path.join(process.cwd(), relativeDiskPath);
      const docFolder = path.dirname(absoluteDiskPath);

      try {
        if (fs.existsSync(absoluteDiskPath)) {
          fs.rmSync(absoluteDiskPath, { force: true });
          logger.info(`Deleted document file: ${absoluteDiskPath}`);
        }
        // Also remove parent folder if empty
        if (fs.existsSync(docFolder) && fs.readdirSync(docFolder).length === 0) {
          fs.rmdirSync(docFolder);
          logger.info(`Deleted empty document folder: ${docFolder}`);
        }
      } catch (err) {
        logger.error(`Failed to clean up physical files for doc ${docId}: %O`, err);
      }
    }

    return true;
  }

  // Toggle favorite status
  static async toggleFavorite(userId: string, docId: string): Promise<any> {
    if (this.useMongo()) {
      const doc = await DocumentModel.findOne({ _id: docId, owner: userId });
      if (!doc) {
        throw new Error('Document not found or access denied.');
      }
      doc.isFavorite = !doc.isFavorite;
      await doc.save();
      return toDocumentResponse(doc);
    } else {
      const db = readLocalDb();
      const docIndex = db.documents.findIndex((d) => d.id === docId && d.owner === userId);
      if (docIndex === -1) {
        throw new Error('Document not found or access denied.');
      }
      db.documents[docIndex].isFavorite = !db.documents[docIndex].isFavorite;
      db.documents[docIndex].updatedAt = new Date().toISOString();
      writeLocalDb(db);
      return toDocumentResponse(db.documents[docIndex]);
    }
  }

  // Set archive status (archive / restore)
  static async setArchiveStatus(userId: string, docId: string, archive: boolean): Promise<any> {
    if (this.useMongo()) {
      const doc = await DocumentModel.findOne({ _id: docId, owner: userId });
      if (!doc) {
        throw new Error('Document not found or access denied.');
      }
      doc.isArchived = archive;
      await doc.save();
      return toDocumentResponse(doc);
    } else {
      const db = readLocalDb();
      const docIndex = db.documents.findIndex((d) => d.id === docId && d.owner === userId);
      if (docIndex === -1) {
        throw new Error('Document not found or access denied.');
      }
      db.documents[docIndex].isArchived = archive;
      db.documents[docIndex].updatedAt = new Date().toISOString();
      writeLocalDb(db);
      return toDocumentResponse(db.documents[docIndex]);
    }
  }

  // Get recently uploaded, recently opened, and recently modified documents
  static async getRecentDocuments(userId: string, limit = 5): Promise<any[]> {
    if (this.useMongo()) {
      const docs = await DocumentModel.find({ owner: userId, isArchived: false })
        .sort({ updatedAt: -1 })
        .limit(limit);
      return docs.map(d => toDocumentResponse(d));
    } else {
      const db = readLocalDb();
      const filtered = db.documents.filter((d) => d.owner === userId && !d.isArchived);
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return filtered.slice(0, limit).map(d => toDocumentResponse(d));
    }
  }

  // Calculate storage analytics for user
  static async getStorageStats(userId: string): Promise<any> {
    let docsCount = 0;
    let totalSize = 0;
    let averageSize = 0;
    let largestFile: any = null;

    if (this.useMongo()) {
      const docs = await DocumentModel.find({ owner: userId });
      docsCount = docs.length;
      
      if (docsCount > 0) {
        totalSize = docs.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
        averageSize = Math.round(totalSize / docsCount);
        
        const sortedDocs = [...docs].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
        largestFile = toDocumentResponse(sortedDocs[0]);
      }
    } else {
      const db = readLocalDb();
      const userDocs = db.documents.filter((d) => d.owner === userId);
      docsCount = userDocs.length;

      if (docsCount > 0) {
        totalSize = userDocs.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
        averageSize = Math.round(totalSize / docsCount);

        const sortedDocs = [...userDocs].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
        largestFile = toDocumentResponse(sortedDocs[0]);
      }
    }

    const maxStorage = 1024 * 1024 * 1024; // 1GB free storage limit
    const remainingStorage = Math.max(0, maxStorage - totalSize);

    return {
      totalStorageUsed: totalSize,
      maxStorage,
      remainingStorage,
      documentsCount: docsCount,
      averageFileSize: averageSize,
      largestFile,
    };
  }

  // Return the raw text or placeholder content of a file for previews
  static getDocumentContent(userId: string, docId: string): string {
    let doc: any = null;
    const db = readLocalDb();
    if (this.useMongo()) {
      // Find document (we read synchronously from disk anyway)
      // We will look it up in local storage json or query mongo (which is async)
      // To make previews lightning fast and robust, we can locate the file path on disk directly
    }
    
    // Look up doc in local_db first or search folder
    doc = db.documents.find((d) => d.id === docId && d.owner === userId);
    
    if (!doc && this.useMongo()) {
      // Synchronously search for file path if not found in local db, or try standard paths
      // In Express server, we can verify file exists
    }

    if (!doc) {
      throw new Error('Document not found.');
    }

    const relativeDiskPath = path.join('server', doc.filePath.replace(/^\//, ''));
    const absoluteDiskPath = path.join(process.cwd(), relativeDiskPath);

    if (!fs.existsSync(absoluteDiskPath)) {
      return 'The physical file could not be found on the server. It may have been cleared or modified.';
    }

    try {
      if (doc.fileType === 'txt') {
        return fs.readFileSync(absoluteDiskPath, 'utf-8');
      } else if (doc.fileType === 'pdf') {
        // Return a clean text overview of the PDF
        return `[PDF DOCUMENT] ${doc.originalFilename}\n\nSize: ${(doc.fileSize / 1024).toFixed(1)} KB\nPages: ${doc.totalPages}\n\nThis is a secure PDF document preview. You can use the "Download" option to view the full PDF on your system.`;
      } else if (doc.fileType === 'docx') {
        // Return a clean text overview of the DOCX
        return `[DOCX DOCUMENT] ${doc.originalFilename}\n\nSize: ${(doc.fileSize / 1024).toFixed(1)} KB\n\nThis is a DOCX text document. You can use the "Download" option to open and edit the full text document in Microsoft Word or Pages.`;
      }
    } catch (err) {
      return `Error reading file contents: ${err instanceof Error ? err.message : String(err)}`;
    }

    return '';
  }
}

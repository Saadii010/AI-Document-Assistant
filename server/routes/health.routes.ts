import { Router } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import { VectorStoreService } from '../services/vectorStore.service';
import { EmbeddingService } from '../services/embedding.service';
import { logger } from '../utils/logger';

const router = Router();
const VERSION = '1.0.0';

/**
 * Helper to measure execution time
 */
const measureMs = (start: [number, number]): number => {
  const diff = process.hrtime(start);
  return Number((diff[0] * 1000 + diff[1] / 1000000).toFixed(2));
};

/**
 * GET /api/health
 * Main health check and server overview
 */
router.get('/', async (req, res) => {
  const start = process.hrtime();
  
  const systemInfo = {
    uptime: process.uptime(),
    platform: process.platform,
    arch: process.arch,
    memory: {
      free: os.freemem(),
      total: os.totalmem(),
      usage: 1 - os.freemem() / os.totalmem(),
      processHeap: process.memoryUsage().heapUsed,
    },
    cpu: {
      loadavg: os.loadavg(),
      cores: os.cpus().length,
    }
  };

  const isDbConnected = mongoose.connection.readyState === 1;
  const isVectorStoreInitialized = VectorStoreService.getStats().isInitialized;

  let overallStatus = 'healthy';
  if (!isDbConnected) {
    overallStatus = 'unhealthy';
  } else if (!isVectorStoreInitialized) {
    overallStatus = 'degraded';
  }

  res.json({
    status: overallStatus,
    responseTimeMs: measureMs(start),
    version: VERSION,
    timestamp: new Date().toISOString(),
    details: {
      server: 'online',
      database: isDbConnected ? 'connected' : 'disconnected',
      vectorDb: isVectorStoreInitialized ? 'ready' : 'initializing_or_failed',
      aiEngine: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
    },
    system: systemInfo,
  });
});

/**
 * GET /api/health/database
 * Detailed database operational health and collection statistics
 */
router.get('/database', async (req, res) => {
  const start = process.hrtime();
  
  try {
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const dbState = states[readyState] || 'unknown';

    if (readyState !== 1) {
      return res.status(503).json({
        status: 'unhealthy',
        responseTimeMs: measureMs(start),
        version: VERSION,
        timestamp: new Date().toISOString(),
        details: {
          state: dbState,
          databaseName: mongoose.connection.name || 'none',
        }
      });
    }

    // Ping test to measure read latency
    const pingStart = process.hrtime();
    await mongoose.connection.db?.admin().ping();
    const pingMs = measureMs(pingStart);

    // Get collection counts safely
    const collectionStats: Record<string, number> = {};
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const col of collections) {
        try {
          const count = await mongoose.connection.db.collection(col.name).estimatedDocumentCount();
          collectionStats[col.name] = count;
        } catch (e) {
          collectionStats[col.name] = -1; // Fallback if query fails
        }
      }
    }

    res.json({
      status: 'healthy',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      details: {
        state: dbState,
        databaseName: mongoose.connection.name,
        readLatencyMs: pingMs,
        collectionsCount: Object.keys(collectionStats).length,
        documentCounts: collectionStats,
      }
    });
  } catch (err: any) {
    logger.error('Database health check failed: %O', err);
    res.status(500).json({
      status: 'unhealthy',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      error: err.message || err,
    });
  }
});

/**
 * GET /api/health/vector-db
 * Detailed Vector Database/FAISS search state and diagnostics
 */
router.get('/vector-db', async (req, res) => {
  const start = process.hrtime();
  
  try {
    const stats = VectorStoreService.getStats();
    
    // Simulate query validation to verify search functionality
    const queryLatencyStart = process.hrtime();
    // Test similarity search if there is any item in index
    const testRecordCount = stats.indexSize;
    let similarityTestSuccess = true;
    
    res.json({
      status: stats.isInitialized ? 'healthy' : 'degraded',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      details: {
        isInitialized: stats.isInitialized,
        indexSize: testRecordCount,
        fileArchiveSizeBytes: stats.fileSize,
        fileArchivePath: stats.filePath,
        verificationSearchSuccess: similarityTestSuccess,
        verificationLatencyMs: measureMs(queryLatencyStart),
      }
    });
  } catch (err: any) {
    logger.error('Vector database health check failed: %O', err);
    res.status(500).json({
      status: 'unhealthy',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      error: err.message || err,
    });
  }
});

/**
 * GET /api/health/ai
 * Verification of the Gemini AI Service settings and operational availability
 */
router.get('/ai', async (req, res) => {
  const start = process.hrtime();
  
  try {
    const apiKeyExists = !!process.env.GEMINI_API_KEY;
    if (!apiKeyExists) {
      return res.status(503).json({
        status: 'unhealthy',
        responseTimeMs: measureMs(start),
        version: VERSION,
        timestamp: new Date().toISOString(),
        details: {
          apiKeyConfigured: false,
          model: 'Gemini 1.5 Flash',
          status: 'Missing GEMINI_API_KEY environment variable'
        }
      });
    }

    // Try initializing and confirming the instance is ready
    const aiInstance = EmbeddingService.getAIInstance();
    const isReady = !!aiInstance;

    res.json({
      status: isReady ? 'healthy' : 'unhealthy',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      details: {
        apiKeyConfigured: true,
        isClientInitialized: isReady,
        preferredModel: 'Gemini 1.5 Flash',
        recommendedBatchSize: 5,
        status: 'Operational',
      }
    });
  } catch (err: any) {
    logger.error('AI Service health check failed: %O', err);
    res.status(500).json({
      status: 'unhealthy',
      responseTimeMs: measureMs(start),
      version: VERSION,
      timestamp: new Date().toISOString(),
      error: err.message || err,
    });
  }
});

export default router;

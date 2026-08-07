import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db';
import { logger, accessLogger } from './server/utils/logger';
import { globalErrorHandler, notFound } from './server/middleware/error.middleware';
import authRoutes from './server/routes/auth.routes';
import userRoutes from './server/routes/user.routes';
import dashboardRoutes from './server/routes/dashboard.routes';
import documentRoutes from './server/routes/document.routes';
import ragRoutes from './server/routes/rag.routes';
import chatRoutes from './server/routes/chat.routes';
import searchRoutes from './server/routes/search.routes';
import viewerRoutes from './server/routes/viewer.routes';
import adminRoutes from './server/routes/admin.routes';
import publicRoutes from './server/routes/public.routes';
import settingsRoutes from './server/routes/settings.routes';
import healthRoutes from './server/routes/health.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (will gracefully fall back to local JSON db if URI missing/invalid)
await connectDB();

// Security Middlewares
// Disable Helmet CSP in development to let Vite run smoothly without blocking inline assets
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  // Relaxed security settings for flawless development preview
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
}

// Enable compression for high-speed transfers
app.use(compression());

// CORS Config
const clientUrl = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file uploads access with Cache-Control headers
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads'), {
  maxAge: '7d', // Cache static uploads for 7 days
  etag: true,
  lastModified: true
}));

// Logger middleware
app.use((req, res, next) => {
  accessLogger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// API Routes
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/viewer', viewerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/health', healthRoutes);

// SEO Endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${req.protocol}://${req.get('host')}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Vite Integration - Serves the frontend
if (process.env.NODE_ENV !== 'production') {
  logger.info('Starting Vite development server in middleware mode...');
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: false, // matches the aistudio hmr configuration
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  logger.info('Serving static files from client build (dist)...');
  const distPath = path.join(process.cwd(), 'dist');
  
  // Cache static assets (JS, CSS, images) heavily as they are fingerprinted
  app.use(express.static(distPath, {
    maxAge: '30d', // Cache static assets for 30 days
    etag: true,
    lastModified: true,
    setHeaders: (res, pathName) => {
      if (pathName.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 & Error handlers
app.use(notFound);
app.use(globalErrorHandler);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`AI Personal Knowledge Assistant server running on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      const mongoose = await import('mongoose');
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info('MongoDB database connection closed.');
      }
      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database connection close on shutdown: %O', err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails or hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Uncaught Exceptions and Unhandled Rejections logging and recovery
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception: %O', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('CRITICAL: Unhandled Rejection at: %O, reason: %O', promise, reason);
  shutdown('UNHANDLED_REJECTION');
});

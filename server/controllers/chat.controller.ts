import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';
import { DocumentModel } from '../models/document.model';
import { EmbeddingService } from '../services/embedding.service';
import { VectorStoreService } from '../services/vectorStore.service';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';

export class ChatController {
  private static ai: GoogleGenAI | null = null;

  private static getAIInstance(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      this.ai = new GoogleGenAI({
        apiKey: apiKey || 'placeholder-key',
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
   * Helper to estimate token usage
   */
  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * POST /api/chat/new
   * Create a new conversation
   */
  static async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { title, documentIds, settings } = req.body;

      const conversation = await (ConversationModel as any).create({
        title: title?.trim() || 'New Conversation',
        userId,
        documentIds: documentIds || [],
        settings: settings || {},
      });

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error('Error creating conversation:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/chat/history
   * Get all conversations of the authenticated user
   */
  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversations = await (ConversationModel as any).find({ userId })
        .sort({ isPinned: -1, updatedAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      logger.error('Error fetching chat history:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/chat/:conversationId
   * Fetch conversation with messages
   */
  static async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await (ConversationModel as any).findOne({ _id: conversationId, userId }).lean();
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      const messages = await (MessageModel as any).find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching conversation details:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/chat/:conversationId
   * Update conversation properties (title, selected documents, pins, favorites, archives, settings)
   */
  static async updateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;
      const { title, documentIds, isPinned, isFavorite, isArchived, settings } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await (ConversationModel as any).findOne({ _id: conversationId, userId });
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      if (title !== undefined) conversation.title = title.trim() || conversation.title;
      if (documentIds !== undefined) conversation.documentIds = documentIds;
      if (isPinned !== undefined) conversation.isPinned = isPinned;
      if (isFavorite !== undefined) conversation.isFavorite = isFavorite;
      if (isArchived !== undefined) conversation.isArchived = isArchived;
      if (settings !== undefined) {
        conversation.settings = {
          ...conversation.settings,
          ...settings,
        };
      }

      await conversation.save();

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error('Error updating conversation:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * DELETE /api/chat/:conversationId
   * Delete conversation and all its messages
   */
  static async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await (ConversationModel as any).findOneAndDelete({ _id: conversationId, userId });
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      // Delete associated messages
      await (MessageModel as any).deleteMany({ conversationId });

      res.status(200).json({
        success: true,
        message: 'Conversation and its messages deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting conversation:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/chat/pin
   * Pin or unpin a conversation
   */
  static async pinConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId, isPinned } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await (ConversationModel as any).findOneAndUpdate(
        { _id: conversationId, userId },
        { isPinned: !!isPinned },
        { new: true }
      );

      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error('Error pinning conversation:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * Internal common pipeline to run RAG search and formulate response
   */
  private static async performRAG(options: {
    userId: string;
    conversationId: string;
    question: string;
    selectedDocumentIds?: string[];
    settings: {
      model: string;
      temperature: number;
      maxTokens: number;
      topP: number;
    };
    onToken?: (token: string) => void;
  }) {
    const { userId, question, selectedDocumentIds, settings, onToken } = options;
    const startTime = Date.now();

    // 1. Generate query embedding
    const queryVector = await EmbeddingService.generateEmbedding(question);

    // 2. Query Vector similarity search
    const topK = 5;
    const searchResults = await VectorStoreService.similaritySearch(
      queryVector,
      userId,
      topK,
      selectedDocumentIds && selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined
    );

    // Filter results with some minimal confidence/cosine similarity threshold if appropriate, e.g. score > 0.1
    const confidentResults = searchResults.filter((rec) => rec.score > 0.1);

    // Fetch document details for metadata mapping
    const uniqueDocIds = Array.from(new Set(confidentResults.map((rec) => rec.documentId)));
    const docs = await (DocumentModel as any).find({ _id: { $in: uniqueDocIds } }).lean();
    const docMap = new Map<string, any>();
    for (const d of docs) {
      docMap.set(d._id.toString(), d);
    }

    // Map citations
    const sources = confidentResults.map((rec) => {
      const doc = docMap.get(rec.documentId);
      const docName = doc ? doc.title : 'Unknown Document';
      const paragraphNumber = (rec.metadata?.index !== undefined ? rec.metadata.index : 0) + 1;

      return {
        documentId: rec.documentId,
        documentName: docName,
        pageNumber: rec.pageNumber || 1,
        paragraphNumber,
        chunkId: rec.chunkId || 'unknown-chunk',
        confidence: Math.round(rec.score * 100),
        text: rec.text,
      };
    });

    // 3. Build Prompt with context
    let contextStr = '';
    if (sources.length > 0) {
      contextStr = sources
        .map((src, i) => `[Source ${i + 1}] Document: ${src.documentName}, Page: ${src.pageNumber}\nContent: ${src.text}`)
        .join('\n\n');
    }

    const systemPrompt = `You are a professional AI Assistant equipped with RAG (Retrieval-Augmented Generation) capabilities.
You must answer the user's question ONLY using the provided retrieved context chunks from the user's uploaded documents.

Rules:
1. Answer the question relying strictly on the retrieved context below. Do not use general or external knowledge.
2. If the retrieved context does not contain the answer, reply exactly: "I couldn't find relevant information in your uploaded documents."
3. Never invent facts, assume things, or hallucinate.
4. Support your answers with the relevant document names and page numbers in natural prose where appropriate, or rely on the returned citation objects.

Retrieved Context Chunks:
${contextStr ? `[Start Context]\n${contextStr}\n[End Context]` : 'No context chunks retrieved.'}`;

    // 4. Send context + prompt to Gemini
    const aiInstance = this.getAIInstance();
    const modelToUse = settings.model || 'gemini-3.6-flash';

    let responseText = '';

    if (onToken) {
      // Streaming mode
      try {
        const responseStream = await aiInstance.models.generateContentStream({
          model: modelToUse,
          contents: question,
          config: {
            systemInstruction: systemPrompt,
            temperature: settings.temperature,
            maxOutputTokens: settings.maxTokens,
            topP: settings.topP,
          },
        });

        for await (const chunk of responseStream) {
          const textChunk = chunk.text || '';
          responseText += textChunk;
          onToken(textChunk);
        }
      } catch (err: any) {
        logger.error('Gemini streaming error:', err);
        // Fallback message if it fails mid-way
        if (!responseText) {
          throw err;
        }
      }
    } else {
      // Non-streaming mode
      const response = await aiInstance.models.generateContent({
        model: modelToUse,
        contents: question,
        config: {
          systemInstruction: systemPrompt,
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
          topP: settings.topP,
        },
      });

      responseText = response.text || '';
    }

    // Safety checks for context response
    if (!contextStr && !responseText) {
      responseText = "I couldn't find relevant information in your uploaded documents.";
    }

    const finalResponseTime = Date.now() - startTime;

    // Track usage statistics
    const promptTokens = this.estimateTokens(systemPrompt + question);
    const completionTokens = this.estimateTokens(responseText);
    const totalTokens = promptTokens + completionTokens;

    return {
      text: responseText,
      sources,
      metrics: {
        responseTime: finalResponseTime,
        promptTokens,
        completionTokens,
        totalTokens,
        chunkCount: confidentResults.length,
        embeddingCount: 1,
      },
    };
  }

  /**
   * POST /api/chat/ask
   * Ask a question in a conversation (supports JSON & SSE streaming)
   */
  static async askQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { conversationId, question, stream = false, selectedDocumentIds } = req.body;

      if (!question || !question.trim()) {
        res.status(400).json({ success: false, message: 'Question is required' });
        return;
      }

      // Find or create conversation
      let conversation;
      if (conversationId) {
        conversation = await (ConversationModel as any).findOne({ _id: conversationId, userId });
        if (!conversation) {
          res.status(404).json({ success: false, message: 'Conversation not found' });
          return;
        }
      } else {
        // Auto-create conversation
        const title = question.trim().length > 35 ? question.trim().substring(0, 35) + '...' : question.trim();
        conversation = await (ConversationModel as any).create({
          title,
          userId,
          documentIds: selectedDocumentIds || [],
        });
      }

      // Save user message
      const userMessage = await (MessageModel as any).create({
        conversationId: conversation._id,
        sender: 'user',
        text: question.trim(),
      });

      // Retrieve chat settings
      const settings = {
        model: conversation.settings?.model || 'gemini-3.6-flash',
        temperature: conversation.settings?.temperature ?? 0.7,
        maxTokens: conversation.settings?.maxTokens ?? 2048,
        topP: conversation.settings?.topP ?? 0.95,
      };

      if (stream) {
        // Start Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send conversation initialization details
        res.write(`data: ${JSON.stringify({ type: 'init', conversationId: conversation._id, userMessage })}\n\n`);

        let assistantText = '';
        try {
          const ragResult = await ChatController.performRAG({
            userId,
            conversationId: conversation._id.toString(),
            question: question.trim(),
            selectedDocumentIds: selectedDocumentIds || conversation.documentIds,
            settings,
            onToken: (token) => {
              assistantText += token;
              res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
            },
          });

          // Save final AI Message in background
          const aiMessage = await (MessageModel as any).create({
            conversationId: conversation._id,
            sender: 'assistant',
            text: ragResult.text,
            sources: ragResult.sources,
            metrics: ragResult.metrics,
          });

          // Update conversation updatedAt
          conversation.updatedAt = new Date();
          await conversation.save();

          res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
          res.end();
        } catch (ragError: any) {
          logger.error('RAG Streaming pipeline failed:', ragError);
          res.write(`data: ${JSON.stringify({ type: 'error', message: ragError.message || 'Gemini streaming request failed' })}\n\n`);
          res.end();
        }
      } else {
        // Non-streaming response
        const ragResult = await ChatController.performRAG({
          userId,
          conversationId: conversation._id.toString(),
          question: question.trim(),
          selectedDocumentIds: selectedDocumentIds || conversation.documentIds,
          settings,
        });

        // Save AI Message
        const aiMessage = await (MessageModel as any).create({
          conversationId: conversation._id,
          sender: 'assistant',
          text: ragResult.text,
          sources: ragResult.sources,
          metrics: ragResult.metrics,
        });

        // Update conversation updatedAt
        conversation.updatedAt = new Date();
        await conversation.save();

        res.status(200).json({
          success: true,
          data: {
            conversationId: conversation._id,
            userMessage,
            message: aiMessage,
          },
        });
      }
    } catch (error: any) {
      logger.error('Error in askQuestion endpoint:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/chat/regenerate
   * Regenerates the last answer in a conversation
   */
  static async regenerateAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { conversationId, stream = false } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await (ConversationModel as any).findOne({ _id: conversationId, userId });
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      // Find the last messages of the conversation
      const messages = await (MessageModel as any).find({ conversationId }).sort({ createdAt: 1 });
      if (messages.length === 0) {
        res.status(400).json({ success: false, message: 'No messages to regenerate' });
        return;
      }

      // Identify the last user message and clean up subsequent assistant messages
      let lastUserMessageIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          lastUserMessageIdx = i;
          break;
        }
      }

      if (lastUserMessageIdx === -1) {
        res.status(400).json({ success: false, message: 'No user question found to regenerate' });
        return;
      }

      const lastUserMessage = messages[lastUserMessageIdx];

      // Remove any assistant messages after this user message
      const idsToDelete = messages.slice(lastUserMessageIdx + 1).map((m) => m._id);
      if (idsToDelete.length > 0) {
        await (MessageModel as any).deleteMany({ _id: { $in: idsToDelete } });
      }

      // Retrieve chat settings
      const settings = {
        model: conversation.settings?.model || 'gemini-3.6-flash',
        temperature: conversation.settings?.temperature ?? 0.7,
        maxTokens: conversation.settings?.maxTokens ?? 2048,
        topP: conversation.settings?.topP ?? 0.95,
      };

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.write(`data: ${JSON.stringify({ type: 'init', conversationId: conversation._id })}\n\n`);

        let assistantText = '';
        try {
          const ragResult = await ChatController.performRAG({
            userId,
            conversationId: conversation._id.toString(),
            question: lastUserMessage.text,
            selectedDocumentIds: conversation.documentIds,
            settings,
            onToken: (token) => {
              assistantText += token;
              res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
            },
          });

          // Save final AI Message in background
          const aiMessage = await (MessageModel as any).create({
            conversationId: conversation._id,
            sender: 'assistant',
            text: ragResult.text,
            sources: ragResult.sources,
            metrics: ragResult.metrics,
          });

          conversation.updatedAt = new Date();
          await conversation.save();

          res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
          res.end();
        } catch (ragError: any) {
          logger.error('RAG Regeneration Streaming pipeline failed:', ragError);
          res.write(`data: ${JSON.stringify({ type: 'error', message: ragError.message || 'Gemini streaming request failed' })}\n\n`);
          res.end();
        }
      } else {
        const ragResult = await ChatController.performRAG({
          userId,
          conversationId: conversation._id.toString(),
          question: lastUserMessage.text,
          selectedDocumentIds: conversation.documentIds,
          settings,
        });

        // Save AI Message
        const aiMessage = await (MessageModel as any).create({
          conversationId: conversation._id,
          sender: 'assistant',
          text: ragResult.text,
          sources: ragResult.sources,
          metrics: ragResult.metrics,
        });

        conversation.updatedAt = new Date();
        await conversation.save();

        res.status(200).json({
          success: true,
          data: {
            conversationId: conversation._id,
            message: aiMessage,
          },
        });
      }
    } catch (error: any) {
      logger.error('Error regenerating answer:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
}

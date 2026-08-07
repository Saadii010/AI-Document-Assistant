import { DocumentModel } from '../models/document.model';
import { logger } from '../utils/logger';

export class MetadataService {
  /**
   * Simple heuristic to detect the main language of the text
   */
  static detectLanguage(text: string): string {
    if (!text || text.trim() === '') return 'en';
    
    const englishWords = /\b(the|and|of|to|in|is|you|that|it|he|was|for|on|are|as|with|his|they|I|at|be|this|have|from|or|one|had|by|word|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/gi;
    const spanishWords = /\b(el|la|los|las|un|una|unos|unas|y|de|en|que|es|un|con|por|para|como|su|sus|lo|al|del|se|este|esta|estos|estas|todo|todos|toda|todas|si|pero|no|mas|o|un|una|sobre|entre|cuando|donde|quien|cuyo|cuya|como|muy|bien|casa|tiempo|ano|anos|dia|dias|hacer|ver|ir|venir|decir|dar|saber|querer|poder|deber|tener|haber|ser|estar)\b/gi;
    const frenchWords = /\b(le|la|les|un|une|des|et|en|que|est|avec|pour|par|dans|sur|ce|cette|ces|tout|tous|toute|toutes|mais|ou|ne|pas|plus|si|comme|avec|sans|sous|dans|chez|vers|pour|avec|pourquoi|comment|quand|qui|que|quoi|quel|quelle|quels|quelles|faire|voir|aller|dire|donner|savoir|vouloir|pouvoir|devoir|avoir|etre)\b/gi;

    const lower = text.toLowerCase();
    const enCount = (lower.match(englishWords) || []).length;
    const esCount = (lower.match(spanishWords) || []).length;
    const frCount = (lower.match(frenchWords) || []).length;

    const max = Math.max(enCount, esCount, frCount);
    if (max === 0) return 'en'; // default fallback
    if (max === enCount) return 'en';
    if (max === esCount) return 'es';
    if (max === frCount) return 'fr';
    
    return 'en';
  }

  /**
   * Updates Document model with metadata computed during the pipeline.
   */
  static async updateDocumentMetadata(
    documentId: string,
    updateData: {
      totalPages?: number;
      extractedText?: string;
      chunkCount?: number;
      embeddingCount?: number;
      language?: string;
      processingTime?: number;
      status?: 'processing' | 'processed' | 'failed' | string;
    }
  ): Promise<void> {
    try {
      logger.info(`Updating metadata fields for document ${documentId}`);
      
      // Update standard fields and any custom fields (using Mongoose flat object structure)
      await (DocumentModel as any).findByIdAndUpdate(documentId, {
        $set: {
          ...(updateData.totalPages !== undefined && { totalPages: updateData.totalPages }),
          ...(updateData.extractedText !== undefined && { extractedText: updateData.extractedText }),
          ...(updateData.status !== undefined && { status: updateData.status }),
          // Add custom extra fields dynamically (will persist via Mongoose schema flex)
          chunkCount: updateData.chunkCount,
          embeddingCount: updateData.embeddingCount,
          language: updateData.language,
          processingTime: updateData.processingTime,
          lastModified: new Date(),
        }
      });

      logger.info(`Successfully updated document metadata for ${documentId}`);
    } catch (err: any) {
      logger.error(`Failed to update document metadata: ${err.message || err}`);
    }
  }
}
export default MetadataService;

import { Request, Response, NextFunction } from 'express';
import { ContactMessageModel as ContactMessageModelRaw } from '../models/contactMessage.model';
import { NewsletterSubscriberModel as NewsletterSubscriberModelRaw } from '../models/newsletterSubscriber.model';
import { TestimonialModel as TestimonialModelRaw } from '../models/testimonials.model';
import { FaqModel as FaqModelRaw } from '../models/faq.model';
import { PricingPlanModel as PricingPlanModelRaw } from '../models/pricingPlans.model';
import { logger } from '../utils/logger';

const ContactMessageModel: any = ContactMessageModelRaw;
const NewsletterSubscriberModel: any = NewsletterSubscriberModelRaw;
const TestimonialModel: any = TestimonialModelRaw;
const FaqModel: any = FaqModelRaw;
const PricingPlanModel: any = PricingPlanModelRaw;

// Default mock/fallback data for automatic seeding if DB is empty
const defaultFeatures = [
  {
    icon: 'Shield',
    title: 'Secure Authentication',
    description: 'Enterprise-grade user auth with JSON Web Tokens (JWT), HTTP-only cookies, and secure password hashing using bcrypt.',
  },
  {
    icon: 'FileUp',
    title: 'Document Upload',
    description: 'Upload PDFs, Word files (DOCX), or plain text. Handles multi-format extraction and custom layout parsing.',
  },
  {
    icon: 'Cpu',
    title: 'RAG Pipeline',
    description: 'Advanced Retrieval-Augmented Generation processes your files into contextual chunks for highly specialized AI answers.',
  },
  {
    icon: 'MessageSquare',
    title: 'Contextual AI Chat',
    description: 'Interact with Gemini AI trained directly on your private document corpus. Complete history and streaming support.',
  },
  {
    icon: 'Search',
    title: 'Semantic Search',
    description: 'Dense vector search powered by high-dimensional embeddings. Retrieve relevant answers even with partial conceptual matches.',
  },
  {
    icon: 'Bookmark',
    title: 'Source Citations',
    description: 'Transparent verification. Every AI response lists exact document sources, visual page highlights, and direct text quotes.',
  },
  {
    icon: 'FileText',
    title: 'PDF Viewer',
    description: 'In-app, highly responsive PDF reader showing side-by-side chat panels and highlight matches directly in context.',
  },
  {
    icon: 'ShieldAlert',
    title: 'Admin Dashboard',
    description: 'Detailed system health metrics, CPU/memory monitoring, activity streams, custom limits management, and user auditing.',
  },
  {
    icon: 'BarChart3',
    title: 'Advanced Analytics',
    description: 'Visual representations of query volumes, chunk distribution, average response latency, and system performance logs.',
  },
  {
    icon: 'Moon',
    title: 'Dark Mode Support',
    description: 'A beautifully calibrated premium user interface supporting both highly legible light mode and eye-safe deep twilight dark mode.',
  },
  {
    icon: 'Smartphone',
    title: 'Responsive Design',
    description: 'Perfect mobile and desktop fluid adaptability. Built from the ground up for tablets, notebooks, and ultrawide layouts.',
  },
];

const defaultPricingPlans = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Up to 3 documents total',
      'Max 10MB file size limit',
      '50 AI requests per month',
      'Standard vector embeddings',
      'Community email support',
    ],
    storage: '50 MB Storage',
    documents: '3 Documents Max',
    aiRequests: '50 Queries/mo',
    support: 'Email Support',
    popular: false,
  },
  {
    name: 'Pro',
    priceMonthly: 19,
    priceYearly: 15,
    features: [
      'Unlimited uploaded documents',
      'Max 100MB file size limit',
      'Unlimited AI chat queries',
      'High-priority semantic processing',
      'Advanced document page highlights',
      '24/7 dedicated priority support',
    ],
    storage: '10 GB Cloud Storage',
    documents: 'Unlimited Documents',
    aiRequests: 'Unlimited Queries',
    support: '24/7 Priority Support',
    popular: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 49,
    priceYearly: 39,
    features: [
      'Dedicated private database instance',
      'Custom chunking & embedding models',
      'SAML/SSO authentication pathways',
      'Custom rate limits & team management',
      'Dedicated customer success engineer',
      'SLA-backed uptime guarantees',
    ],
    storage: '1 TB Storage',
    documents: 'Unlimited Team Documents',
    aiRequests: 'Unlimited Queries (Custom LLM)',
    support: 'Dedicated Account Manager',
    popular: false,
  },
];

const defaultTestimonials = [
  {
    name: 'Sarah Jenkins',
    company: 'Stanford University Researcher',
    review: 'This knowledge assistant completely transformed how I review research papers. I can upload a 100-page document and instantly query references with full citations. The page highlights saved me hours.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'David Chen',
    company: 'Senior Software Architect',
    review: 'The RAG pipeline implementation is incredibly robust. I loaded our internal API docs and architectural blueprints, and the chat accuracy is stunning. The source citations make it fully trustworthy.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Elena Rostova',
    company: 'Corporate Legal Advisor',
    review: 'Having a private knowledge assistant that stays strictly grounded in our legal briefs is crucial. There are zero hallucination issues because every answer points to our exact paragraphs. Highly secure.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

const defaultFaqs = [
  {
    category: 'General',
    question: 'What is Retrieval-Augmented Generation (RAG)?',
    answer: 'RAG is an AI framework that retrieves relevant paragraphs and facts from your uploaded documents to construct highly accurate, context-grounded responses. This eliminates hallucination issues and ensures all answers are fully verified by actual sources.',
  },
  {
    category: 'Technical',
    question: 'Which file formats are supported?',
    answer: 'We support PDF, DOCX, and plain TXT files. The parser handles structured tables, layouts, and lists, converting them into clean text blocks for tokenization.',
  },
  {
    category: 'Security',
    question: 'How secure is my private data?',
    answer: 'Your data security is our absolute priority. Documents are encrypted at rest and in transit. Your content is never used to train public LLM models, and strict role-based access restricts access exclusively to you.',
  },
  {
    category: 'Security',
    question: 'Are there any data privacy concerns with AI models?',
    answer: 'None. We utilize enterprise API pathways with strict zero-retention policies. Your private enterprise corpus is completely isolated from other users.',
  },
  {
    category: 'Technical',
    question: 'Which AI models power the platform?',
    answer: 'Our advanced semantic pipeline uses Google Gemini models for deep text understanding, alongside highly optimized sentence embedding models for vector indexing.',
  },
  {
    category: 'General',
    question: 'What storage and file limits apply?',
    answer: 'Free accounts can store up to 3 documents (up to 10MB each). Pro accounts enjoy unlimited documents with up to 100MB file size limits and 10GB of storage.',
  },
  {
    category: 'Billing',
    question: 'How does the pricing toggle work?',
    answer: 'When you choose the Yearly subscription plan, you get up to 20% off. You can toggle between monthly and yearly billing anytime directly on the landing page.',
  },
];

// @desc    Submit a contact message
// @route   POST /api/contact
export async function submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'All fields (name, email, subject, message) are required.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (message.length < 10) {
      res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.',
      });
      return;
    }

    const newMessage = new ContactMessageModel({
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();

    logger.info(`Contact message received from ${name} (${email}): ${subject}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We have received your message and will get back to you shortly.',
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Subscribe to the newsletter
// @route   POST /api/newsletter
export async function subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriberModel.findOne({ email });
    if (existingSubscriber) {
      res.status(400).json({
        success: false,
        message: 'You are already subscribed to our newsletter!',
      });
      return;
    }

    const subscriber = new NewsletterSubscriberModel({ email });
    await subscriber.save();

    logger.info(`Newsletter subscription received for ${email}`);

    res.status(201).json({
      success: true,
      message: 'Awesome! You have been successfully subscribed to our weekly product newsletter.',
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get all platform features
// @route   GET /api/public/features
export async function getFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Features can be fetched from static array to preserve performance, or seeded
    res.status(200).json({
      success: true,
      data: defaultFeatures,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get pricing plans (with automatic DB seeding)
// @route   GET /api/public/pricing
export async function getPricingPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let plans = await PricingPlanModel.find().lean();
    
    if (!plans || plans.length === 0) {
      logger.info('Pricing plans DB empty. Seeding defaults...');
      await PricingPlanModel.insertMany(defaultPricingPlans);
      plans = await PricingPlanModel.find().lean();
    }

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get testimonials (with automatic DB seeding)
// @route   GET /api/public/testimonials
export async function getTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let testimonials = await TestimonialModel.find().lean();

    if (!testimonials || testimonials.length === 0) {
      logger.info('Testimonials DB empty. Seeding defaults...');
      await TestimonialModel.insertMany(defaultTestimonials);
      testimonials = await TestimonialModel.find().lean();
    }

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get FAQ items (with automatic DB seeding)
// @route   GET /api/public/faq
export async function getFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let faqs = await FaqModel.find().lean();

    if (!faqs || faqs.length === 0) {
      logger.info('FAQs DB empty. Seeding defaults...');
      await FaqModel.insertMany(defaultFaqs);
      faqs = await FaqModel.find().lean();
    }

    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
}

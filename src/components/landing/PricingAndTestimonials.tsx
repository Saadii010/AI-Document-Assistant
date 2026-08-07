import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Star,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Moon,
  Database,
  Search,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Fallback pricing plans
const defaultPlans = [
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

// Fallback testimonials
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

// Fallback FAQ data
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

export const PricingAndTestimonials: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [pricingPlans, setPricingPlans] = useState<any[]>(defaultPlans);
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);
  const [faqs, setFaqs] = useState<any[]>(defaultFaqs);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Fetch Public Data
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const pricingRes = await fetch('/api/public/pricing');
        if (pricingRes.ok) {
          const json = await pricingRes.json();
          if (json.success && json.data?.length > 0) setPricingPlans(json.data);
        }

        const testimonialRes = await fetch('/api/public/testimonials');
        if (testimonialRes.ok) {
          const json = await testimonialRes.json();
          if (json.success && json.data?.length > 0) setTestimonials(json.data);
        }

        const faqRes = await fetch('/api/public/faq');
        if (faqRes.ok) {
          const json = await faqRes.json();
          if (json.success && json.data?.length > 0) setFaqs(json.data);
        }
      } catch (err) {
        // Suppress and fail silently to guarantee optimal client experience with seeded fallbacks
        console.warn('Backend public APIs currently sleeping. Loading fast local seeds.');
      }
    };
    fetchPublicData();
  }, []);

  const handleToggleBilling = () => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'));
    toast.success(`Switched to ${billingCycle === 'monthly' ? 'Annual (20% off)' : 'Monthly'} billing.`);
  };

  const handleNextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="flex flex-col gap-28 md:gap-36">
      
      {/* 1. PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Flexible Licensing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Uncomplicated Pricing Plans
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-6">
            Get started absolutely free, then scale up as your documentation corpus expands.
          </p>

          {/* Pricing Toggle Button */}
          <div className="flex items-center justify-center gap-3 select-none">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
              Monthly
            </span>
            <button
              onClick={handleToggleBilling}
              className="w-12 h-6.5 rounded-full bg-zinc-200 dark:bg-zinc-800 p-1 relative flex items-center transition-all"
              aria-label="Toggle billing interval"
            >
              <motion.div
                className="w-4.5 h-4.5 rounded-full bg-indigo-500 shadow-sm"
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  marginLeft: billingCycle === 'yearly' ? 'auto' : '0px',
                }}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-indigo-500' : 'text-zinc-400'}`}>
              Yearly <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[9px] font-extrabold uppercase">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => {
            const currentPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-7.5 rounded-2xl border flex flex-col justify-between relative transition-all ${
                  plan.popular
                    ? 'border-indigo-500 bg-white dark:bg-zinc-900 shadow-2xl ring-2 ring-indigo-500/20'
                    : 'border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" /> MOST POPULAR
                  </span>
                )}

                {/* Plan Header */}
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-1.5">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                      ${currentPrice}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold mb-6">
                    {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                  </p>

                  <div className="h-[1px] bg-zinc-200/50 dark:bg-zinc-800/50 my-5" />

                  {/* Bullet features */}
                  <div className="flex flex-col gap-3.5 mb-8">
                    {plan.features.map((feat: string) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan CTA */}
                <button
                  onClick={() => toast.success(`Getting started with ${plan.name}!`)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    plan.popular
                      ? 'bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200'
                      : 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {plan.priceMonthly === 0 ? 'Start Free' : 'Upgrade Now'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. TESTIMONIALS CAROUSEL */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Validated Satisfaction
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            What Our Users Are Saying
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Grounded outcomes verified by experts, software teams, and medical advisors globally.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-3xl mx-auto relative px-4 sm:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 sm:p-10 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 text-center flex flex-col items-center gap-5 shadow-sm"
            >
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 select-none">
                {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium italic leading-relaxed">
                "{testimonials[testimonialIdx].review}"
              </p>

              {/* User Avatar & Identification */}
              <div className="flex items-center gap-3.5 mt-2">
                <img
                  src={testimonials[testimonialIdx].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                  alt={testimonials[testimonialIdx].name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border-2 border-zinc-200/50 dark:border-zinc-800/50"
                />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {testimonials[testimonialIdx].name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {testimonials[testimonialIdx].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left/Right Control arrows */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={handlePrevTestimonial}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 transition-all"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <div className="flex gap-1">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === testimonialIdx ? 'w-5 bg-indigo-500' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNextTestimonial}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 transition-all"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Common Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Clear, transparent answers concerning our secure semantic index mechanisms.
          </p>
        </div>

        {/* FAQs Accordion Grid */}
        <div className="flex flex-col gap-3.5 select-none">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIdx === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 overflow-hidden transition-colors"
              >
                {/* Trigger Row */}
                <button
                  onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                  className="w-full py-5 px-6.5 flex items-center justify-between text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>

                {/* Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6.5 pb-5.5 pt-1 text-xs sm:text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
export default PricingAndTestimonials;

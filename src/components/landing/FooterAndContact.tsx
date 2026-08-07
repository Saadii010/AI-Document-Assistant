import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ShieldAlert,
  Moon,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FooterAndContact: React.FC = () => {
  // Contact Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  // Handle Contact Form Submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error('All contact fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (message.length < 10) {
      toast.error('Your message must contain at least 10 characters.');
      return;
    }

    setIsSubmittingContact(true);
    const toastId = toast.loading('Submitting message...');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Thank you! We will get back to you shortly.', { id: toastId });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to submit contact message.', { id: toastId });
      }
    } catch (err) {
      toast.error('Network connection error. Please try again.', { id: toastId });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle Newsletter Submit
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail) {
      toast.error('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmittingNewsletter(true);
    const toastId = toast.loading('Subscribing...');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Subscribed successfully!', { id: toastId });
        setNewsletterEmail('');
      } else {
        toast.error(data.message || 'Newsletter signup failed.', { id: toastId });
      }
    } catch (err) {
      toast.error('Network connection error. Please try again.', { id: toastId });
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-28 md:gap-36">
      
      {/* 1. CALL TO ACTION & NEWSLETTER CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-center py-16 px-6 sm:px-12 select-none shadow-2xl">
          {/* Decorative background glow elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="max-w-3xl mx-auto flex flex-col gap-6 items-center relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Start Uploading Today
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Unlock Absolute Clarity Across <br />
              Your Document Repositories.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
              Zero credit card required. Seed 3 documents for free, explore semantic citations, and chat with an accurate personal database instantly.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto justify-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6.5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-md"
              >
                Start Free Account
              </Link>
              <a
                href="#showcase"
                onClick={(e) => handleSmoothScroll(e, '#showcase')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6.5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
              >
                View Live Demo
              </a>
            </div>

            {/* Newsletter Input */}
            <div className="h-[1px] w-full bg-zinc-800/80 my-6 max-w-lg" />
            
            <div className="flex flex-col gap-3.5 items-center w-full max-w-md">
              <p className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Subscribe to our product newsletters
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4.5 py-3 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors font-semibold"
                  aria-label="Newsletter email address"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNewsletter}
                  className="px-6.5 py-3 rounded-xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTACT US FORM */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* Info Card (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-7.5 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/30">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                Contact Office
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
                Let's Start a Conversation.
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                Have custom compliance inquiries? Need a private on-premise relational database or high-volume indexing keys? Reach out directly.
              </p>
            </div>

            <div className="flex flex-col gap-5.5 my-8">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase">Support Email</h4>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">support@knowledge-ai.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase">Headquarters</h4>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">San Francisco, California, USA</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase">Business Desk</h4>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">+1 (415) 555-0142</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 font-mono select-none">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" /> Fully SOC2 Type II Certified Workspace.
            </p>
          </div>

          {/* Form Card (Right) */}
          <div className="lg:col-span-7 p-7.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <h3 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-6">Send an Inquiry</h3>
            
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-5.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className="font-bold text-zinc-500 dark:text-zinc-400">Your Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Sarah Jenkins"
                    className="px-4.5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-email" className="font-bold text-zinc-500 dark:text-zinc-400">Your Business Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. sarah@stanford.edu"
                    className="px-4.5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-subject" className="font-bold text-zinc-500 dark:text-zinc-400">Subject / Category</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g. Relational database compliance questions"
                  className="px-4.5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="font-bold text-zinc-500 dark:text-zinc-400">Inquiry Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Detail your requirements (minimum 10 characters)..."
                  className="px-4.5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full mt-2 py-4 px-6 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 hover:bg-zinc-800 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm"
              >
                Send Message Inquiry <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-16 text-xs transition-colors select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo column */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <a
              href="#home"
              onClick={(e) => handleSmoothScroll(e, '#home')}
              className="flex items-center gap-2.5 group w-fit"
            >
              <div className="p-2 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-sm">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <span className="font-extrabold tracking-tight text-lg">KnowledgeAI</span>
            </a>
            <p className="text-zinc-400 max-w-sm leading-relaxed font-semibold">
              Advanced context-driven information parsing engines providing fully cited, secure answers for academics, legal staff, and SaaS teams worldwide.
            </p>
            <div className="flex items-center gap-4.5 text-zinc-400 mt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="GitHub Page">
                <Github className="w-4.5 h-4.5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="Twitter Feed">
                <Twitter className="w-4.5 h-4.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="LinkedIn Profile">
                <Linkedin className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-3.5">
              <h4 className="font-extrabold text-zinc-800 dark:text-zinc-150 uppercase tracking-widest text-[10px]">Site Navigation</h4>
              <a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Home Landing</a>
              <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Core Features</a>
              <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">How It Works</a>
              <a href="#showcase" onClick={(e) => handleSmoothScroll(e, '#showcase')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Product Showcase</a>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="font-extrabold text-zinc-800 dark:text-zinc-150 uppercase tracking-widest text-[10px]">Pricing & Trust</h4>
              <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Plans & Pricing</a>
              <a href="#testimonials" onClick={(e) => handleSmoothScroll(e, '#testimonials')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">User Reviews</a>
              <a href="#faq" onClick={(e) => handleSmoothScroll(e, '#faq')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Frequently Asked</a>
              <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Contact Desk</a>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="font-extrabold text-zinc-800 dark:text-zinc-150 uppercase tracking-widest text-[10px]">Legal Safeguards</h4>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Privacy Policy</a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Terms of Service</a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">GDPR Isolation</a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold">Compliance Details</a>
            </div>
          </div>

        </div>

        {/* Divider / Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400">
          <span className="font-bold">
            KnowledgeAI © {new Date().getFullYear()} — Fully Responsive Marketing Platform. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Grounded context, zero hallucination.
          </span>
        </div>
      </footer>

    </div>
  );
};
export default FooterAndContact;

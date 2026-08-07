import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustedBy from '../components/landing/TrustedBy';
import FeaturesAndDetails from '../components/landing/FeaturesAndDetails';
import ProductShowcase from '../components/landing/ProductShowcase';
import PricingAndTestimonials from '../components/landing/PricingAndTestimonials';
import FooterAndContact from '../components/landing/FooterAndContact';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Sticky Glassmorphic Header */}
      <Navbar />

      {/* Main Page Layout Flows */}
      <main className="flex flex-col gap-28 md:gap-36 pb-12 overflow-hidden">
        {/* Interactive Hero & Upload/Chat Playground */}
        <HeroSection />

        {/* Corporate Trust Logos */}
        <TrustedBy />

        {/* Features Grid, Chronological Steps, RAG Schema, Bento Highlights, & Tabbed Use Cases */}
        <FeaturesAndDetails />

        {/* Metric Screens Showcase Tabs */}
        <ProductShowcase />

        {/* Interactive Pricing Billing Toggle, Feedback Reviews Carousel, & FAQ Accordions */}
        <PricingAndTestimonials />

        {/* Conversion CTA, Newsletter Subscribe Form, contact inquiries, & structured footer map */}
        <FooterAndContact />
      </main>
    </div>
  );
};

export default LandingPage;

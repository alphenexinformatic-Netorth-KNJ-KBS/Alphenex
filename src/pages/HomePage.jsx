import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';

/*
 * PERFORMANCE STRATEGY:
 * - Hero renders immediately (no Three.js, no framer-motion)
 * - Everything else is lazy-loaded with IntersectionObserver gates
 * - Three.js (FunnelScene) only loads when scrolled near it
 * - framer-motion only loads when below-fold sections are near viewport
 */

// All below-fold components are lazy — they split into separate JS chunks
const Services    = lazy(() => import('@/components/Services'));
const FunnelScene = lazy(() => import('@/components/FunnelScene'));
const About       = lazy(() => import('@/components/About'));
const Portfolio   = lazy(() => import('@/components/Portfolio'));
const Testimonials = lazy(() => import('@/components/Testimonials'));

// Loading placeholder — minimal, matches dark theme
function SectionLoader({ height = 'py-24' }) {
  return (
    <div className={`${height} bg-gradient-to-b from-[#020c1b] to-[#051628] flex items-center justify-center`}>
      <div className="w-12 h-12 border-4 border-[#0992C2] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * A section that only mounts its children when the placeholder div
 * enters the viewport (+ rootMargin). This ensures lazy components
 * are NOT fetched until the user actually scrolls near them.
 */
function LazySection({ children, fallback, rootMargin = '300px', minHeight }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={minHeight ? { minHeight } : undefined}>
      {visible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Alphenex Informatic",
    "url": "https://alphenex.com",
    "logo": "https://alphenex.com/logo.png",
    "sameAs": [
      "https://www.facebook.com/alphenex",
      "https://www.instagram.com/alphenex",
      "https://www.linkedin.com/company/alphenex"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@alphenex.com",
      "contactType": "customer service"
    }
  };

  return (
    <>
      <Helmet>
        <title>Alphenex Informatic - Strategic Social Media Marketing Agency</title>
        <meta
          name="description"
          content="Alphenex Informatic delivers data-driven social media marketing campaigns, strategy, and content creation to drive engagement and growth for your brand."
        />
        <meta name="keywords" content="social media marketing, digital marketing agency, content strategy, brand growth, social media management" />
        <link rel="canonical" href="https://alphenex.com/" />
        <meta property="og:title" content="Alphenex Informatic - Strategic Social Media Marketing Agency" />
        <meta property="og:description" content="Data-driven strategies for tangible business growth." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alphenex.com/" />
        <meta property="og:image" content="https://alphenex.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>
        {/* Hero renders immediately — Canvas 2D bg, no Three.js, no framer-motion */}
        <Hero />

        {/* Services loads when user scrolls past hero */}
        <LazySection
          fallback={<SectionLoader />}
          rootMargin="50px"
          minHeight="600px"
        >
          <Services />
        </LazySection>

        {/* FunnelScene (Three.js) — only loads when scrolled near it */}
        <LazySection
          fallback={<SectionLoader />}
          rootMargin="50px"
          minHeight="600px"
        >
          <FunnelScene />
        </LazySection>

        {/* About — lazy with framer-motion, only loads on scroll */}
        <LazySection
          fallback={<SectionLoader />}
          rootMargin="50px"
          minHeight="400px"
        >
          <About />
        </LazySection>

        {/* Portfolio — lazy */}
        <LazySection
          fallback={<SectionLoader />}
          rootMargin="50px"
          minHeight="400px"
        >
          <Portfolio />
        </LazySection>

        {/* Testimonials — lazy */}
        <LazySection
          fallback={<SectionLoader />}
          rootMargin="50px"
          minHeight="400px"
        >
          <Testimonials />
        </LazySection>

        {/* Contact/CTA Section */}
        <div id="contact-section" className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #020c1b 0%, #051628 50%, #020c1b 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(9,146,194,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(9,146,194,0.4) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(9,146,194,0.15) 0%, transparent 65%)' }}
          />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <span className="text-[#09c4f0] font-semibold tracking-wider uppercase text-sm mb-4 block">
              Ready to Scale?
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Get{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0992C2] to-[#09c4f0]">
                Started?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Contact us today and let's discuss how we can elevate your social media presence and grow your business.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 font-semibold text-xl px-10 py-5 rounded-full text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #0992C2, #09c4f0)',
                boxShadow: '0 8px 40px rgba(9,146,194,0.45)',
              }}
            >
              Contact Us Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
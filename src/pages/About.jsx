import React, { Suspense, Component, lazy } from 'react';
import { Helmet } from 'react-helmet';
import About from '@/components/About';
import { motion } from 'framer-motion';

// Lazy-load Three.js 3D background — only fetches when About page is visited
const About3DBackground = lazy(() => import('@/components/About3DBackground'));

class AboutErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("About 3D Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />
      );
    }
    return this.props.children;
  }
}

function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Alphenex Informatic",
      "description": "A leading social media marketing agency helping brands grow their online presence.",
      "foundingDate": "2020",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@alphenex.com",
        "contactType": "customer support"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>About Us - Alphenex Informatic | Expert Social Media Team</title>
        <meta
          name="description"
          content="Learn about Alphenex Informatic's mission to empower brands through innovative social media strategies. Meet the team driving digital success."
        />
        <meta name="keywords" content="about alphenex, marketing agency team, company mission, social media experts" />
        <link rel="canonical" href="https://alphenex.com/about" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>
        {/* Page Header with 3D Background */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <AboutErrorBoundary>
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
              <About3DBackground />
            </Suspense>
          </AboutErrorBoundary>

          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#020c1b] via-[#020c1b]/50 to-transparent pointer-events-none" />

          <div className="container relative z-10 px-4 text-center mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] to-[#0992C2]">Story</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            >
              Building communities and driving growth through data-driven strategies and creative excellence.
            </motion.p>
          </div>
        </section>

        <About />
      </div>
    </>
  );
}

export default AboutPage;
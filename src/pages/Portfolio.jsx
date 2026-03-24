import React, { Suspense, Component, lazy } from 'react';
import { Helmet } from 'react-helmet';
import Portfolio from '@/components/Portfolio';
import { motion } from 'framer-motion';

// Lazy-load Three.js 3D background — only fetches when Portfolio page is visited
const Portfolio3DBackground = lazy(() => import('@/components/Portfolio3DBackground'));

class PortfolioErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Portfolio 3D Error:", error, errorInfo);
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

function PortfolioPage() {
  return (
    <>
      <Helmet>
        <title>Portfolio - Success Stories & Case Studies | Alphenex Informatic</title>
        <meta
          name="description"
          content="Explore Alphenex Informatic's portfolio of successful social media marketing campaigns and see real results from our data-driven strategies."
        />
        <meta name="keywords" content="marketing portfolio, case studies, success stories, campaign results, social media examples" />
        <link rel="canonical" href="https://alphenex.com/portfolio" />
        <meta property="og:title" content="Portfolio - Success Stories | Alphenex Informatic" />
        <meta property="og:description" content="Real results for real brands. Check out our latest work." />
        <meta property="og:url" content="https://alphenex.com/portfolio" />
      </Helmet>

      <div>
        {/* Page Header with 3D Background */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <PortfolioErrorBoundary>
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
              <Portfolio3DBackground />
            </Suspense>
          </PortfolioErrorBoundary>

          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#051628] via-[#020c1b]/50 to-transparent pointer-events-none" />

          <div className="container relative z-10 px-4 text-center mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] to-[#0992C2]">Portfolio</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            >
              Discover how we've helped ambitious brands scale through strategic social media marketing.
            </motion.p>
          </div>
        </section>

        <Portfolio />
      </div>
    </>
  );
}

export default PortfolioPage;
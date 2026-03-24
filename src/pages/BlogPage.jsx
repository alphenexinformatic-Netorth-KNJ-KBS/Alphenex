import React, { Suspense, Component, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import BlogCard from '@/components/BlogCard';
import { blogPosts } from '@/data/blogData';

// Lazy-load Three.js 3D background — only fetches when Blog page is visited
const Blog3DBackground = lazy(() => import('@/components/Blog3DBackground'));

class BlogErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Blog 3D Error:", error, errorInfo);
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

function BlogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Alphenex Informatic Blog",
    "description": "Insights, strategies, and trends in social media marketing.",
    "publisher": {
      "@type": "Organization",
      "name": "Alphenex Informatic",
      "logo": {
        "@type": "ImageObject",
        "url": "https://alphenex.com/logo.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "url": `https://alphenex.com/blog/${post.id}`
    }))
  };

  return (
    <>
      <Helmet>
        <title>Blog - Social Media Marketing Insights | Alphenex Informatic</title>
        <meta
          name="description"
          content="Stay ahead of the curve with our latest insights on social media trends, marketing strategies, and digital growth hacks."
        />
        <meta name="keywords" content="social media blog, marketing tips, digital strategy, content creation guide, social media trends 2026" />
        <link rel="canonical" href="https://alphenex.com/blog" />
        <meta property="og:title" content="Blog - Social Media Marketing Insights | Alphenex Informatic" />
        <meta property="og:description" content="Expert insights and strategies to elevate your brand's social media presence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alphenex.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>
        {/* Page Header with 3D Background */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <BlogErrorBoundary>
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
              <Blog3DBackground />
            </Suspense>
          </BlogErrorBoundary>

          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#020c1b] via-[#020c1b]/50 to-transparent pointer-events-none" />

          <div className="container relative z-10 px-4 text-center mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] to-[#0992C2]">Blog</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            >
              Expert articles, industry updates, and strategic guides to help you master the digital landscape.
            </motion.p>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-[#020c1b] to-[#051628] relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-[#4dc8f0] font-semibold tracking-wider uppercase text-sm mb-2 block">
                Latest Articles
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Insights & News
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default BlogPage;
import React, { useEffect, Suspense, Component } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ChevronLeft, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/blogData';
import Blog3DBackground from '@/components/Blog3DBackground';

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

function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen pt-32 text-center px-6 bg-[#020c1b]">
        <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-gray-400 mb-8">The article you are looking for doesn't exist or has been moved.</p>
        <button 
          onClick={() => navigate('/blog')}
          className="text-[#4dc8f0] hover:text-[#0992C2] hover:underline font-medium transition-colors"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  // Get related posts (exclude current)
  const relatedPosts = blogPosts
    .filter(p => p.id !== id)
    .slice(0, 2);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.image],
    "datePublished": post.date, // Note: In real app, use ISO format
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Alphenex Informatic",
      "logo": {
        "@type": "ImageObject",
        "url": "https://alphenex.com/logo.png"
      }
    },
    "description": post.excerpt
  };

  return (
    <>
      <Helmet>
        <title>{post.title} - Alphenex Informatic Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author} />
        <link rel="canonical" href={`https://alphenex.com/blog/${post.id}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={`https://alphenex.com/blog/${post.id}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <article className="min-h-screen bg-[#020c1b] relative overflow-hidden">
        {/* Hero Section with 3D Background */}
        <div className="w-full relative min-h-[60vh] flex flex-col justify-end pb-12 overflow-hidden border-b border-white/10">
           <div className="absolute inset-0 z-0">
             <BlogErrorBoundary>
               <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
                 <Blog3DBackground />
               </Suspense>
             </BlogErrorBoundary>
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-t from-[#020c1b] via-[#020c1b]/80 to-transparent z-[1]" />
           <div className="absolute inset-0 bg-black/40 z-[1]" /> {/* Dark overlay for readability */}

           <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto w-full mt-32">
             <Link to="/blog" className="inline-flex items-center text-[#4dc8f0] hover:text-white mb-6 transition-colors drop-shadow-md">
               <ChevronLeft size={20} className="mr-1" /> Back to Blog
             </Link>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight drop-shadow-lg">
               {post.title}
             </h1>
             <div className="flex flex-wrap items-center text-gray-300 gap-4 md:gap-8 text-sm md:text-base font-medium">
               <div className="flex items-center backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                 <User size={18} className="mr-2 text-[#4dc8f0]" />
                 {post.author}
               </div>
               <div className="flex items-center backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                 <Calendar size={18} className="mr-2 text-[#4dc8f0]" />
                 {post.date}
               </div>
               <div className="flex items-center backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                 <Clock size={18} className="mr-2 text-[#4dc8f0]" />
                 {post.readTime}
               </div>
               <span className="bg-[#0992C2]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(9,146,194,0.4)] border border-white/20">
                  {post.category}
               </span>
             </div>
           </div>
        </div>

        <div className="bg-gradient-to-b from-[#020c1b] to-[#051628] relative">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 relative z-10">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Post image as header inside content */}
              <div className="w-full h-[300px] md:h-[400px] relative mb-12 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(9,146,194,0.1)] border border-white/10">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#4dc8f0] hover:prose-a:text-white prose-a:transition-colors prose-strong:text-white prose-li:text-gray-300 bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="mt-12 pt-8 border-t border-white/10 max-w-3xl mx-auto">
                 <h3 className="text-2xl font-bold text-white mb-6">Share this article</h3>
                 <div className="flex gap-4">
                   <button className="px-6 py-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-[#1877F2] border border-[#1877F2]/50 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm hover:shadow-[0_0_15px_rgba(24,119,242,0.3)]">Facebook</button>
                   <button className="px-6 py-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 text-[#1DA1F2] border border-[#1DA1F2]/50 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm hover:shadow-[0_0_15px_rgba(29,161,242,0.3)]">Twitter</button>
                   <button className="px-6 py-2.5 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/40 text-[#0A66C2] border border-[#0A66C2]/50 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm hover:shadow-[0_0_15px_rgba(10,102,194,0.3)]">LinkedIn</button>
                 </div>
              </div>
            </div>

            {/* Sidebar / Related Posts */}
            <aside className="lg:col-span-4 space-y-8">
               <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-[0_0_30px_rgba(9,146,194,0.05)]">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-8 h-1 bg-[#4dc8f0] rounded-full mr-3"></span>
                    Related Articles
                  </h3>
                  <div className="space-y-8">
                    {relatedPosts.map(related => (
                      <div key={related.id} className="group cursor-pointer">
                         <Link to={`/blog/${related.id}`} className="block mb-4 overflow-hidden rounded-xl aspect-[16/9] border border-white/10 relative">
                           <div className="absolute inset-0 bg-[#051628]/40 group-hover:bg-[#051628]/10 transition-colors z-10" />
                           <img 
                             src={related.image} 
                             alt={related.title} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
                           />
                         </Link>
                         <div className="text-xs text-[#4dc8f0] mb-2 font-medium tracking-wide uppercase">{related.date}</div>
                         <Link to={`/blog/${related.id}`}>
                           <h4 className="font-bold text-white group-hover:text-[#4dc8f0] transition-colors line-clamp-2 leading-snug">
                             {related.title}
                           </h4>
                         </Link>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <Link to="/blog" className="flex items-center text-[#4dc8f0] font-semibold text-sm hover:text-white transition-colors group">
                      <span className="group-hover:translate-x-1 transition-transform inline-block">View All Articles</span> 
                      <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-[#0992C2]/20 to-[#0773A0]/20 backdrop-blur-md rounded-3xl p-8 text-center border border-[#0992C2]/30 relative overflow-hidden shadow-[0_0_30px_rgba(9,146,194,0.15)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3">Need Marketing Help?</h3>
                    <p className="text-gray-300 mb-8 text-sm leading-relaxed">Our expert team can help you implement these strategies.</p>
                    <Link 
                      to="/contact"
                      className="block w-full bg-[#0992C2] text-white font-bold py-4 rounded-xl hover:bg-[#4dc8f0] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(9,146,194,0.4)] border border-white/10"
                    >
                      Contact Us
                    </Link>
                  </div>
               </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}

export default BlogDetailPage;
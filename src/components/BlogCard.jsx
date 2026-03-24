import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

function BlogCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(9,146,194,0.1)] hover:shadow-[0_0_40px_rgba(9,146,194,0.2)] transition-all duration-300 overflow-hidden flex flex-col h-full border border-white/10 group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <Link to={`/blog/${post.id}`} className="block relative overflow-hidden aspect-video border-b border-white/10">
        <div className="absolute inset-0 bg-[#051628]/40 group-hover:bg-[#051628]/20 transition-colors z-10" />
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 grayscale-[30%] group-hover:grayscale-0"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-[#0992C2]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(9,146,194,0.5)] border border-white/20">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-center text-xs text-gray-400 mb-4 space-x-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 text-[#4dc8f0]" />
            {post.date}
          </div>
          <div className="flex items-center">
            <User size={14} className="mr-1.5 text-[#4dc8f0]" />
            {post.author}
          </div>
        </div>

        <Link to={`/blog/${post.id}`} className="block mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-[#4dc8f0] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
          {post.excerpt}
        </p>

        <div className="pt-5 border-t border-white/10 mt-auto flex items-center justify-between">
          <Link 
            to={`/blog/${post.id}`}
            className="inline-flex items-center text-[#4dc8f0] text-sm font-semibold group-hover:text-white transition-colors"
          >
            Read Article <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default BlogCard;
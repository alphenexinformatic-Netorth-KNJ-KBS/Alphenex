import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Eye, Users, CheckCircle, Award, Target, Zap } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Brands Scaled', icon: Users },
  { value: '$50M+', label: 'Ad Spend Managed', icon: TrendingUp },
  { value: '3x–10x', label: 'Average Client ROI', icon: Award },
  { value: '4 Years', label: 'In Business', icon: Target },
];

const values = [
  // ... (keep as is)
];

const whyChooseUs = [
  'Dedicated account manager for every client',
  'No long-term lock-in contracts — we earn your trust monthly',
  'Campaigns built from scratch — no cookie-cutter templates',
  'Creative team + media buyers under one roof',
  'Global market expertise',
  'Transparent billing — no hidden fees or markups on ad spend',
];

function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-[#020c1b] to-[#051628] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-[#0992C2]/10 border border-[#0992C2]/20 text-[#4dc8f0] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#09c4f0] rounded-full animate-pulse" />
            About Us
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            The World's Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] via-[#0992C2] to-[#09c4f0]">Performance-Driven</span> SMMA
          </h2>
          <p className="font-sans text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            We started Alphenex Informatic with one simple goal: help global businesses grow profitably using paid advertising and digital marketing — no fluff, no vanity metrics, just real revenue.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center rounded-3xl p-8 relative overflow-hidden group border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-colors hover:bg-white/[0.04] hover:border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0992C2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0992C2]/20 to-[#09c4f0]/5 flex items-center justify-center border border-[#09c4f0]/20 mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="text-[#09c4f0]" size={28} />
                </div>
                <div className="font-heading text-4xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="font-sans text-xs text-gray-400 uppercase tracking-widest font-semibold">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Main story grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              We Don't Just Run Ads — We Build Growth Engines
            </h3>
            <p className="font-sans text-lg text-gray-300 mb-6 leading-relaxed font-light">
              Founded by a team of performance marketers and creative strategists, Alphenex Informatic has helped 500+ businesses — from D2C brands to local service providers — generate consistent, scalable leads and revenue using Google Ads, Meta Ads, and complete sales funnels.
            </p>
            <p className="font-sans text-lg text-gray-300 mb-10 leading-relaxed font-light">
              We've managed over $50 million in ad spend across industries — real estate, education, healthcare, e-commerce, SaaS, and professional services. Our clients don't just get campaigns — they get a complete growth system that works while they sleep.
            </p>
            
            <div className="bg-gradient-to-r from-[#0992C2]/10 to-transparent backdrop-blur-md rounded-2xl p-8 mb-10 border-l-4 border-[#09c4f0] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
              <h4 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Target size={20} className="text-[#09c4f0]" /> Our Promise
              </h4>
              <p className="font-sans text-gray-300 font-light leading-relaxed">
                If we can't show you a clear path to positive ROI within the first 90 days, we'll keep working until we do — at no extra charge. Your growth is our reputation.
              </p>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(9,146,194,0.1)]">
                      <Icon className="text-[#4dc8f0]" size={22} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-white mb-1.5">{value.title}</h4>
                      <p className="font-sans text-sm text-gray-400 leading-relaxed font-light">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(9,146,194,0.2)] border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#020c1b]/80 via-[#0992C2]/20 to-transparent mix-blend-overlay z-10 group-hover:opacity-40 transition-opacity duration-700"></div>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800"
                alt="Alphenex Informatic team working on digital marketing campaigns"
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#0992C2]/20 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#4dc8f0]/15 rounded-full blur-[60px] -z-10"></div>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#0992C2]/5 to-transparent pointer-events-none" />
          <div className="text-center mb-12 relative z-10">
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Why Smart Businesses Choose Alphenex</h3>
            <p className="font-sans text-gray-400 text-lg font-light">Not all agencies are equal. Here's what makes us different:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/[0.01] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.03] transition-colors">
                <CheckCircle className="text-[#09c4f0] flex-shrink-0 mt-0.5" size={22} />
                <span className="font-sans text-gray-300 font-light text-base">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
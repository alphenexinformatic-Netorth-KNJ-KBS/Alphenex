import React from 'react';
import { ArrowRight, TrendingUp, Users, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Hero3DBackground from '@/components/Hero3DBackground';

/*
 * All framer-motion removed from Hero.
 * Replaced with pure CSS @keyframes animations defined in index.css.
 * This removes framer-motion (121KB) from the critical-path bundle.
 */

const stats = [
  { icon: TrendingUp, value: '300%', label: 'Avg. ROI Growth' },
  { icon: Users, value: '500+', label: 'Clients Served' },
  { icon: BarChart, value: '10M+', label: 'Ad Impressions' },
];

function Hero() {
  const navigate = useNavigate();

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <Hero3DBackground />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(90deg, rgba(2,12,27,0.92) 0%, rgba(2,12,27,0.75) 45%, rgba(2,12,27,0.1) 100%)' }}
      />
      <div className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to top, rgba(2,12,27,0.95) 0%, transparent 40%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 pb-24">
        <div className="max-w-3xl">

          {/* Badge — Premium Glassmorphism */}
          <div className="mb-8 hero-animate-1">
            <span className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md text-[#4dc8f0] text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(9,146,194,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#09c4f0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#09c4f0]"></span>
              </span>
              #1 SMMA — India's Fastest Growing Agency
            </span>
          </div>

          {/* Headline — using font-heading (Outfit) */}
          <h1 className="font-heading text-6xl md:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight hero-animate-2">
            Elevate Your Brand with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] via-[#0992C2] to-[#09c4f0] drop-shadow-lg">
              Strategic Social Media
            </span>
          </h1>

          {/* Subheading */}
          <p className="font-sans text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed hero-animate-3 max-w-2xl font-light">
            Data-driven Google &amp; Facebook ad campaigns that drive real engagement,
            fill your funnel, and convert cold audiences into loyal clients — with measurable ROI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 mb-20 hero-animate-4">
            <Button
              onClick={scrollToContact}
              size="lg"
              className="text-white font-semibold text-lg px-10 py-7 rounded-full transition-all duration-300 transform hover:-translate-y-1 relative group overflow-hidden border-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0992C2] via-[#09c4f0] to-[#0992C2] bg-[length:200%_auto] animate-gradient" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(9,196,240,0.6)]" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Today
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </Button>

            <Button
              onClick={() => navigate('/portfolio')}
              variant="default"
              size="lg"
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md font-medium text-lg px-10 py-7 rounded-full transition-all duration-300"
            >
              View Our Work
            </Button>
          </div>

          {/* Stats — Sleek Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 hero-animate-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i}
                  className="flex items-center gap-4 rounded-2xl py-5 px-6 relative overflow-hidden group border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-colors hover:bg-white/[0.04] hover:border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0992C2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-12 h-12 rounded-xl bg-[#0992C2]/20 flex items-center justify-center border border-[#09c4f0]/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-[#09c4f0]" size={24} />
                  </div>
                  
                  <div>
                    <div className="font-heading text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-10"
        style={{ background: 'linear-gradient(to top, #020c1b, transparent)' }}
      />

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 hero-animate-6 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
        <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-[1px] h-12 relative overflow-hidden bg-white/10">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#09c4f0] to-transparent animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
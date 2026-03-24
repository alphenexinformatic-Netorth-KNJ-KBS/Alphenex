import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Filter, Users, BarChart3, Megaphone, ArrowRight, MousePointerClick, Rocket, CheckCircle, X } from 'lucide-react';

// Lazy-load the heavy 3D scene only when the user scrolls near this section.
// Three.js is 882KB - this prevents it from blocking the initial page load.
const ServicesTreeScene = lazy(() => import('./ServicesTreeScene'));

export const servicesData = [
  {
    id: 'ai-automation',
    icon: Rocket,
    title: 'AI Automation & SaaS Solutions',
    description: 'Custom AI post automation, sales management systems, and AI receptionists to optimize business overhead.',
    detailedDescription: `We don't just provide AI solutions; we build SAAS products that solve core business pain points. From AI-driven social media auto-posting to AI receptionists that handle 24/7 calls and bookings, our tools are designed to reduce employee overhead and maximize efficiency. Through our software branch Netorth.ae, we provide deep technical integration for enterprise-level business optimization.`,
    benefits: [
      'AI Receptionists for 24/7 Call Handling',
      'Automated AI Social Media Content Systems',
      'Employee Management & Payroll Tracking SaaS',
      'AI Sales Management & Lead Nurturing',
      'Custom SaaS Product Development (Netorth.ae)',
    ],
    pricing: 'Starting at $2,500/mo',
    highlight: true,
    stat: 'Reduce Ops Cost by 60%',
  },
  {
    id: 'google-ads',
    icon: Target,
    title: 'Precision Google Ads (USA/UAE/Global)',
    description: 'High-intent search and display campaigns targeting high-ticket clients in competitive global markets.',
    detailedDescription: `Dominate global search markets like the USA, UK, and Australia. Our precision-engineered Google Ads campaigns are built for high-ticket industries like Real Estate, Roofing, and Dental. We focus on cost-per-acquisition (CPA) and ROAS to ensure your budget is optimized for the highest quality leads.`,
    benefits: [
      'Global Market Targeting (USA, UK, UAE, AUS)',
      'High-Ticket Lead Generation (Real Estate, Dental, etc.)',
      'Advanced Conversion Tracking & GA4',
      'Competitor Conquesting Strategies',
      'Weekly ROI Optimization Reports',
    ],
    pricing: 'Starting at $1,500/mo',
    highlight: true,
    stat: '4.5x Average ROAS',
  },
  {
    id: 'meta-ads',
    icon: Megaphone,
    title: 'Scalable Meta Advertising',
    description: 'Hyper-targeted social campaigns on Facebook & Instagram that convert cold traffic into high-value clients.',
    detailedDescription: `Reach your ideal customers in the USA, UAE, and beyond. We create scroll-stopping creatives and high-conversion ad sets that target decision-makers. Whether you are in roofing, real estate, or high-end services, our Meta funnels are designed to drive scalable, predictable revenue.`,
    benefits: [
      'High-Converting Video & Image Creatives',
      'Audience Research for Global Markets',
      'Multi-Stage Retargeting Funnels',
      'Lead Form & Direct Message Optimization',
      'Daily Budget & Scale Management',
    ],
    pricing: 'Starting at $1,200/mo',
    highlight: true,
    stat: '35% Lower CPA',
  },
  {
    id: 'funnel-building',
    icon: Filter,
    title: '10X Revenue Funnel Systems',
    description: 'Complete sales architecture from landing pages to automated follow-ups that turns clicks into customers.',
    detailedDescription: `Our 10X roadmap transforms your traffic into a sales machine. We build full-stack funnels including high-conversion landing pages, automated email/SMS nurturing, and CRM integrations. By optimizing every touchpoint, we help businesses in niche markets like dental and roofing close more deals with less effort.`,
    benefits: [
      'High-Conversion Landing Page Architecture',
      'Automated Lead Nurturing (SMS/Email)',
      'CRM Integration (HubSpot, Salesforce, Zoho)',
      'A/B Split Testing & Heatmap Analysis',
      'Appointment Booking Automation',
    ],
    pricing: 'Starting at $3,000 one-time',
    highlight: false,
    stat: '300% Conversion Boost',
  },
  {
    id: 'lead-generation',
    icon: MousePointerClick,
    title: 'Global Lead Gen Ecosystems',
    description: 'A predictable, scalable stream of qualified leads across multi-channel global strategies.',
    detailedDescription: `We build end-to-end lead generation systems for businesses looking to scale internationally. Using a mix of paid search, social, and automated outbound, we ensure your pipeline is always full of high-intent prospects ready to close.`,
    benefits: [
      'Multi-Channel Global Targeting',
      'Lead Scoring & Qualification Systems',
      'Automated Outbound Sequences',
      'Qualified Appointment Setting',
      'Real-Time Lead Notifications',
    ],
    pricing: 'Starting at $1,800/mo',
    highlight: false,
    stat: '50+ High-Ticket Leads/Mo',
  },
  {
    id: 'analytics-reporting',
    icon: BarChart3,
    title: 'Enterprise ROI & BI Dashboards',
    description: 'Total transparency on ad spend and revenue with custom Business Intelligence reporting.',
    detailedDescription: `Know exactly where every dollar goes. Our custom enterprise-level dashboards provide real-time visibility into your marketing performance, allowing for data-driven decisions that cut waste and scale winners.`,
    benefits: [
      'Custom Looker Studio / PowerBI Dashboards',
      'Real-Time Spend & Revenue Tracking',
      'Multi-Touch Attribution Modeling',
      'Competitor Market Benchmarking',
      'Actionable Data-Driven Strategy Insights',
    ],
    pricing: 'Starting at $500/mo',
    highlight: false,
    stat: '100% Data Transparency',
  },
];

// Static CSS-only fallback shown before Three.js loads or on low-end devices
function ServicesStaticFallback() {
  return (
    <div className="w-full h-[600px] md:h-[750px] relative flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(2,12,27,0.8), rgba(5,22,40,0.9))' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#0992C2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#09c4f0]/60 text-sm">Loading 3D Ecosystem...</p>
      </div>
    </div>
  );
}

function Services({ onServiceSelect }) {
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [sceneVisible, setSceneVisible] = useState(false);
  const sectionRef = useRef(null);

  const activeService = servicesData.find(s => s.id === activeServiceId);

  const handleServiceClick = (serviceId) => {
    setActiveServiceId(serviceId);
    if (onServiceSelect) {
      onServiceSelect(serviceId);
    }
  };

  // Use IntersectionObserver to defer loading the 3D scene until user scrolls near it.
  // This prevents Three.js (882KB) from blocking the initial page load.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '10px' } // Start loading 10px before it enters viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="py-24 relative overflow-hidden bg-gradient-to-b from-[#020c1b] to-[#051628]"
      onClick={() => setActiveServiceId(null)}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-8 pointer-events-none custom-grid-bg" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-[#0992C2]/10 border border-[#0992C2]/20 text-[#4dc8f0] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#09c4f0] rounded-full animate-pulse" />
            Service Ecosystem
          </span>
          <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] via-[#0992C2] to-[#09c4f0]">3D Service Ecosystem</span>
          </h2>
          <p className="font-sans text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Scale your business with AI automation and high-ticket marketing solutions engineered for global domination.
          </p>
        </motion.div>

        {/* 3D Scene Container */}
        <div 
          className="relative mb-12 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Only render 3D scene when section is near viewport - prevents Three.js blocking initial load */}
          {sceneVisible ? (
            <Suspense fallback={<ServicesStaticFallback />}>
              <ServicesTreeScene 
                activeService={activeServiceId} 
                onServiceSelect={handleServiceClick} 
              />
            </Suspense>
          ) : (
            <ServicesStaticFallback />
          )}
          
          {/* Detailed Service Overlay */}
          <AnimatePresence>
            {activeService && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute top-6 right-6 bottom-6 w-full max-w-md bg-[#020c1b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-3xl" />
                <button 
                  onClick={() => setActiveServiceId(null)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>

                <div className="flex items-start gap-5 mb-8 pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0992C2]/30 to-[#09c4f0]/10 flex items-center justify-center border border-[#09c4f0]/30 shrink-0 shadow-[0_0_20px_rgba(9,146,194,0.2)]">
                    <activeService.icon className="text-[#09c4f0]" size={28} />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-heading text-2xl font-bold text-white leading-tight mb-2">{activeService.title}</h3>
                    <span className="inline-flex items-center gap-1.5 bg-[#0992C2]/20 text-[#09c4f0] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                      <TrendingUp size={12} />
                      {activeService.stat}
                    </span>
                  </div>
                </div>

                <p className="font-sans text-gray-300 text-sm leading-relaxed mb-8 font-light">
                  {activeService.detailedDescription}
                </p>

                <div className="space-y-4 mb-10">
                  <h4 className="text-white text-xs font-bold uppercase tracking-[0.15em] opacity-80 mb-5">Key Advantages</h4>
                  {activeService.benefits.map((benefit, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (i * 0.05) }}
                      className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
                    >
                      <CheckCircle className="text-[#09c4f0] mt-0.5 shrink-0" size={16} />
                      <span className="font-sans text-gray-300 text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 text-sm tracking-wider uppercase text-[10px]">Investment</span>
                    <span className="font-heading text-white font-bold text-xl">{activeService.pricing}</span>
                  </div>
                  <a
                    href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#0992C2] to-[#09c4f0] text-white font-bold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(9,146,194,0.4)] hover:-translate-y-0.5 outline-none"
                  >
                    Start Strategy Session <ArrowRight size={18} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Overlay (bottom sheet style) */}
          <AnimatePresence>
            {activeService && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute inset-x-0 bottom-0 bg-[#051628]/98 backdrop-blur-xl border-t border-[#09c4f0]/30 rounded-t-3xl p-6 z-20 lg:hidden"
              >
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <activeService.icon className="text-[#09c4f0]" size={20} />
                    <h3 className="text-lg font-bold text-white">{activeService.title}</h3>
                  </div>
                  <button onClick={() => setActiveServiceId(null)} className="text-gray-400"><X size={20} /></button>
                </div>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3">{activeService.description}</p>
                <a
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#0992C2] text-white font-bold rounded-xl"
                >
                  Contact Us <ArrowRight size={18} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-8 relative z-10"
        >
          <div className="inline-flex flex-col items-center bg-white/[0.02] border border-white/5 backdrop-blur-sm p-10 rounded-3xl">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Not sure which path to take?</h3>
            <p className="font-sans text-gray-400 mb-8 max-w-lg mx-auto font-light">
              Book a free discovery call and let our experts map out a custom growth ecosystem for your business.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 font-semibold text-lg px-10 py-5 rounded-full text-white transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0992C2] via-[#09c4f0] to-[#0992C2] bg-[length:200%_auto] animate-gradient" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(9,196,240,0.4)]" />
              <span className="relative z-10 flex items-center gap-2">
                Get a Free Strategy Call
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Services;

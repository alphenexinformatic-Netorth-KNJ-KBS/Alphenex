import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Zap, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const caseStudies = [
  {
    tag: 'Real Estate',
    client: 'Premium Homes Pvt. Ltd., Pune',
    title: 'From ₹0 to ₹2.4 Crore in Sales — In 90 Days',
    challenge: 'A new real estate developer with no digital presence needed to sell 30 luxury flats in 3 months before a bank deadline.',
    solution: 'We launched hyper-local Facebook & Instagram lead gen campaigns with a high-converting funnel, WhatsApp auto-responses, and a dedicated landing page. Ran Google Search Ads targeting "2BHK Flats Pune" and similar high-intent keywords.',
    results: [
      { icon: TrendingUp, metric: '₹2.4Cr', label: 'Revenue Generated' },
      { icon: Target, metric: '₹420', label: 'Cost Per Lead' },
      { icon: Users, metric: '840+', label: 'Qualified Leads' },
      { icon: Zap, metric: '18x', label: 'ROAS Achieved' },
    ],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    testimonial: '"Alphenex delivered beyond our expectations. We sold 28 units in 83 days."',
    testimonialAuthor: '— Raj M., Director',
  },
  {
    tag: 'Education',
    client: 'EduPro Coaching Institute, Mumbai',
    title: '300% Increase in Admissions Using Meta Ads Funnel',
    challenge: 'A JEE/NEET coaching centre was spending ₹80,000/month on ads with low-quality leads and poor conversions. CAC was more than fees collected.',
    solution: 'Complete overhaul of Meta Ads strategy — new creatives, video testimonials, lead magnet (free test series), landing page redesign, and automated WhatsApp follow-up sequences that nurtured leads to appointments.',
    results: [
      { icon: TrendingUp, metric: '300%', label: 'Admissions Increase' },
      { icon: Target, metric: '₹180', label: 'Cost Per Lead (from ₹890)' },
      { icon: Users, metric: '1,200+', label: 'Leads Generated/Month' },
      { icon: Zap, metric: '4.2x', label: 'ROAS' },
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    testimonial: '"We went from struggling to turning away students. The funnel they built is our best salesperson."',
    testimonialAuthor: '— Priya S., Founder',
  },
  {
    tag: 'E-Commerce',
    client: 'Organic Living — D2C Brand',
    title: 'Scaling Organic Food Brand to ₹15L/Month ROAS 6.8x',
    challenge: 'A D2C organic food brand was stuck at ₹2L/month revenue with basic boosted posts. They had a great product but no strategy to scale.',
    solution: 'Full-funnel Meta Ads strategy with top-of-funnel video content, middle-funnel retargeting with reviews, and bottom-funnel cart-abandonment ads. Launched Google Shopping campaigns targeting high-intent buyers.',
    results: [
      { icon: TrendingUp, metric: '6.8x', label: 'ROAS' },
      { icon: Target, metric: '₹15L/mo', label: 'Monthly Revenue' },
      { icon: Users, metric: '8x', label: 'Revenue Scaled' },
      { icon: Zap, metric: '₹320', label: 'Average Customer CAC' },
    ],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    testimonial: '"We went from ₹2 lakh to ₹15 lakh a month in under 6 months. Alphenex changed our business."',
    testimonialAuthor: '— Sneha K., CEO',
  },
  {
    tag: 'Healthcare',
    client: 'Smile Dental Clinics — 3 Locations',
    title: '500+ New Patient Appointments in 2 Months via Google Ads',
    challenge: 'A growing dental chain wanted to fill appointment slots at 3 new branches in Bangalore with zero existing patient base.',
    solution: 'Google Search + Maps Ads targeting "dentist near me" and service-specific keywords (teeth whitening, braces etc.). Combined with Facebook lead forms and Google My Business optimization for local SEO.',
    results: [
      { icon: Users, metric: '500+', label: 'Patient Appointments' },
      { icon: Target, metric: '₹290', label: 'Cost Per Appointment' },
      { icon: TrendingUp, metric: '92%', label: 'Google Ads Quality Score' },
      { icon: Zap, metric: '3.5x', label: 'Revenue vs. Ad Spend' },
    ],
    image: 'https://images.unsplash.com/photo-1588776814546-1ffdd17c350a?auto=format&fit=crop&q=80&w=800',
    testimonial: '"All 3 clinics are fully booked within 6 weeks. The ROI is exceptional."',
    testimonialAuthor: '— Dr. Anil V., Clinic Director',
  },
];

function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-[#051628] to-[#020c1b] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-[#0992C2]/10 border border-[#0992C2]/20 text-[#4dc8f0] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#09c4f0] rounded-full animate-pulse" />
            Proven Results
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Real Clients. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] via-[#0992C2] to-[#09c4f0]">Real Revenue.</span>
          </h2>
          <p className="font-sans text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Don't take our word for it — see exactly how we've helped businesses across India generate lakhs in revenue with precision ad campaigns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 bg-white/[0.02] border border-white/5 backdrop-blur-xl flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(9,146,194,0.2)]"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden flex-shrink-0">
                <img
                  src={study.image}
                  alt={`${study.title} case study`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[40%] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020c1b] via-[#020c1b]/60 to-transparent"></div>
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                  {study.tag}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col flex-grow relative z-10 -mt-10 bg-gradient-to-b from-transparent to-[#020c1b]">
                <p className="font-sans text-xs font-bold text-[#09c4f0] uppercase tracking-widest mb-3">{study.client}</p>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6 group-hover:text-[#4dc8f0] transition-colors leading-tight">{study.title}</h3>
                
                <div className="space-y-5 mb-8 flex-grow">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                    <p className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       Challenge
                    </p>
                    <p className="font-sans text-sm text-gray-300 leading-relaxed font-light">{study.challenge}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#0992C2]/10 to-transparent border border-[#09c4f0]/20 rounded-2xl p-5">
                    <p className="font-sans text-[10px] font-bold text-[#09c4f0] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Zap size={12} /> Solution
                    </p>
                    <p className="font-sans text-sm text-gray-200 leading-relaxed font-light">{study.solution}</p>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {study.results.map((result, idx) => {
                    const Icon = result.icon;
                    return (
                      <div key={idx} className="flex items-center space-x-4 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0992C2]/20 to-[#09c4f0]/5 border border-[#09c4f0]/20 text-[#4dc8f0] flex-shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="font-heading text-xl font-bold text-white">{result.metric}</p>
                          <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{result.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Testimonial */}
                <div className="rounded-2xl p-6 mt-auto border border-white/5 bg-white/[0.02] relative overflow-hidden group-hover:bg-[#0992C2]/5 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0992C2] to-[#09c4f0]" />
                  <div className="flex gap-1.5 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="font-sans text-sm text-gray-300 italic mb-2 leading-relaxed">"{study.testimonial}"</p>
                  <p className="font-sans text-xs font-semibold text-gray-500">{study.testimonialAuthor}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-20 relative z-10"
        >
          <div className="inline-flex flex-col items-center bg-white/[0.02] border border-white/5 backdrop-blur-sm p-12 rounded-[2.5rem]">
            <span className="inline-flex items-center gap-2 bg-[#0992C2]/10 border border-[#0992C2]/20 text-[#4dc8f0] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
              Let's Scale
            </span>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Ready to be our next success story?</h3>
            <p className="font-sans text-gray-400 mb-10 max-w-lg mx-auto font-light text-lg">
              Book a free discovery call and let's map out a custom growth strategy for your brand.
            </p>
            <Link
              to="/contact"
               className="group inline-flex items-center gap-3 font-bold text-lg px-10 py-5 rounded-full text-white transition-all duration-300 hover:-translate-y-1 relative overflow-hidden outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0992C2] via-[#09c4f0] to-[#0992C2] bg-[length:200%_auto] animate-gradient" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(9,196,240,0.5)]" />
              <span className="relative z-10 flex items-center gap-2">
                Book Your Free Strategy Call
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Portfolio;
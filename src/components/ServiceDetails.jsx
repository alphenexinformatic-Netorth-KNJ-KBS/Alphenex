import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Briefcase, Star, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function ServiceDetails({ services, activeServiceId, onServiceChange }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Find active service object
  const activeService = services.find(s => s.id === activeServiceId) || services[0];

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <section id="service-details" ref={containerRef} className="py-20 bg-gradient-to-b from-[#020c1b] to-[#051628] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#4dc8f0] font-semibold tracking-wider uppercase text-sm mb-2 block">
            Deep Dive
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Service Details
          </h2>
        </motion.div>

        {/* Service Selector / Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {services.map((service) => {
            const Icon = service.icon;
            const isActive = activeService.id === service.id;
            
            return (
              <button
                key={service.id}
                onClick={() => onServiceChange(service.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                  isActive 
                    ? 'bg-[#0992C2] text-white shadow-[0_0_15px_rgba(9,146,194,0.4)] scale-105 border border-[#4dc8f0]/50' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon size={16} />
                <span>{service.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Service Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-[0_0_40px_rgba(9,146,194,0.1)] border border-white/10 overflow-hidden"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0992C2]/20 to-[#0773A0]/20 p-8 md:p-12 text-white relative overflow-hidden border-b border-white/5">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-xl mb-6 border border-white/20 shadow-[0_0_15px_rgba(9,146,194,0.3)]">
                    {activeService.icon && <activeService.icon size={32} className="text-[#4dc8f0]" />}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{activeService.title}</h3>
                  <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
                    {activeService.detailedDescription}
                  </p>
                </div>
                <div className="flex-shrink-0 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                   <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">Starting From</div>
                   <div className="text-3xl font-bold text-[#4dc8f0]">{activeService.pricing}</div>
                </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#0992C2]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-[#051628]/40 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Benefits & Features */}
                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center text-xl font-bold text-white mb-6">
                      <Zap className="w-5 h-5 mr-2 text-[#4dc8f0]" />
                      Key Benefits
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeService.benefits.map((benefit, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm shadow-sm"
                        >
                          <Check className="w-5 h-5 text-[#4dc8f0] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300 font-medium">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center text-xl font-bold text-white mb-6">
                      <Layers className="w-5 h-5 mr-2 text-[#4dc8f0]" />
                      Process Overview
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="w-8 h-8 rounded-full bg-[#0992C2]/20 text-[#4dc8f0] border border-[#0992C2]/30 flex items-center justify-center font-bold text-sm mr-4">1</div>
                         <p className="text-gray-300 text-sm">Initial consultation & needs assessment</p>
                      </div>
                      <div className="flex items-center bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="w-8 h-8 rounded-full bg-[#0992C2]/20 text-[#4dc8f0] border border-[#0992C2]/30 flex items-center justify-center font-bold text-sm mr-4">2</div>
                         <p className="text-gray-300 text-sm">Strategy development & approval</p>
                      </div>
                      <div className="flex items-center bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="w-8 h-8 rounded-full bg-[#0992C2]/20 text-[#4dc8f0] border border-[#0992C2]/30 flex items-center justify-center font-bold text-sm mr-4">3</div>
                         <p className="text-gray-300 text-sm">Implementation & ongoing management</p>
                      </div>
                      <div className="flex items-center bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="w-8 h-8 rounded-full bg-[#0992C2]/20 text-[#4dc8f0] border border-[#0992C2]/30 flex items-center justify-center font-bold text-sm mr-4">4</div>
                         <p className="text-gray-300 text-sm">Monthly reporting & optimization</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Use Cases & CTA */}
                <div className="space-y-8 flex flex-col h-full">
                   {activeService.useCases && (
                     <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex-grow">
                      <h4 className="flex items-center text-xl font-bold text-white mb-4">
                        <Briefcase className="w-5 h-5 mr-2 text-[#4dc8f0]" />
                        Use Cases
                      </h4>
                      <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                        {activeService.useCases.description}
                      </p>
                      
                      {activeService.useCases.examples && (
                        <>
                          <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" /> 
                            Perfect For:
                          </h5>
                          <div className="flex flex-wrap gap-2 mb-8">
                            {activeService.useCases.examples.map((example, idx) => (
                              <span 
                                key={idx} 
                                className="bg-white/10 text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 shadow-sm"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="bg-[#0992C2]/10 backdrop-blur-md rounded-2xl p-8 border border-[#0992C2]/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0992C2]/20 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold text-white mb-2">Ready to move forward?</h4>
                      <p className="text-gray-400 mb-6 text-sm">
                        Let's implement this strategy for your business today.
                      </p>
                      <Button 
                        onClick={handleContactClick}
                        className="w-full bg-[#0992C2] hover:bg-[#4dc8f0] text-white py-6 rounded-xl shadow-[0_0_20px_rgba(9,146,194,0.4)] transition-all text-lg font-semibold border border-[#4dc8f0]/50"
                      >
                        Request This Service
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default ServiceDetails;
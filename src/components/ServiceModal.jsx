import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Zap, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function ServiceModal({ isOpen, onClose, service }) {
  const navigate = useNavigate();

  if (!isOpen || !service) return null;

  const handleGetStarted = () => {
    onClose();
    navigate('/contact');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a1929] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] z-[70] p-6 md:p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={24} />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0992C2]/15 flex items-center justify-center text-[#4dc8f0]">
                {service.icon && <service.icon size={24} />}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{service.title}</h2>
            </div>

            <div className="space-y-8">
              {/* Description */}
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed">
                  {service.detailedDescription}
                </p>
              </div>

              {/* Key Benefits */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-[#0992C2]" />
                  Key Benefits
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-[#0992C2]" />
                  Real-World Applications
                </h3>
                <p className="text-gray-300 mb-4">{service.useCases.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.useCases.examples.map((example, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing/Process */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-[#0992C2]" />
                      Starting from {service.pricing}
                    </h3>
                    <p className="text-sm text-gray-400">Custom packages available based on your needs</p>
                  </div>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-[#0992C2] hover:bg-[#0773A0] text-white px-8 py-2 rounded-full shadow-lg transition-all"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ServiceModal;
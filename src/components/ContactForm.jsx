import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

import { allCountries } from '../data/Countries';
import { useSession } from '../context/SessionContext';

const services = [
  'AI Automation & SaaS',
  'Google Ads Management',
  'Meta Ads (FB & IG)',
  '10X Sales Funnels',
  'Global Lead Generation',
  'Analytics & Reporting',
  'Looking For other Services'
];

/**
 * Custom Input Component with Floating Label (Sitting in the border)
 * Using fieldset/legend for the native border gap effect
 */
const FloatingInput = ({ label, name, type = "text", value, onChange, placeholder, error, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full relative">
      <fieldset className={`relative rounded-2xl border transition-all duration-300 w-full
        ${isFocused ? 'border-[#4dc8f0] ring-4 ring-[#4dc8f0]/10' : error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
      >
        <legend
          className={`ml-4 px-2 text-xs font-semibold transition-all duration-300
            ${isFocused ? 'text-[#4dc8f0]' : value ? 'text-[#4dc8f0]/80' : 'text-gray-500'}`}
        >
          {label} {required && <span className="text-[#4dc8f0]">*</span>}
        </legend>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete="one-time-code"
          className="w-full bg-transparent px-5 pb-4 pt-1 text-white outline-none placeholder:text-gray-600"
        />
      </fieldset>
      {error && <p className="absolute -bottom-5 left-1 text-[10px] text-red-400 font-medium uppercase tracking-wider">{error}</p>}
    </div>
  );
};

function ContactForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const [selectedCountry, setSelectedCountry] = useState(allCountries.find(c => c.name === 'India') || allCountries[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const { sessionToken, sessionId, setSessionId } = useSession();
  const [childSessionId, setChildSessionId] = useState('');

  // Track focused index for keyboard navigation
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1);
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);

  const countryRef = useRef(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
        setActiveCountryIndex(-1);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setIsServiceOpen(false);
        setActiveServiceIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation logic
  const handleCountryKeyDown = (e) => {
    if (!isCountryOpen) return;
    const count = filteredCountries.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCountryIndex(prev => (prev < count - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCountryIndex(prev => (prev > 0 ? prev - 1 : count - 1));
    } else if (e.key === 'Enter' && activeCountryIndex >= 0) {
      e.preventDefault();
      setSelectedCountry(filteredCountries[activeCountryIndex]);
      setIsCountryOpen(false);
      setActiveCountryIndex(-1);
    } else if (e.key === 'Escape') {
      setIsCountryOpen(false);
      setActiveCountryIndex(-1);
    }
  };

  const handleServiceKeyDown = (e) => {
    if (!isServiceOpen) return;
    const count = services.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev < count - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev > 0 ? prev - 1 : count - 1));
    } else if (e.key === 'Enter' && activeServiceIndex >= 0) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, service: services[activeServiceIndex] }));
      setIsServiceOpen(false);
      setActiveServiceIndex(-1);
    } else if (e.key === 'Escape') {
      setIsServiceOpen(false);
      setActiveServiceIndex(-1);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    // Strict email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email (e.g. you@company.com)';
    }

    // Phone length validation (digits only, strictly per user's selected country)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      const expectedLength = selectedCountry.phoneLength || 10;
      if (digitsOnly.length !== expectedLength) {
        newErrors.phone = `Phone number for ${selectedCountry.name} must be ${expectedLength} digits.`;
      }
    }

    // Message length
    if (formData.message && formData.message.length > 400) {
      newErrors.message = 'Message must be under 400 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restriction: Name only allows alphabets and spaces
    if (name === 'name') {
      const alphabetValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData((prev) => ({ ...prev, [name]: alphabetValue }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e, isConfirmed = false) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Needed', description: 'Please check your information.', variant: 'destructive' });
      return;
    }

    const API_URL = import.meta.env.VITE_API_BASE_URL || '/submit_inquiry.php';

    // Step 1: Logic to check for existing submission before proceeding
    if (!isConfirmed && !childSessionId) {
      try {
        const checkResp = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_existing', session_token: sessionToken }),
        });
        const checkResult = await checkResp.json();
        if (checkResult.exists) {
          setExistingUserName(checkResult.name || 'there');
          setShowConfirmModal(true);
          return; // Stop here and wait for modal choice
        }
      } catch (err) {
        console.error("Check failed", err);
      }
    }

    // Step 2: Proceed with actual submission
    setIsSubmitting(true);
    startLoading();
    const finalPhone = `${selectedCountry.code}${formData.phone.replace(/\D/g, '')}`;
    const submissionData = { 
      ...formData, 
      phone: finalPhone, 
      session_token: sessionToken,
      child_session_id: childSessionId 
    };

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await resp.json();
      if (resp.ok && result.status === 'success') {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', phone: '', company: '', service: '', message: '' });
        setChildSessionId(''); // Reset child session
      } else {
        throw new Error(result.message || 'Server error');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Connection failed. Please WhatsApp us directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      stopLoading();
      setShowConfirmModal(false);
    }
  };

  const handleContinueNewInquiry = () => {
    // Generate a new child session ID
    const newChildId = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setChildSessionId(newChildId);
  };

  // Effect to trigger submit once child ID is set after confirmation
  useEffect(() => {
    if (childSessionId && showConfirmModal) {
      handleSubmit(null, true);
    }
  }, [childSessionId]);

  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    c.code.includes(searchCountry)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10" autoComplete="off">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        <FloatingInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <FloatingInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          error={errors.email}
          required
        />

        {/* Phone with Country Picker */}
        <div className="relative group w-full flex gap-0">
          <fieldset className={`relative rounded-2xl border transition-all duration-300 w-full flex items-center
          ${errors.phone ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
          >
            <legend className="ml-4 px-2 text-xs font-semibold text-[#4dc8f0]">
              Phone <span className="text-[#4dc8f0]">*</span>
            </legend>

            <div className="relative flex items-center h-full mb-1" ref={countryRef}>
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                onKeyDown={handleCountryKeyDown}
                className="h-full pl-5 pr-3 flex items-center gap-2 text-white border-r border-white/10 hover:bg-white/5 transition-colors pb-3 pt-0"
              >
                <span className="text-xl leading-none">{selectedCountry.flag}</span>
                <span className="font-semibold text-sm">{selectedCountry.code}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isCountryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCountryOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full left-0 mt-3 w-80 max-h-80 bg-[#020c1b] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[999] overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5 bg-white/5">
                      <div className="flex items-center gap-3 px-3 py-2 bg-[#020c1b] rounded-lg border border-white/10">
                        <Search size={16} className="text-gray-500" />
                        <input
                          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
                          placeholder="Search countries..."
                          value={searchCountry}
                          onChange={(e) => setSearchCountry(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-60 custom-scrollbar">
                      {filteredCountries.map((c, idx) => (
                        <button
                          key={`${c.name}-${c.code}`}
                          type="button"
                          onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }}
                          onMouseEnter={() => setActiveCountryIndex(idx)}
                          className={`w-full px-5 py-4 flex items-center justify-between transition-all text-left
                            ${activeCountryIndex === idx ? 'bg-[#4dc8f0]/20 text-[#4dc8f0]' : 'text-white hover:bg-[#4dc8f0]/5'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl leading-none">{c.flag}</span>
                            <span className="text-sm font-medium">{c.name}</span>
                          </div>
                          <span className={`text-xs font-bold ${activeCountryIndex === idx ? 'text-[#4dc8f0]' : 'text-[#4dc8f0]/60'}`}>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                // Restriction: Only allow digits, max 13
                const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                setFormData(prev => ({ ...prev, phone: val }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. 9876543210"
              autoComplete="one-time-code"
              className="flex-grow bg-transparent px-5 pb-4 pt-0 text-white outline-none placeholder:text-gray-600 h-full"
            />
          </fieldset>
          {errors.phone && <p className="absolute -bottom-5 left-1 text-[10px] text-red-400 font-medium uppercase tracking-wider">{errors.phone}</p>}
        </div>

        <FloatingInput
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company / Organization Name"
        />
      </div>

      {/* Service Interest */}
      <div className="relative group w-full" ref={serviceRef}>
        <fieldset className={`relative rounded-2xl border transition-all duration-300 w-full
        ${isServiceOpen ? 'border-[#4dc8f0] ring-4 ring-[#4dc8f0]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
        >
          <legend className={`ml-4 px-2 text-xs font-semibold transition-colors
          ${formData.service ? 'text-[#4dc8f0]' : 'text-gray-500'}`}>
            Service Interest
          </legend>
          <button
            type="button"
            onClick={() => setIsServiceOpen(!isServiceOpen)}
            onKeyDown={handleServiceKeyDown}
            className="w-full px-5 pb-4 pt-1 flex items-center justify-between text-white transition-all focus:outline-none"
          >
            <span className={formData.service ? 'text-white font-medium' : 'text-gray-400 font-normal'}>
              {formData.service || 'Select the service you need'}
            </span>
            <ChevronDown size={20} className={`text-[#4dc8f0] transition-transform duration-300 ${isServiceOpen ? 'rotate-180' : ''}`} />
          </button>
        </fieldset>

        <AnimatePresence>
          {isServiceOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-[#020c1b] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              {services.map((service, idx) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => { setFormData(p => ({ ...p, service })); setIsServiceOpen(false); }}
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-all text-left
                    ${activeServiceIndex === idx ? 'bg-[#4dc8f0]/15 text-[#4dc8f0]' : 'text-white hover:bg-white/5'}`}
                >
                  <span className={formData.service === service || activeServiceIndex === idx ? 'font-bold' : ''}>{service}</span>
                  {(formData.service === service || activeServiceIndex === idx) && <Check size={18} className="text-[#4dc8f0]" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message */}
      <fieldset className={`w-full rounded-2xl border transition-all duration-300 ${errors.message ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-[#4dc8f0]/50 focus-within:ring-4 focus-within:ring-[#4dc8f0]/10'}`}>
        <legend className="ml-4 px-2 flex items-center gap-3">
          <span className={`text-xs font-semibold transition-all duration-300 ${formData.message.length > 0 ? 'text-[#4dc8f0]' : 'text-gray-500'}`}>
            Message
          </span>
          <span className={`text-[10px] font-bold ${formData.message.length > 380 ? 'text-red-400' : 'text-gray-600'}`}>
            {formData.message.length} / 400
          </span>
        </legend>
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => {
            if (e.target.value.length <= 400) handleChange(e);
          }}
          rows={5}
          autoComplete="one-time-code"
          placeholder="Briefly describe your requirements (max 400 characters)..."
          className="w-full bg-transparent px-5 pb-4 pt-1 text-white outline-none placeholder:text-gray-600 resize-none"
        />
        {errors.message && <p className="px-5 pb-3 text-[10px] text-red-400 font-medium uppercase tracking-wider">{errors.message}</p>}
      </fieldset>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-16 bg-gradient-to-r from-[#0992C2] to-[#4dc8f0] hover:from-[#4dc8f0] hover:to-[#0992C2] text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-[0_0_40px_rgba(77,200,240,0.5)] transition-all duration-500 active:scale-95 group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-4">
          {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          {isSubmitting ? 'Submitting Details...' : 'Request My Free Strategy Session'}
        </span>
      </Button>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/thank-you');
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-[#020c1b] border border-[#4dc8f0]/30 rounded-[32px] p-8 text-center shadow-[0_0_100px_rgba(77,200,240,0.2)]"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#0992C2] to-[#4dc8f0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(77,200,240,0.3)]">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>

              <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Success!</h3>
              <p className="text-gray-400 text-lg mb-8 font-medium">
                Your message has been received successfully. We look forward to speaking with you!
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/thank-you');
                }}
                className="w-full py-4 bg-gradient-to-r from-[#0992C2] to-[#4dc8f0] text-white font-bold text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(77,200,240,0.4)] transition-all active:scale-95"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Resubmission */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#020c1b] border border-[#4dc8f0]/30 rounded-[32px] p-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Hi {existingUserName}!</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You already have submitted and received an invitation mail. <br />
                Do you want to re-enter your new requirement details?
              </p>
              
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleContinueNewInquiry}
                  className="w-full h-14 bg-[#4dc8f0] text-[#020c1b] font-bold rounded-xl hover:bg-white transition-all transform active:scale-95 shadow-[0_0_30px_rgba(77,200,240,0.3)]"
                >
                  Continue with new Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => { setShowConfirmModal(false); navigate('/thank-you'); }}
                  className="w-full h-14 border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all"
                >
                  Skip & explore other services
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default ContactForm;
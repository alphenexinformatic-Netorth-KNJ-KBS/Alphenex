import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, ChevronDown, Check, Search, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

import { allCountries } from '../data/Countries';
import { useSession } from '../context/SessionContext';

const FALLBACK_SERVICES = [
  { id: 1, service_name: 'AI Automation & SaaS' },
  { id: 2, service_name: 'Google Ads Management' },
  { id: 3, service_name: 'Meta Ads (FB & IG)' },
  { id: 4, service_name: '10X Sales Funnels' },
  { id: 5, service_name: 'Global Lead Generation' },
  { id: 6, service_name: 'Analytics & Reporting' },
  { id: 7, service_name: 'Looking For other Services' }
];

const getApiBase = () => {
  const viteUrl = import.meta.env.VITE_API_BASE_URL;
  if (viteUrl) {
    return viteUrl.replace(/\/+$/, '');
  }
  return window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://api.alphenex.com';
};

const API_BASE = getApiBase();
const OTP_SEND_URL = `${API_BASE}/api/v1/website/otp/send`;
const OTP_VERIFY_URL = `${API_BASE}/api/v1/website/otp/verify`;
const SERVICES_URL = `${API_BASE}/api/v1/website/services`;
const INQUIRY_URL = `${API_BASE}/api/v1/website/inquiry`;
const INQUIRY_CHECK_URL = `${API_BASE}/api/v1/website/inquiry/check`;

/**
 * Custom Input Component with Floating Label (Sitting in the border)
 * Using fieldset/legend for the native border gap effect
 */
const FloatingInput = ({ label, name, type = "text", value, onChange, placeholder, error, required = false, disabled = false, rightElement }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full relative">
      <fieldset className={`relative rounded-2xl border transition-all duration-300 w-full
        ${isFocused ? 'border-[#4dc8f0] ring-4 ring-[#4dc8f0]/10' : error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}
        ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <legend
          className={`ml-4 px-2 text-xs font-semibold transition-all duration-300
            ${isFocused ? 'text-[#4dc8f0]' : value ? 'text-[#4dc8f0]/80' : 'text-gray-500'}`}
        >
          {label} {required && <span className="text-[#4dc8f0]">*</span>}
        </legend>
        <div className="flex items-center">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoComplete="one-time-code"
            disabled={disabled}
            className="w-full bg-transparent px-5 pb-4 pt-1 text-white outline-none placeholder:text-gray-600"
          />
          {rightElement && <div className="pr-3 pb-2">{rightElement}</div>}
        </div>
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
    service_id: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [services, setServices] = useState(FALLBACK_SERVICES);

  const [selectedCountry, setSelectedCountry] = useState(allCountries.find(c => c.name === 'India') || allCountries[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const { sessionToken, sessionId, setSessionId } = useSession();
  const [childSessionId, setChildSessionId] = useState('');

  // ═══════════════════════════════════════════════════
  // OTP State
  // ═══════════════════════════════════════════════════
  const [otpStep, setOtpStep] = useState('idle'); // idle | sending | sent | verifying | verified
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // Track focused index for keyboard navigation
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1);
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);

  const countryRef = useRef(null);
  const serviceRef = useRef(null);

  // Load services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await fetch(SERVICES_URL);
        const data = await resp.json();
        if (data.status === 'success' && data.services && data.services.length > 0) {
          setServices(data.services);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };
    fetchServices();
  }, []);

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

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpCountdown === 0 && otpStep === 'sent') {
      setCanResend(true);
    }
  }, [otpCountdown, otpStep]);

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
      const s = services[activeServiceIndex];
      setFormData(prev => ({ ...prev, service: s.service_name, service_id: s.id }));
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

    // If email changes, reset OTP state
    if (name === 'email') {
      if (otpStep === 'verified' || otpStep === 'sent') {
        setOtpStep('idle');
        setOtpCode('');
        setOtpId(null);
        setOtpError('');
        setOtpCountdown(0);
        setCanResend(false);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ═══════════════════════════════════════════════════
  // SEND OTP
  // ═══════════════════════════════════════════════════
  const handleSendOtp = async () => {
    // Validate email first
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      return;
    }
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email (e.g. you@company.com)' }));
      return;
    }

    setOtpStep('sending');
    setOtpError('');

    try {
      const resp = await fetch(OTP_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          session_token: sessionToken,
          source: 'contact_form'
        }),
      });

      const result = await resp.json();

      if (result.success) {
        setOtpStep('sent');
        setOtpId(result.otp_id);
        setOtpCountdown(60); // 60 seconds before resend
        setCanResend(false);
        setOtpCode('');
        toast({ 
          title: '📧 OTP Sent!', 
          description: `A 6-digit code has been sent to ${formData.email}`,
        });
      } else {
        setOtpStep('idle');
        setOtpError(result.error || 'Failed to send OTP.');
        toast({ title: 'Error', description: result.error || 'Failed to send OTP.', variant: 'destructive' });
      }
    } catch (err) {
      setOtpStep('idle');
      setOtpError('Network error. Please try again.');
      toast({ title: 'Error', description: 'Failed to send verification code.', variant: 'destructive' });
    }
  };

  // ═══════════════════════════════════════════════════
  // VERIFY OTP
  // ═══════════════════════════════════════════════════
  const handleVerifyOtp = async (codeOverride) => {
    const code = codeOverride || otpCode;
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setOtpStep('verifying');
    setOtpError('');

    try {
      const resp = await fetch(OTP_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp_code: code,
          session_token: sessionToken,
        }),
      });

      const result = await resp.json();

      if (result.success) {
        setOtpStep('verified');
        setOtpId(result.otp_id);
        setOtpError('');
        toast({ title: '✅ Verified!', description: 'Email successfully verified.' });
      } else {
        setOtpStep('sent');
        setOtpError(result.error || 'Invalid code.');
        if (result.expired || result.max_attempts) {
          setOtpStep('idle');
          setOtpCode('');
        }
      }
    } catch (err) {
      setOtpStep('sent');
      setOtpError('Network error. Please try again.');
    }
  };

  // Handle individual OTP digit inputs
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newCode = otpCode.split('');
    newCode[index] = value.slice(-1); // Take last character only
    const joined = newCode.join('').slice(0, 6);
    setOtpCode(joined);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all 6 digits are entered
    if (joined.length === 6 && index === 5) {
      handleVerifyOtp(joined);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      setOtpCode(pastedData);
      const lastIndex = Math.min(pastedData.length - 1, 5);
      otpInputRefs.current[lastIndex]?.focus();
      if (pastedData.length === 6) {
        handleVerifyOtp(pastedData);
      }
    }
  };

  const handleSubmit = async (e, isConfirmed = false) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Needed', description: 'Please check your information.', variant: 'destructive' });
      return;
    }

    // ═══ OTP GATE: Block submission without verified OTP ═══
    if (otpStep !== 'verified') {
      toast({ 
        title: '⚠️ Email Verification Required', 
        description: 'Please verify your email address before submitting.',
        variant: 'destructive' 
      });
      return;
    }

    // Step 1: Logic to check for existing submission before proceeding
    if (!isConfirmed && !childSessionId) {
      try {
        const checkResp = await fetch(INQUIRY_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken }),
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
      child_session_id: childSessionId,
      otp_id: otpId,  // ← Pass verified OTP ID to backend
      service_id: formData.service_id // pass the service ID
    };

    try {
      const resp = await fetch(INQUIRY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await resp.json();
      if (resp.ok && result.status === 'success') {
        sessionStorage.setItem('alphenex_inquiry_submitted', 'true');
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', phone: '', company: '', service: '', service_id: '', message: '' });
        setChildSessionId(''); // Reset child session
        // Reset OTP state after successful submission
        setOtpStep('idle');
        setOtpCode('');
        setOtpId(null);
        setOtpError('');
        setOtpCountdown(0);
      } else {
        throw new Error(result.message || 'Server error');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Connection failed. Please WhatsApp us directly.', variant: 'destructive' });
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

  // Format countdown as MM:SS
  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

        {/* Email with OTP Button */}
        <FloatingInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          error={errors.email}
          required
          disabled={otpStep === 'verified'}
          rightElement={
            otpStep === 'verified' ? (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold whitespace-nowrap">
                <ShieldCheck size={16} />
                Verified
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpStep === 'sending' || !formData.email.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4dc8f0]/15 border border-[#4dc8f0]/30 text-[#4dc8f0] text-xs font-bold rounded-lg hover:bg-[#4dc8f0]/25 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {otpStep === 'sending' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                {otpStep === 'sending' ? 'Sending...' : otpStep === 'sent' ? 'Resend' : 'Verify'}
              </button>
            )
          }
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

      {/* ═══════════════════════════════════════════════════
          OTP VERIFICATION SECTION — Shows after "Verify" is clicked
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {(otpStep === 'sent' || otpStep === 'verifying') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative rounded-2xl border border-[#4dc8f0]/20 bg-[#4dc8f0]/5 p-6 overflow-hidden">
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0992C2]/5 via-[#4dc8f0]/10 to-[#0992C2]/5 animate-pulse pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0992C2] to-[#4dc8f0] flex items-center justify-center shadow-lg shadow-[#4dc8f0]/20">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Email Verification</h4>
                    <p className="text-gray-400 text-xs">
                      Enter the 6-digit code sent to <span className="text-[#4dc8f0] font-semibold">{formData.email}</span>
                    </p>
                  </div>
                </div>

                {/* 6-Digit OTP Input Boxes */}
                <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpCode[i] || ''}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      disabled={otpStep === 'verifying'}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-300 bg-[#020c1b]
                        ${otpError ? 'border-red-500/50 text-red-400 animate-shake' : 
                          otpCode[i] ? 'border-[#4dc8f0]/60 text-[#4dc8f0] shadow-[0_0_15px_rgba(77,200,240,0.15)]' : 
                          'border-white/10 text-white'}
                        focus:border-[#4dc8f0] focus:ring-2 focus:ring-[#4dc8f0]/20
                        ${otpStep === 'verifying' ? 'opacity-50' : ''}`}
                    />
                  ))}
                </div>

                {/* OTP Error Message */}
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs text-center mb-3 font-medium"
                  >
                    {otpError}
                  </motion.p>
                )}

                {/* Countdown + Resend */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {otpCountdown > 0 ? (
                      <span>Resend in <span className="text-[#4dc8f0] font-bold">{formatCountdown(otpCountdown)}</span></span>
                    ) : (
                      canResend && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="flex items-center gap-1.5 text-[#4dc8f0] font-semibold hover:text-white transition-colors"
                        >
                          <RefreshCw size={12} />
                          Resend Code
                        </button>
                      )
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={otpCode.length !== 6 || otpStep === 'verifying'}
                    className="px-6 py-2 bg-gradient-to-r from-[#0992C2] to-[#4dc8f0] text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(77,200,240,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {otpStep === 'verifying' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {otpStep === 'verifying' ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verified Badge */}
      <AnimatePresence>
        {otpStep === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm font-semibold">
              ✅ Email verified — <span className="text-emerald-300">{formData.email}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="absolute top-full left-0 right-0 mt-3 bg-[#020c1b] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
            >
              {services.map((s, idx) => (
                <button
                  key={s.id || s.service_name}
                  type="button"
                  onClick={() => { setFormData(p => ({ ...p, service: s.service_name, service_id: s.id })); setIsServiceOpen(false); }}
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-all text-left
                    ${activeServiceIndex === idx ? 'bg-[#4dc8f0]/15 text-[#4dc8f0]' : 'text-white hover:bg-white/5'}`}
                >
                  <span className={formData.service === s.service_name || activeServiceIndex === idx ? 'font-bold' : ''}>{s.service_name}</span>
                  {(formData.service === s.service_name || activeServiceIndex === idx) && <Check size={18} className="text-[#4dc8f0]" />}
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
        disabled={isSubmitting || otpStep !== 'verified'}
        className={`w-full h-16 text-white font-bold text-lg rounded-2xl shadow-xl transition-all duration-500 active:scale-95 group relative overflow-hidden
          ${otpStep === 'verified' 
            ? 'bg-gradient-to-r from-[#0992C2] to-[#4dc8f0] hover:from-[#4dc8f0] hover:to-[#0992C2] hover:shadow-[0_0_40px_rgba(77,200,240,0.5)]' 
            : 'bg-gray-700/50 cursor-not-allowed'}`}
      >
        <span className="relative z-10 flex items-center justify-center gap-4">
          {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          {isSubmitting ? 'Submitting Details...' : otpStep !== 'verified' ? '🔒 Verify Email to Submit' : 'Request My Free Strategy Session'}
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

      {/* Shake animation for error state */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </form>
  );
}

export default ContactForm;
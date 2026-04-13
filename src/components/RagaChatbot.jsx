import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, User, Mail, Phone, FileText, Check, AlertCircle, Sparkles, ArrowLeft, ChevronDown, Search, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { allCountries } from '../data/Countries';
import { useSession } from '../context/SessionContext';
import { useToast } from '@/components/ui/use-toast';

// ============================================================
// RAGA CHATBOT — REACT WIDGET
// ============================================================
// 
// SECURITY: This component ONLY communicates with our own PHP
// endpoints (/api/raga.php and /api/save_raga_lead.php).
// It NEVER calls any external AI provider directly.
// No API keys, auth tokens, or secrets exist in this file.
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/submit_inquiry\.php$/, '').replace(/\/+$/, '')
  : (window.location.hostname === 'localhost' ? 'https://alphenex.com' : window.location.origin);

const RAGA_CHAT_URL = `${API_BASE}/api/raga.php`;
const RAGA_LEAD_URL = `${API_BASE}/api/save_raga_lead.php`;
const OTP_SEND_URL = `${API_BASE}/api/send_otp.php`;
const OTP_VERIFY_URL = `${API_BASE}/api/verify_otp.php`;
const SESSION_KEY = 'raga_session_token';

// ─── Typing Indicator ────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '14px 18px', background: 'rgba(255,255,255,0.04)',
    borderRadius: '18px 18px 18px 4px', width: 'fit-content',
    border: '1px solid rgba(255,255,255,0.06)',
  }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4dc8f0, #0992C2)'
        }}
      />
    ))}
  </div>
);

// ─── Chat Message Bubble ─────────────────────────────────────
const ChatBubble = ({ msgObj, onAction, onOptionClick }) => {
  const { text, isUser, isError, options, showInquiryButton } = msgObj;
  // Clean any leftover [ACTION:SHOW_FORM] tags from text display
  const cleanText = (text || '').replace(/\[ACTION:SHOW_FORM\]/gi, '').trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div style={{
        maxWidth: '82%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #0992C2, #0773A0)'
          : isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)'}`,
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.55',
        wordBreak: 'break-word',
        boxShadow: isUser
          ? '0 4px 15px rgba(9,146,194,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {cleanText}

        {/* Inline "Start Inquiry" button when AI triggers form */}
        {showInquiryButton && !isUser && (
          <button
            onClick={onAction}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(9,146,194,0.4)',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={14} />
            Start Inquiry
          </button>
        )}

        {/* Clickable Quick Reply Options */}
        {options && options.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionClick(opt)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#4dc8f0',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(77,200,240,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(77,200,240,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Error Action: Start Inquiry Button inside bubble */}
        {isError && (
          <button
            onClick={onAction}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(9,146,194,0.3)',
            }}
          >
            <FileText size={14} />
            Start Inquiry
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Lead Form Inside Widget ─────────────────────────────────
const LeadForm = ({ onSubmit, onBack, isSubmitting, sessionToken }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', inquiry: '' });
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(allCountries.find(c => c.name === 'India') || allCountries[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1);
  const countryRef = useRef(null);

  // OTP State
  const [otpStep, setOtpStep] = useState('idle'); // idle | sending | sent | verifying | verified
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryOpen(false);
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

  const handleCountryKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setActiveCountryIndex(prev => Math.min(prev + 1, filteredCountries.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveCountryIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeCountryIndex >= 0) {
      setSelectedCountry(filteredCountries[activeCountryIndex]);
      setIsCountryOpen(false);
    } else if (e.key === 'Escape') {
      setIsCountryOpen(false);
    }
  };

  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    c.code.includes(searchCountry) ||
    (c.aliases && c.aliases.some(a => a.toLowerCase().includes(searchCountry.toLowerCase())))
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (!/^[a-zA-Z\s]+$/.test(form.name)) e.name = 'Only letters allowed';

    const hasEmail = form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const hasPhone = form.phone.trim() && /^\d{7,13}$/.test(form.phone.replace(/\D/g, ''));

    if (!form.email.trim() && !form.phone.trim()) {
      e.email = 'Email or Phone is required';
      e.phone = 'Email or Phone is required';
    } else {
      if (form.email.trim() && !hasEmail) e.email = 'Invalid email address';
      if (form.phone.trim()) {
        const purePhone = form.phone.replace(/\D/g, '');
        const expectedLength = selectedCountry.phoneLength || 10;
        if (purePhone.length !== expectedLength) {
          e.phone = `For ${selectedCountry.name}, phone must be ${expectedLength} digits.`;
        }
      }
    }

    if (!form.inquiry.trim()) e.inquiry = 'Please describe your requirement';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Send OTP ──
  const handleSendOtp = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors(p => ({ ...p, email: 'Valid email required to send OTP' }));
      return;
    }
    setOtpStep('sending');
    setOtpError('');
    try {
      const resp = await fetch(OTP_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, session_token: sessionToken, source: 'raga_chatbot' }),
      });
      const result = await resp.json();
      if (result.success) {
        setOtpStep('sent');
        setOtpId(result.otp_id);
        setOtpCountdown(60);
        setCanResend(false);
        setOtpCode('');
      } else {
        setOtpStep('idle');
        setOtpError(result.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpStep('idle');
      setOtpError('Network error. Please try again.');
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (codeOverride) => {
    const code = codeOverride || otpCode;
    if (code.length !== 6) { setOtpError('Enter the complete 6-digit code.'); return; }
    setOtpStep('verifying');
    setOtpError('');
    try {
      const resp = await fetch(OTP_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp_code: code, session_token: sessionToken }),
      });
      const result = await resp.json();
      if (result.success) {
        setOtpStep('verified');
        setOtpId(result.otp_id);
        setOtpError('');
        toast({ title: 'Success', description: 'Email verification is done successfully' });
      } else {
        setOtpStep('sent');
        setOtpError(result.error || 'Invalid code.');
        toast({ title: 'Failed', description: 'OTP is wrong.Email verification is failed.', variant: 'destructive' });
        if (result.expired || result.max_attempts) { setOtpStep('idle'); setOtpCode(''); }
      }
    } catch (err) {
      setOtpStep('sent');
      setOtpError('Network error. Please try again.');
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    // Pad the array to always have 6 slots
    const newCode = Array.from({ length: 6 }, (_, i) => otpCode[i] || '');
    newCode[index] = value.slice(-1);
    const joined = newCode.join('');
    setOtpCode(joined);
    setOtpError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (joined.replace(/\s/g, '').length === 6) handleVerifyOtp(joined);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      setOtpCode(pastedData);
      otpInputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
      if (pastedData.length === 6) handleVerifyOtp(pastedData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpStep !== 'verified') {
      setOtpError('Please verify your email before submitting.');
      return;
    }
    if (validate()) {
      const purePhone = form.phone.replace(/\D/g, '');
      const finalPhone = purePhone.length > 0 ? `${selectedCountry.code}-${purePhone}` : "";
      onSubmit({ ...form, phone: finalPhone, otp_id: otpId });
    }
  };

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setForm(p => ({ ...p, phone: digits }));
    if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
  };

  const handleNameChange = (val) => {
    const letters = val.replace(/[^a-zA-Z\s]/g, '');
    setForm(p => ({ ...p, name: letters }));
    if (errors.name) setErrors(p => ({ ...p, name: '' }));
  };

  const handleEmailChange = (val) => {
    setForm(p => ({ ...p, email: val }));
    if (errors.email) setErrors(p => ({ ...p, email: '' }));
    // Reset OTP if email changes
    if (otpStep === 'verified' || otpStep === 'sent') {
      setOtpStep('idle'); setOtpCode(''); setOtpId(null); setOtpError('');
      setOtpCountdown(0); setCanResend(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px 10px 36px',
    background: hasError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px', color: 'white', fontSize: '13px', outline: 'none',
    transition: 'border-color 0.2s',
  });

  const iconStyle = {
    position: 'absolute', left: '10px', top: '50%',
    transform: 'translateY(-50%)', color: '#4dc8f0', opacity: 0.7,
  };

  const formatCountdown = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.form
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '480px', overflow: 'hidden' }}
    >
      <div style={{ flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', overflowX: 'hidden' }} className="raga-scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <button type="button" onClick={onBack} style={{
            background: 'none', border: 'none', color: '#4dc8f0', cursor: 'pointer', padding: '4px',
            display: 'flex', alignItems: 'center',
          }}>
            <ArrowLeft size={18} />
          </button>
          <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: 0 }}>Share Your Project Details</h3>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '-4px 0 4px 0', lineHeight: 1.4 }}>
          Tell us about your needs and our team will prepare a personalized proposal.
        </p>

        {/* Name */}
        {!(otpStep === 'sent' || otpStep === 'verifying') && (
          <div style={{ position: 'relative' }}>
            <User size={14} style={iconStyle} />
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              style={inputStyle(errors.name)}
              onFocus={e => { e.target.style.borderColor = '#4dc8f0'; }}
              onBlur={e => { e.target.style.borderColor = errors.name ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; }}
            />
            {errors.name && <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{errors.name}</span>}
          </div>
        )}

        {/* Email with OTP Button */}
        <div style={{ position: 'relative' }}>
          <Mail size={14} style={iconStyle} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => handleEmailChange(e.target.value)}
              disabled={otpStep === 'verified'}
              style={{
                ...inputStyle(errors.email),
                borderTopRightRadius: '0', borderBottomRightRadius: '0',
                borderRight: 'none', flex: 1,
                opacity: otpStep === 'verified' ? 0.6 : 1,
              }}
              onFocus={e => { e.target.style.borderColor = '#4dc8f0'; }}
              onBlur={e => { e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; }}
            />
            {otpStep === 'verified' ? (
              <div style={{
                padding: '10px 10px', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)', borderTopRightRadius: '12px',
                borderBottomRightRadius: '12px', display: 'flex', alignItems: 'center',
                gap: '4px', color: '#34d399', fontSize: '11px', fontWeight: 700,
                whiteSpace: 'nowrap', height: '40px'
              }}>
                <ShieldCheck size={14} /> Verified
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpStep === 'sending' || !form.email.trim()}
                style={{
                  padding: '10px 12px', background: 'rgba(77,200,240,0.12)',
                  border: '1px solid rgba(77,200,240,0.3)', borderTopRightRadius: '12px',
                  borderBottomRightRadius: '12px', color: '#4dc8f0', fontSize: '11px',
                  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '4px', height: '40px',
                  transition: 'all 0.2s',
                  opacity: (otpStep === 'sending' || !form.email.trim()) ? 0.4 : 1,
                }}
              >
                {otpStep === 'sending' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={12} />}
                {otpStep === 'sending' ? 'Sending' : otpStep === 'sent' ? 'Resend' : 'Verify'}
              </button>
            )}
          </div>
          {errors.email && <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{errors.email}</span>}
        </div>

        {/* OTP Input Section */}
        <AnimatePresence>
          {(otpStep === 'sent' || otpStep === 'verifying') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'rgba(77,200,240,0.05)', border: '1px solid rgba(77,200,240,0.15)',
                borderRadius: '12px', padding: '14px', marginBottom: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ShieldCheck size={14} style={{ color: '#4dc8f0' }} />
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Enter 6-digit code</span>
                </div>
                {/* 6 digit boxes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      ref={el => (otpInputRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1}
                      value={otpCode[i] || ''}
                      onChange={e => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      disabled={otpStep === 'verifying'}
                      style={{
                        width: '36px', height: '40px', textAlign: 'center', fontSize: '16px',
                        fontWeight: 700, borderRadius: '8px', outline: 'none',
                        background: '#0a1929',
                        border: `2px solid ${otpError ? 'rgba(239,68,68,0.5)' : otpCode[i] ? 'rgba(77,200,240,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        color: otpError ? '#f87171' : '#4dc8f0',
                        transition: 'all 0.2s',
                        opacity: otpStep === 'verifying' ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
                {otpError && <p style={{ color: '#f87171', fontSize: '10px', textAlign: 'center', margin: '0 0 8px' }}>{otpError}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    {otpCountdown > 0 ? (
                      <span>Resend in <span style={{ color: '#4dc8f0', fontWeight: 600 }}>{formatCountdown(otpCountdown)}</span></span>
                    ) : canResend ? (
                      <button type="button" onClick={handleSendOtp} style={{
                        background: 'none', border: 'none', color: '#4dc8f0', fontSize: '10px',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
                      }}>
                        <RefreshCw size={10} /> Resend
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button" onClick={() => handleVerifyOtp()}
                    disabled={otpCode.length !== 6 || otpStep === 'verifying'}
                    style={{
                      padding: '6px 14px', background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
                      border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: '4px', opacity: (otpCode.length !== 6 || otpStep === 'verifying') ? 0.4 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {otpStep === 'verifying' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
                    {otpStep === 'verifying' ? 'Verifying' : 'Verify'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verified badge */}
        {otpStep === 'verified' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px'
          }}>
            <ShieldCheck size={14} style={{ color: '#34d399' }} />
            <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 600 }}>
              ✅ Email verified
            </span>
          </div>
        )}

        {/* Phone */}
        {!(otpStep === 'sent' || otpStep === 'verifying') && (
          <>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <fieldset style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                background: errors.phone ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${errors.phone ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px',
                padding: '0',
                transition: 'border-color 0.2s',
                overflow: 'visible'
              }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }} ref={countryRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    onKeyDown={handleCountryKeyDown}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: 'none',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      padding: '10px 8px 10px 12px',
                      color: 'white',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      height: '40px'
                    }}
                  >
                    {selectedCountry.flag} <span style={{ fontWeight: 600 }}>{selectedCountry.code}</span>
                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                  </button>
                  <AnimatePresence>
                    {isCountryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '280px',
                          maxHeight: '240px',
                          background: '#0a1929',
                          border: '1px solid rgba(77,200,240,0.2)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                          zIndex: 50,
                          marginTop: '4px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Search size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                            <input
                              placeholder="Search..."
                              value={searchCountry}
                              onChange={(e) => setSearchCountry(e.target.value)}
                              autoFocus
                              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '12px', width: '100%' }}
                            />
                          </div>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }} className="raga-scroll">
                          {filteredCountries.map((c, idx) => (
                            <button
                              key={`${c.name}-${c.code}`}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }}
                              onMouseEnter={() => setActiveCountryIndex(idx)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: activeCountryIndex === idx ? 'rgba(77, 200, 240, 0.15)' : 'transparent',
                                border: 'none',
                                color: activeCountryIndex === idx ? '#4dc8f0' : 'white',
                                fontSize: '12px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{c.flag}</span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{c.name}</span>
                              </div>
                              <span style={{ opacity: 0.5, fontWeight: 600 }}>{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', color: '#4dc8f0', opacity: 0.7 }} />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 32px',
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '13px',
                      outline: 'none',
                      height: '40px'
                    }}
                    onFocus={e => { e.target.parentElement.parentElement.style.borderColor = '#4dc8f0'; }}
                    onBlur={e => { e.target.parentElement.parentElement.style.borderColor = errors.phone ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </fieldset>
            </div>
            {errors.phone && <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '-8px', display: 'block', marginLeft: '4px' }}>{errors.phone}</span>}

            {/* Inquiry */}
            <div style={{ position: 'relative' }}>
              <FileText size={14} style={{ ...iconStyle, top: '16px', transform: 'none' }} />
              <textarea
                placeholder="Describe your project or requirement..."
                value={form.inquiry}
                onChange={e => { setForm(p => ({ ...p, inquiry: e.target.value })); if (errors.inquiry) setErrors(p => ({ ...p, inquiry: '' })); }}
                rows={3}
                style={{ ...inputStyle(errors.inquiry), paddingTop: '10px', resize: 'none', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = '#4dc8f0'; }}
                onBlur={e => { e.target.style.borderColor = errors.inquiry ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; }}
              />
              {errors.inquiry && <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{errors.inquiry}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpStep !== 'verified'}
              style={{
                width: '100%', padding: '12px',
                background: (isSubmitting || otpStep !== 'verified') ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #0992C2, #4dc8f0)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '14px', fontWeight: 700,
                cursor: (isSubmitting || otpStep !== 'verified') ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.3s',
              }}
            >
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Send size={16} />
                </motion.div>
              ) : otpStep !== 'verified' ? (
                <>
                  <ShieldCheck size={16} />
                  Verify Email to Submit
                </>
              ) : (
                <>
                  Submit Inquiry
                  <Send size={16} />
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.form>
  );
};

// ─── Main Raga Chatbot Component ─────────────────────────────
const RagaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sessionToken, setSessionToken, sessionId, setSessionId } = useSession();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [childSessionId, setChildSessionId] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Personalized welcome message (Now from Server)
  useEffect(() => {
    const fetchGreeting = async () => {
      if (isOpen && messages.length === 0) {
        setIsTyping(true);
        try {
          // We call raga.php with a special 'greeting' trigger
          const resp = await fetch(RAGA_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'GREETING_TRIGGER', // Special hidden trigger
              session_token: sessionToken,
              is_greeting: true
            }),
          });
          const data = await resp.json();
          if (data.success) {
            // Clean any leaked [ACTION:SHOW_FORM] from greeting
            let cleanReply = (data.reply || '').replace(/\[ACTION:SHOW_FORM\]/gi, '').trim();
            setMessages([{
              id: 'welcome',
              text: cleanReply,
              isUser: false,
              options: data.options,
              showInquiryButton: data.show_form || false,
            }]);
            // Don't auto-open form from greeting; show button instead
          } else {
            throw new Error('Defaulting to generic welcome');
          }
        } catch (err) {
          setMessages([{
            id: 'welcome',
            text: "Hi, I'm Raga — your Alphenex AI assistant! 👋\n\nHow can I help you today? Whether you want to know about our services, discuss a project, or get a custom quote — I'm here to help.",
            isUser: false,
          }]);
        } finally {
          setIsTyping(false);
        }
      }
    };

    fetchGreeting();

    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-Open chatbot on every site visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500); // Wait 2.5s for page to load
    return () => clearTimeout(timer);
  }, []);

  // Send message to backend
  const sendMessage = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : inputValue).trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // ... same sendMessage logic ...
      const resp = await fetch(RAGA_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_token: sessionToken,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        if (data.session_token) setSessionToken(data.session_token);
        if (data.session_id) setSessionId(data.session_id);
        // Clean any leaked [ACTION:SHOW_FORM] from AI reply text
        let cleanReply = (data.reply || '').replace(/\[ACTION:SHOW_FORM\]/gi, '').trim();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: cleanReply,
          isUser: false,
          options: data.options,
          showInquiryButton: data.show_form || false,
        }]);
        if (!isOpen) setHasNewMessage(true);
        if (data.show_form) {
          // Don't auto-open form; user clicks the "Start Inquiry" button in the message
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again or click the Start Inquiry button below so our team can help you immediately.",
        isUser: false,
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, sessionToken, isTyping, isOpen]);

  // Submit lead form
  const handleLeadSubmit = async (formDataInput, isConfirmed = false) => {
    const formData = formDataInput;
    // Step 1: Check for existing lead before proceeding
    if (!isConfirmed && !childSessionId) {
      try {
        const checkResp = await fetch(RAGA_LEAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check_existing',
            session_token: sessionToken,
            session_id: sessionId
          }),
        });
        const checkResult = await checkResp.json();
        setExistingUserName(checkResult.exists ? checkResult.name : '');
        if (checkResult.exists) {
          setExistingUserName(checkResult.name || 'there');
          setTempLeadData(formData);
          setShowConfirmModal(true);
          return;
        }
      } catch (err) {
        console.error("Check failed", err);
      }
    }

    setIsSubmittingLead(true);
    // Use the explicitly passed formData or fallback to temp
    const activeData = formData || tempLeadData;
    if (!activeData) return;

    try {
      const currentChildId = childSessionId || (isConfirmed ? `child_${Date.now()}` : '');

      const resp = await fetch(RAGA_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          session_id: sessionId,
          child_session_id: currentChildId,
          name: activeData.name,
          email: activeData.email,
          phone: activeData.phone,
          inquiry: activeData.inquiry,
          otp_id: activeData.otp_id || 0,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        sessionStorage.setItem('alphenex_inquiry_submitted', 'true');
        setShowLeadForm(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `✅ ${data.message}\n\nI've shared your details with our team. Meanwhile, feel free to ask me anything else!`,
          isUser: false,
        }]);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, I couldn't submit your details. Please try again or email us at alphenex.informatic@alphenex.com",
        isUser: false,
        isError: true,
      }]);
      setShowLeadForm(false);
    } finally {
      setIsSubmittingLead(false);
      setShowConfirmModal(false);
      setChildSessionId('');
    }
  };

  const handleContinueNewInquiry = (formData) => {
    const newChildId = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setChildSessionId(newChildId);
    // Intersection will trigger another call via useEffect or direct pass
    // For Raga, I'll use a direct pass-through if possible or local ref
  };

  // Re-trigger submit once child ID is generated
  // Note: We need the form data. I'll store it in a temporary state if needed.
  const [tempLeadData, setTempLeadData] = useState(null);

  const startContinue = () => {
    const newChildId = `child_${Date.now()}`;
    setChildSessionId(newChildId);
    handleLeadSubmit(tempLeadData, true);
  };

  const handleSkip = () => {
    setShowConfirmModal(false);
    setShowLeadForm(false);
    setTempLeadData(null);
  };



  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ─── Floating Launcher Button ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open Raga Chatbot"
            style={{
              position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
              width: '62px', height: '62px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(9,146,194,0.45), 0 0 0 4px rgba(9,146,194,0.1)',
              overflow: 'visible',
            }}
          >
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                border: '2px solid rgba(77,200,240,0.5)',
              }}
            />
            <Sparkles size={28} color="white" />
            {/* Notification dot */}
            {hasNewMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#ef4444', border: '2px solid #020c1b',
                }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', bottom: '20px', right: '20px', zIndex: 10001,
              width: '380px', maxWidth: 'calc(100vw - 24px)',
              height: '560px', maxHeight: 'calc(100vh - 40px)',
              borderRadius: '24px', overflow: 'hidden',
              background: '#0a1929',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(9,146,194,0.1)',
              display: 'flex', flexDirection: 'column',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* ─── Header ─── */}
            <div style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, rgba(9,146,194,0.15), rgba(77,200,240,0.05))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(9,146,194,0.35)',
                }}>
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Raga</h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0, fontWeight: 500 }}>Alphenex AI Assistant</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Inquiry CTA */}
                {!showLeadForm && (
                  <button
                    onClick={() => setShowLeadForm(true)}
                    style={{
                      background: 'rgba(9,146,194,0.15)', border: '1px solid rgba(9,146,194,0.3)',
                      borderRadius: '10px', color: '#4dc8f0', fontSize: '11px', fontWeight: 700,
                      padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(9,146,194,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,146,194,0.15)'; }}
                  >
                    Start Inquiry
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', color: 'rgba(255,255,255,0.5)',
                    width: '32px', height: '32px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ─── Body: Messages or Lead Form ─── */}
            <AnimatePresence mode="wait">
              {/* Confirmation Modal (Hierarchical/Resubmission) */}
              <AnimatePresence>
                {showConfirmModal && (
                  <div style={{
                    position: 'fixed', inset: 0, zIndex: 10001,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px'
                  }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      style={{
                        position: 'relative', width: '100%', maxWidth: '400px',
                        backgroundColor: '#020c1b', border: '1px solid rgba(77,200,240,0.3)',
                        borderRadius: '24px', padding: '32px', textAlign: 'center',
                        boxShadow: '0 0 60px rgba(0,0,0,0.5)'
                      }}
                    >
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Hi {existingUserName}!</h2>
                      <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                        You already have submitted and received an invitation mail. <br />
                        Do you want to re-enter your new requirement details?
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                          onClick={startContinue}
                          disabled={isSubmittingLead}
                          style={{
                            height: '48px', backgroundColor: '#4dc8f0', color: '#020c1b',
                            fontSize: '14px', fontWeight: 'bold', borderRadius: '12px',
                            border: 'none', cursor: 'pointer', transition: '0.3s'
                          }}
                        >
                          {isSubmittingLead ? 'Processing...' : 'Continue with new Inquiry'}
                        </button>
                        <button
                          onClick={handleSkip}
                          style={{
                            height: '48px', backgroundColor: 'transparent', color: 'white',
                            fontSize: '14px', fontWeight: '500', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                          }}
                        >
                          Skip & explore
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {showLeadForm ? (
                <LeadForm
                  key="lead-form"
                  onSubmit={handleLeadSubmit}
                  onBack={() => setShowLeadForm(false)}
                  isSubmitting={isSubmittingLead}
                  sessionToken={sessionToken}
                />
              ) : (
                <motion.div
                  key="chat-area"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  {/* Messages Area */}
                  <div style={{
                    flex: 1, overflowY: 'auto', padding: '16px',
                    scrollBehavior: 'smooth',
                  }} className="raga-scroll">
                    {messages.map(msg => (
                      <ChatBubble
                        key={msg.id}
                        msgObj={msg}
                        onAction={() => setShowLeadForm(true)}
                        onOptionClick={(opt) => sendMessage(opt)}
                      />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div style={{
                    padding: '12px 14px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(0,0,0,0.2)',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px', padding: '4px 4px 4px 14px',
                    }}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        maxLength={1000}
                        style={{
                          flex: 1, background: 'transparent', border: 'none',
                          outline: 'none', color: 'white', fontSize: '13px',
                          padding: '8px 0',
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        aria-label="Send message"
                        style={{
                          width: '36px', height: '36px', borderRadius: '12px',
                          background: inputValue.trim() && !isTyping
                            ? 'linear-gradient(135deg, #0992C2, #4dc8f0)'
                            : 'rgba(255,255,255,0.05)',
                          border: 'none', cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', flexShrink: 0,
                        }}
                      >
                        <Send size={15} color={inputValue.trim() && !isTyping ? 'white' : 'rgba(255,255,255,0.3)'} />
                      </button>
                    </div>
                    <p style={{
                      textAlign: 'center', color: 'rgba(255,255,255,0.2)',
                      fontSize: '10px', margin: '6px 0 0', fontWeight: 500,
                    }}>
                      Powered by Alphenex Informatic
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Global Widget Styles ─── */}
      <style>{`
        .raga-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .raga-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .raga-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .raga-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        input::placeholder, textarea::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </>
  );
};

export default RagaChatbot;

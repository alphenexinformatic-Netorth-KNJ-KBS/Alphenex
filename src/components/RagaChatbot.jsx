import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, User, Mail, Phone, FileText, Check, AlertCircle, Sparkles, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { allCountries } from '../data/Countries';
import { useSession } from '../context/SessionContext';

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
  const { text, isUser, isError, options } = msgObj;

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
        {text}

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
const LeadForm = ({ onSubmit, onBack, isSubmitting }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', inquiry: '' });
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(allCountries.find(c => c.name === 'India') || allCountries[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1);
  const countryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    // Either Email OR Phone must be provided
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
        // Strictly validate length matching country rules
        if (purePhone.length !== expectedLength) {
          e.phone = `For ${selectedCountry.name}, phone number must be exactly ${expectedLength} digits.`;
        }
      }
    }

    if (!form.inquiry.trim()) e.inquiry = 'Please describe your requirement';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format as +Code-PhoneNumber as requested
      const finalPhone = `${selectedCountry.code}-${form.phone.replace(/\D/g, '')}`;
      onSubmit({ ...form, phone: finalPhone });
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

        {/* Email */}
        <div style={{ position: 'relative' }}>
          <Mail size={14} style={iconStyle} />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => { setForm(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
            style={inputStyle(errors.email)}
            onFocus={e => { e.target.style.borderColor = '#4dc8f0'; }}
            onBlur={e => { e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; }}
          />
          {errors.email && <span style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{errors.email}</span>}
        </div>

        {/* Phone */}
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
                  height: '40px'
                }}
              >
                <span style={{ fontSize: '16px' }}>{selectedCountry.flag}</span>
                <span style={{ fontWeight: 600 }}>{selectedCountry.code}</span>
                <ChevronDown size={12} style={{ opacity: 0.5, transform: isCountryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              </button>

              <AnimatePresence>
                {isCountryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '45px',
                      left: '0',
                      width: '240px',
                      maxHeight: '200px',
                      background: '#0d2137',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      zIndex: 100,
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
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '12px',
            background: isSubmitting ? 'rgba(9,146,194,0.4)' : 'linear-gradient(135deg, #0992C2, #4dc8f0)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: 700, cursor: isSubmitting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.3s',
          }}
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Send size={16} />
            </motion.div>
          ) : (
            <>
              <Send size={16} />
              Submit Inquiry
            </>
          )}
        </button>
      </div>
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
            setMessages([{
              id: 'welcome',
              text: data.reply,
              isUser: false,
              options: data.options
            }]);
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

  // Auto-Open for first-time visitors
  useEffect(() => {
    const hasAutoOpened = localStorage.getItem('raga_auto_opened');
    if (!hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('raga_auto_opened', 'true');
      }, 2500); // Wait 2.5s for page to load
      return () => clearTimeout(timer);
    }
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
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: data.reply,
          isUser: false,
          options: data.options, // Suggestions from AI
        }]);
        if (!isOpen) setHasNewMessage(true);
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
  const handleLeadSubmit = async (formData, isConfirmed = false) => {
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
        }),
      });

      const data = await resp.json();

      if (data.success) {
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

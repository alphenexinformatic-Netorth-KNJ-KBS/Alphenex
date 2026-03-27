import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

// Comprehensive Country List
const allCountries = [
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: '+213', flag: '🇩🇿' },
  { name: 'Andorra', code: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: '+244', flag: '🇦🇴' },
  { name: 'Antigua and Barbuda', code: '+1', flag: '🇦🇬' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: '+374', flag: '🇦🇲' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Austria', code: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: '+994', flag: '🇦🇿' },
  { name: 'Bahamas', code: '+1', flag: '🇧🇸' },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Barbados', code: '+1', flag: '🇧🇧' },
  { name: 'Belarus', code: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪' },
  { name: 'Belize', code: '+501', flag: '🇧🇿' },
  { name: 'Benin', code: '+229', flag: '🇧🇯' },
  { name: 'Bhutan', code: '+975', flag: '🇧🇹' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: '+267', flag: '🇧🇼' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Brunei', code: '+673', flag: '🇧🇳' },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Burundi', code: '+257', flag: '🇧🇮' },
  { name: 'Cambodia', code: '+855', flag: '🇰🇭' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Cape Verde', code: '+238', flag: '🇨🇻' },
  { name: 'Central African Republic', code: '+236', flag: '🇨🇫' },
  { name: 'Chad', code: '+235', flag: '🇹🇩' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Comoros', code: '+269', flag: '🇰🇲' },
  { name: 'Congo', code: '+242', flag: '🇨🇬' },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  { name: 'Croatia', code: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: '+53', flag: '🇨🇺' },
  { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
  { name: 'Dominica', code: '+1', flag: '🇩🇲' },
  { name: 'Dominican Republic', code: '+1', flag: '🇩🇴' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'El Salvador', code: '+503', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
  { name: 'Eritrea', code: '+291', flag: '🇪🇷' },
  { name: 'Estonia', code: '+372', flag: '🇪🇪' },
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { name: 'Fiji', code: '+679', flag: '🇫🇯' },
  { name: 'Finland', code: '+358', flag: '🇫🇮' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Gabon', code: '+241', flag: '🇬🇦' },
  { name: 'Gambia', code: '+220', flag: '🇬🇲' },
  { name: 'Georgia', code: '+995', flag: '🇬🇪' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Greece', code: '+30', flag: '🇬🇷' },
  { name: 'Grenada', code: '+1', flag: '🇬🇩' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { name: 'Guinea', code: '+224', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: '+245', flag: '🇬🇼' },
  { name: 'Guyana', code: '+592', flag: '🇬🇾' },
  { name: 'Haiti', code: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: '+504', flag: '🇭🇳' },
  { name: 'Hungary', code: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: '+354', flag: '🇮🇸' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: '+1', flag: '🇯🇲' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: '+7', flag: '🇰🇿' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Kiribati', code: '+686', flag: '🇰🇮' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: '+996', flag: '🇰🇬' },
  { name: 'Laos', code: '+856', flag: '🇱🇦' },
  { name: 'Latvia', code: '+371', flag: '🇱🇻' },
  { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { name: 'Lesotho', code: '+266', flag: '🇱🇸' },
  { name: 'Liberia', code: '+231', flag: '🇱🇷' },
  { name: 'Libya', code: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: '+423', flag: '🇱🇮' },
  { name: 'Lithuania', code: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  { name: 'Macedonia', code: '+389', flag: '🇲🇰' },
  { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
  { name: 'Malawi', code: '+265', flag: '🇲🇼' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { name: 'Maldives', code: '+960', flag: '🇲🇻' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' },
  { name: 'Malta', code: '+356', flag: '🇲🇹' },
  { name: 'Marshall Islands', code: '+692', flag: '🇲🇭' },
  { name: 'Mauritania', code: '+222', flag: '🇲🇷' },
  { name: 'Mauritius', code: '+230', flag: '🇲🇺' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Micronesia', code: '+691', flag: '🇫🇲' },
  { name: 'Moldova', code: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: '+377', flag: '🇲🇨' },
  { name: 'Mongolia', code: '+976', flag: '🇲🇳' },
  { name: 'Montenegro', code: '+382', flag: '🇲🇪' },
  { name: 'Morocco', code: '+212', flag: '🇲🇦' },
  { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
  { name: 'Myanmar', code: '+95', flag: '🇲🇲' },
  { name: 'Namibia', code: '+264', flag: '🇳🇦' },
  { name: 'Nauru', code: '+674', flag: '🇳🇷' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  { name: 'Niger', code: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'North Korea', code: '+850', flag: '🇰🇵' },
  { name: 'Norway', code: '+47', flag: '🇳🇴' },
  { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Palau', code: '+680', flag: '🇵🇼' },
  { name: 'Panama', code: '+507', flag: '🇵🇦' },
  { name: 'Papua New Guinea', code: '+675', flag: '🇵🇬' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { name: 'Romania', code: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', code: '+1', flag: '🇰🇳' },
  { name: 'Saint Lucia', code: '+1', flag: '🇱🇨' },
  { name: 'Saint Vincent', code: '+1', flag: '🇻🇨' },
  { name: 'Samoa', code: '+685', flag: '🇼🇸' },
  { name: 'San Marino', code: '+378', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', code: '+239', flag: '🇸🇹' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Senegal', code: '+221', flag: '🇸🇳' },
  { name: 'Serbia', code: '+381', flag: '🇷🇸' },
  { name: 'Seychelles', code: '+248', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: '+421', flag: '🇸🇰' },
  { name: 'Slovenia', code: '+386', flag: '🇸🇮' },
  { name: 'Solomon Islands', code: '+677', flag: '🇸🇧' },
  { name: 'Somalia', code: '+252', flag: '🇸🇴' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { name: 'South Sudan', code: '+211', flag: '🇸🇸' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: '+249', flag: '🇸🇩' },
  { name: 'Suriname', code: '+597', flag: '🇸🇷' },
  { name: 'Swaziland', code: '+268', flag: '🇸🇿' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Syria', code: '+963', flag: '🇸🇾' },
  { name: 'Taiwan', code: '+886', flag: '🇹🇼' },
  { name: 'Tajikistan', code: '+992', flag: '🇹🇯' },
  { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Timor-Leste', code: '+670', flag: '🇹🇱' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Tonga', code: '+676', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', code: '+1', flag: '🇹🇹' },
  { name: 'Tunisia', code: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  { name: 'Turkmenistan', code: '+993', flag: '🇹🇲' },
  { name: 'Tuvalu', code: '+688', flag: '🇹🇻' },
  { name: 'Uganda', code: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: '+998', flag: '🇺🇿' },
  { name: 'Vanuatu', code: '+678', flag: '🇻🇺' },
  { name: 'Vatican City', code: '+379', flag: '🇻🇦' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { name: 'Yemen', code: '+967', flag: '🇾🇪' },
  { name: 'Zambia', code: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' }
];

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

    // Phone length validation (digits only, 7–15 per ITU standard)
    // Phone length validation (digits only, ITU standard adapted to max 13)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 7) newErrors.phone = 'Phone number is too short';
      else if (digitsOnly.length > 13) newErrors.phone = 'Max 13 digits allowed';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Needed', description: 'Please check your information.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    startLoading();
    const finalPhone = `${selectedCountry.code}${formData.phone.replace(/\D/g, '')}`;
    const submissionData = { ...formData, phone: finalPhone };

    // Use a environment variable if defined for local testing, otherwise default to relative path
    const API_URL = import.meta.env.VITE_API_BASE_URL || '/submit_inquiry.php';

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
      } else {
        throw new Error(result.message || 'Server error');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Connection failed. Please WhatsApp us directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

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
    </form>
  );
}

export default ContactForm;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, Calendar, Rocket, ArrowRight, ExternalLink, Shield, Clock, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Route protection: only accessible after form submission
  useEffect(() => {
    const submitted = sessionStorage.getItem('alphenex_inquiry_submitted');
    if (!submitted) {
      navigate('/', { replace: true });
    } else {
      setIsAuthorized(true);
      // Clear the flag after reading so refreshing redirects too
      sessionStorage.removeItem('alphenex_inquiry_submitted');
    }
  }, [navigate]);

  if (!isAuthorized) return null;

  const steps = [
    { icon: <Check size={20} />, title: "Inquiry Received", description: "Your details are securely stored", status: "completed" },
    { icon: <Mail size={20} />, title: "Invitation En Route", description: "Check your inbox shortly", status: "active" },
    { icon: <Calendar size={20} />, title: "Strategy Session", description: "Personalized growth plan", status: "pending" },
    { icon: <Rocket size={20} />, title: "Growth Begins", description: "Your journey starts here", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-[#020c1b] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0992C2]/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4dc8f0]/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <motion.div 
          animate={{ x: [-100, 100], opacity: [0, 0.4, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[2px] h-[300px] bg-gradient-to-b from-transparent via-[#4dc8f0] to-transparent rotate-45 blur-sm"
        />
      </div>

      <div className="max-w-4xl w-full z-10">
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#4dc8f0] to-transparent opacity-50" />

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
            className="relative w-28 h-28 mx-auto mb-10"
          >
            <div className="absolute inset-0 bg-[#4dc8f0]/20 rounded-full blur-2xl animate-ping" />
            <div className="relative w-full h-full bg-gradient-to-br from-[#0992C2] to-[#4dc8f0] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(77,200,240,0.4)]">
              <Check size={52} className="text-white" strokeWidth={3} />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 text-[#4dc8f0]"
            >
              <Shield size={24} />
            </motion.div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Thank You for Choosing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0992C2] to-[#4dc8f0]">
              Alphenex
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto mb-12">
            Your inquiry has been securely received by our team. We are committed to building a 
            high-impact, value-driven partnership that drives measurable results for your business.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-[1px] w-16 bg-white/10" />
            <span className="text-[#4dc8f0] text-xs font-black uppercase tracking-[0.3em]">What Happens Next</span>
            <div className="h-[1px] w-16 bg-white/10" />
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 px-4">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (idx * 0.15) }}
                className="relative flex flex-col items-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500
                  ${step.status === 'completed' ? 'bg-[#0992C2] text-white shadow-[0_4px_20px_rgba(9,146,194,0.3)]' : 
                    step.status === 'active' ? 'bg-[#4dc8f0]/20 text-[#4dc8f0] ring-2 ring-[#4dc8f0]/40 animate-pulse' : 
                    'bg-white/5 text-gray-600'}`}
                >
                  {step.icon}
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1
                  ${step.status === 'active' ? 'text-white' : step.status === 'completed' ? 'text-[#4dc8f0]' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-gray-600 font-medium">{step.description}</p>
                
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[1px] bg-white/5" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Email Notice Box */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-[#0992C2]/5 border border-[#0992C2]/20 rounded-3xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center gap-6 text-left"
          >
            <div className="w-16 h-16 bg-[#0992C2]/20 rounded-2xl flex items-center justify-center shrink-0">
              <Mail className="text-[#4dc8f0]" size={32} />
            </div>
            <div>
              <h4 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                Invitation Email on the Way
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                A calendar invitation will arrive in your inbox within the next few minutes. 
                Please use it to schedule your <strong className="text-white">Strategic Growth Session</strong> with our expert team.
              </p>
            </div>
          </motion.div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Clock size={20} className="text-[#4dc8f0] mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold mb-1">Response Time</p>
                <p className="text-gray-500 text-xs leading-relaxed">Our team typically responds within 2-4 business hours with a personalized proposal.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <HeadphonesIcon size={20} className="text-[#4dc8f0] mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold mb-1">Need Immediate Help?</p>
                <p className="text-gray-500 text-xs leading-relaxed">Contact us directly via WhatsApp or email at alphenex.informatic@alphenex.com</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full h-16 px-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl transition-all duration-500 font-bold group flex items-center gap-3">
                Back to Home
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/services" className="w-full sm:w-auto">
              <Button className="w-full h-16 px-10 bg-gradient-to-r from-[#0992C2] to-[#4dc8f0] hover:shadow-[0_20px_40px_rgba(77,200,240,0.3)] text-white rounded-2xl transition-all duration-500 font-bold flex items-center gap-3">
                Explore Our Services
                <ExternalLink size={20} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm font-medium mb-2">
            Didn't receive the email? Please check your <strong>spam/promotions folder</strong> or contact us directly via WhatsApp.
          </p>
          <p className="text-xs text-[#4dc8f0]/30 font-bold tracking-[0.2em] uppercase">
            Alphenex Informatic LLP — Precision-Driven Digital Growth
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYou;

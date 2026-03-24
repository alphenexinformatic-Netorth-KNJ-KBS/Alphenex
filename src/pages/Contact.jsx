import React, { useEffect, Suspense, Component } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';
import Contact3DBackground from '@/components/Contact3DBackground';
import { Mail, Clock } from 'lucide-react';

class ContactErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Contact 3D Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />
      );
    }
    return this.props.children;
  }
}

function Contact() {
  const location = useLocation();
  useEffect(() => {
    // Handle scroll if navigating from another page with hash or specific instruction
    if (location.hash === '#contact-section') {
      const element = document.getElementById('contact-section');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  }, [location]);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Alphenex Informatic",
    "email": "info@alphenex.com",
    "openingHours": "Mo-Fr 09:00-18:00",
    "url": "https://alphenex.com/contact",
    "priceRange": "$$$"
  };
  
  return (
    <>
      <Helmet>
        <title>Contact Us - Alphenex Informatic | Get In Touch</title>
        <meta name="description" content="Contact Alphenex Informatic to discuss how we can elevate your social media presence with our expert marketing services. Reach out today!" />
        <meta name="keywords" content="contact alphenex, marketing inquiry, social media consultation, hire marketing agency" />
        <link rel="canonical" href="https://alphenex.com/contact" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>
        {/* Page Header with 3D Background */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <ContactErrorBoundary>
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#020c1b] to-[#051628]" />}>
              <Contact3DBackground />
            </Suspense>
          </ContactErrorBoundary>

          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#020c1b] via-[#020c1b]/50 to-transparent pointer-events-none" />

          <div className="container relative z-10 px-4 text-center mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight"
            >
              Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4dc8f0] to-[#0992C2]">Touch</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            >
              Let's discuss how we can elevate your social media presence and drive real results for your business.
            </motion.p>
          </div>
        </section>

        <div className="bg-gradient-to-b from-[#020c1b] to-[#051628] py-20 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0992C2]/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dc8f0]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <motion.div id="contact-section" initial={{
              opacity: 0,
              x: -30
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-[0_0_40px_rgba(9,146,194,0.1)] p-8 md:p-12 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#0992C2]/10 rounded-full blur-3xl -z-10"></div>
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Send Us a Message
                  </h2>
                  <ContactForm />
                </div>
              </motion.div>

              {/* Contact Information Sidebar */}
              <motion.div initial={{
              opacity: 0,
              x: 30
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.4
            }} className="space-y-6">
                {/* Contact Info Card */}
                <div className="bg-gradient-to-br from-[#0992C2]/20 to-[#0773A0]/20 rounded-3xl shadow-xl p-8 text-white border border-[#0992C2]/30 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051628]/80 to-transparent z-0 pointer-events-none"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
                    
                    <div className="space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(9,146,194,0.3)]">
                          <Mail size={24} className="text-[#4dc8f0]" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1 text-gray-400 uppercase text-sm tracking-wide">Email</p>
                          <p className="text-white text-base font-medium">info@alphenex.com</p>
                          <p className="text-white text-base font-medium break-all mt-1">alphenexinformatic@gmail.com</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(9,146,194,0.3)]">
                          <Clock size={24} className="text-[#4dc8f0]" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1 text-gray-400 uppercase text-sm tracking-wide">Business Hours</p>
                          <p className="text-white">Monday - Friday</p>
                          <p className="text-white mt-1">9:00 AM - 6:00 PM EST</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-md p-8 border border-white/10 relative overflow-hidden">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Why Choose Us?
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0992C2]/20 border border-[#0992C2]/30 flex items-center justify-center text-[#4dc8f0]">
                        <span className="font-bold text-xs">✓</span>
                      </div>
                      <span className="text-sm">Expert team with proven results</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0992C2]/20 border border-[#0992C2]/30 flex items-center justify-center text-[#4dc8f0]">
                        <span className="font-bold text-xs">✓</span>
                      </div>
                      <span className="text-sm">Data-driven strategies</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0992C2]/20 border border-[#0992C2]/30 flex items-center justify-center text-[#4dc8f0]">
                        <span className="font-bold text-xs">✓</span>
                      </div>
                      <span className="text-sm">Transparent reporting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0992C2]/20 border border-[#0992C2]/30 flex items-center justify-center text-[#4dc8f0]">
                        <span className="font-bold text-xs">✓</span>
                      </div>
                      <span className="text-sm">Dedicated support</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
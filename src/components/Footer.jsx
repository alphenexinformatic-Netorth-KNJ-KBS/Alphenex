
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Clock } from 'lucide-react';
import AlphenexLogo from './AlphenexLogo';

function Footer() {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'LinkedIn', icon: Linkedin, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
  ];

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #051628 0%, #020c1b 100%)',
        borderTop: '1px solid rgba(9,146,194,0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="inline-block mb-2">
              <AlphenexLogo className="h-[48px] w-auto" />
            </Link>
            <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed font-light">
              Empowering brands through innovative campaigns and data-driven systems. We build growth engines that scale.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(9,146,194,0.1)',
                      border: '1px solid rgba(9,146,194,0.2)',
                      color: '#09c4f0',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(9,146,194,0.3)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(9,196,240,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(9,146,194,0.1)';
                      e.currentTarget.style.color = '#09c4f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-sans text-sm text-gray-400 hover:text-[#09c4f0] hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 font-light"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#09c4f0] opacity-50" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-bold text-white mb-6">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex items-start space-x-4 group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{ background: 'rgba(9,146,194,0.1)', border: '1px solid rgba(9,146,194,0.2)', color: '#09c4f0' }}
                >
                  <Mail size={16} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-sans text-sm text-gray-400 font-light">info@alphenex.com</span>
                  <span className="font-sans text-sm text-gray-400 font-light break-all">alphenexinformatic@gmail.com</span>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{ background: 'rgba(9,146,194,0.1)', border: '1px solid rgba(9,146,194,0.2)', color: '#09c4f0' }}
                >
                  <Clock size={16} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-sans text-sm text-gray-400 font-light">Mon - Fri</span>
                  <span className="font-sans text-sm text-gray-400 font-light">9:00 AM - 6:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="font-sans text-sm text-gray-500 font-light tracking-wide">
            &copy; {currentYear} Alphenex Informatic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

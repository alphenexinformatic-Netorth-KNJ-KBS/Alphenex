import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail } from 'lucide-react';
import AlphenexLogo from './AlphenexLogo';

/*
 * framer-motion completely removed from Header.
 * Mobile menu now uses CSS max-height transition — same visual effect, zero JS library cost.
 */

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isHomePage = location.pathname === '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 transition-all duration-500 px-4 pointer-events-none">
      <header
        className={`pointer-events-auto transition-all duration-500 rounded-full w-full ${isScrolled ? 'max-w-5xl py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'max-w-7xl py-3'}`}
        style={{
          background: isScrolled ? 'rgba(2,12,27,0.7)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          border: isScrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="px-6 md:px-8">
          <nav className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center outline-none">
              <div className="flex items-center transition-transform duration-300 hover:scale-[1.02]">
                <AlphenexLogo className="h-[40px] md:h-[48px] w-auto transition-all duration-300" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/blog' && location.pathname.startsWith('/blog'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-sans text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full ${
                      isActive
                        ? 'text-[#09c4f0] bg-[#0992C2]/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pl-4">
                <Link
                  to="/contact"
                  className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(9,146,194,0.4)] hover:-translate-y-0.5 text-white flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #0992C2, #09c4f0)' }}
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className={`md:hidden p-2 rounded-full transition-colors ${isMobileMenuOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>

        {/* Mobile Navigation — CSS max-height transition, no framer-motion */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full left-0 right-0 mt-2 mx-4 rounded-2xl"
          style={{
            maxHeight: isMobileMenuOpen ? '500px' : '0px',
            opacity: isMobileMenuOpen ? 1 : 0,
            background: 'rgba(5,22,40,0.95)',
            backdropFilter: 'blur(20px)',
            border: isMobileMenuOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
            boxShadow: isMobileMenuOpen ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          <div className="py-4 space-y-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#09c4f0] bg-[#0992C2]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 pb-2 mt-2 border-t border-white/10">
              <Link
                to="/contact"
                className="block w-full text-center text-white px-6 py-3.5 rounded-xl text-base font-bold transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #0992C2, #09c4f0)' }}
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;

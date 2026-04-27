/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Scale, Phone } from 'lucide-react';
import { Button } from '../ui/Base';
import { cn } from '../../lib/utils';

export default function Navbar({ onNavigateHome, onNavigateDashboard }: { onNavigateHome?: () => void, onNavigateDashboard?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigateHome?.();
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between border-b transition-all duration-300",
        isScrolled 
          ? "bg-brand-dark border-brand-blue/30 shadow-lg" 
          : "bg-brand-dark/90 backdrop-blur-md border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <button className="flex items-center gap-2 outline-none text-left" onClick={() => onNavigateHome?.()}>
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-xl text-white">e</div>
          <span className="text-xl font-semibold tracking-tight text-white">
            eLawyers<span className="text-blue-400 font-black">BD</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-[13px] font-bold text-white/90">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="hover:text-blue-400 transition-colors uppercase tracking-tight"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold bg-blue-900/50 px-3 py-1.5 rounded-md border border-blue-700/50 text-blue-200">
              <span className="text-blue-400/60 mr-1">CALL:</span> +88 01335230170
            </span>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => onNavigateDashboard?.()}
            >
              Client Login
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden absolute top-full left-0 right-0 bg-brand-dark border-t border-brand-blue/30 p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-white text-base font-bold px-2 py-3 border-b border-white/5 hover:text-blue-400"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                     setIsMobileMenuOpen(false);
                     onNavigateDashboard?.();
                  }}
                >
                  Client Portal Login
                </Button>
                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/30 text-center">
                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Emergency Support</p>
                  <p className="text-white font-bold">+88 01335230170</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

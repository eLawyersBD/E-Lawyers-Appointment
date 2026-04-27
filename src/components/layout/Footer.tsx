/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scale, Facebook, Twitter, Linkedin, Instagram, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                <Scale className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">eLawyers</span>
            </div>
            <p className="text-blue-100/60 leading-relaxed max-w-xs">
              Bangladesh's leading digital platform for legal and tax consultancy. Simplifying compliance for sustainable growth.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Our Services</h4>
            <ul className="space-y-4 text-blue-100/60">
              {['Tax Consultation', 'VAT Support', 'RJSC Filings', 'Trade Licenses', 'Legal Audits'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-amber-500 transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Useful Links</h4>
            <ul className="space-y-4 text-blue-100/60">
              {['Home', 'Services', 'Pricing', 'Why Us', 'Book Now'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-amber-500 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-blue-100/60">
              {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Disclaimer'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-amber-500 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-blue-100/40">
          <p>© {currentYear} eLawyers BD. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

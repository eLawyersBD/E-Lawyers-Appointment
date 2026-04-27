/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES } from '../../constants';
import { Button } from '../ui/Base';
import { FileText, Briefcase, Landmark, Shield, Clock, TrendingUp, Handshake, Search, X, Facebook, Twitter, Linkedin } from 'lucide-react';

const iconMap: Record<string, any> = {
  'Tax': FileText,
  'VAT': TrendingUp,
  'RJSC': Briefcase,
  'Licensing': Landmark,
  'Audit': Search,
  'Legal': Shield,
  'Corporate': Handshake,
};

export default function Services({ onSelectService, selectedService }: { onSelectService: (service: string, category: string) => void, selectedService?: { category: string, subService: string } }) {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const handleBookNow = (service: any) => {
    setExpandedServiceId(null);
    onSelectService(service.title, service.category);
  };

  return (
    <section id="services" className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Our Expertise</p>
            <h3 className="text-2xl font-black text-brand-dark">Specialized Legal Units</h3>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Nationwide Coverage</p>
                <p className="text-xs font-bold text-brand-dark">All 64 Districts</p>
             </div>
             <div className="w-px h-8 bg-slate-200" />
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Consultations</p>
                <p className="text-xs font-bold text-brand-dark">5000+ Completed</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.category] || Briefcase;
            const isSelected = selectedService?.subService === service.title && selectedService?.category === service.category;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`group p-6 rounded-xl border transition-all duration-300 relative cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50/50 border-blue-500 shadow-lg ring-2 ring-blue-500/20' 
                    : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xl'
                }`}
                onClick={() => setExpandedServiceId(service.id)}
              >
                <div className="absolute top-4 right-4 text-[9px] font-bold bg-white px-2 py-1 rounded border border-slate-100 shadow-sm text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors uppercase">
                   {service.category}
                </div>
                <div className="mb-4 inline-flex p-2 rounded bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-brand-dark mb-2 group-hover:text-blue-600 transition-colors">{service.title}</h4>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-200/50 pt-4 mt-auto">
                   <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {service.duration}
                      </div>
                   </div>
                   <div className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                      Select Service
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {expandedServiceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedServiceId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {SERVICES.map((service) => {
              if (service.id !== expandedServiceId) return null;
              const Icon = iconMap[service.category] || Briefcase;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <button
                      onClick={() => setExpandedServiceId(null)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="inline-block mb-3 text-[10px] font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-blue-600 uppercase tracking-widest">
                      {service.category}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-dark mb-4">{service.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-8">
                       <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {service.duration}
                       </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:block">Share:</span>
                        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')} className="text-slate-400 hover:text-blue-600 transition-colors" title="Share on Facebook">
                          <Facebook className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${service.title} by eLawyersBD`)}`, '_blank', 'width=600,height=400')} className="text-slate-400 hover:text-blue-400 transition-colors" title="Share on Twitter">
                          <Twitter className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')} className="text-slate-400 hover:text-blue-600 transition-colors" title="Share on LinkedIn">
                          <Linkedin className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 sm:gap-3">
                        <Button variant="ghost" onClick={() => setExpandedServiceId(null)}>
                          Close
                        </Button>
                        <Button onClick={() => handleBookNow(service)}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

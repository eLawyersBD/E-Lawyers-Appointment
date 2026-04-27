/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Base';
import { cn } from '../../lib/utils';

const packages = [
  {
    name: 'Basic',
    price: 'Free',
    unit: '/ case',
    description: 'Perfect for individuals and small startups.',
    features: ['One-time consultation', 'Basic document review'],
    highlight: false,
  },
  {
    name: 'Business Standard',
    price: '৳5,000',
    unit: '/ mo',
    description: 'Ideal for growing businesses needing ongoing support.',
    features: ['Monthly Tax Compliance', 'Trade License Renewal', 'RJSC Annual Return', 'Zoom/Meet Meetings', 'VAT Return Filing'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    description: 'Full-service legal & tax department for your firm.',
    features: ['Legal Drafting & Vetting', 'Audit Assistance', 'Dedicated Advocate', 'Contract Management', 'Unlimited Support'],
    highlight: false,
  },
];

export default function Pricing() {
  const scrollToBooking = () => {
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Service Plans</p>
            <h3 className="text-2xl font-black text-brand-dark">Investment in Compliance</h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded border border-slate-100">ANNUAL SAVINGS: 20%</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-xl border flex flex-col transition-all duration-300",
                pkg.highlight 
                ? "border-brand-blue bg-blue-50/50 shadow-lg relative z-10 scale-105" 
                : "border-slate-200 bg-white text-slate-900"
              )}
            >
              <div className="mb-6">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-4",
                  pkg.highlight ? "text-brand-blue" : "text-slate-400"
                )}>{pkg.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-dark">{pkg.price}</span>
                  <span className="text-[11px] font-bold text-slate-400">{pkg.unit}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-8 font-medium leading-relaxed">
                {pkg.description}
              </p>
              <div className="space-y-3 mb-8 flex-1">
                {pkg.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                      pkg.highlight ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Button 
                variant={pkg.highlight ? 'secondary' : 'outline'} 
                className="w-full text-[11px] font-black tracking-widest uppercase py-3"
                onClick={scrollToBooking}
              >
                Select {pkg.name} Plan
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

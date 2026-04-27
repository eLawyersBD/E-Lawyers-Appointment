/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Zap, Users, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Confidential & Secure',
    description: 'Your legal data is protected by strict confidentiality protocols and secure storage.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Zap,
    title: 'Fast Response Time',
    description: 'We value your time. Most queries are addressed within 2 business hours.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'Experienced Professionals',
    description: 'Our team consists of Bar-qualified lawyers and certified tax consultants.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShieldAlert,
    title: 'Nationwide Service',
    description: 'Providing seamless support to businesses and individuals across all 64 districts.',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-3">Commitment to Excellence</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-blue-950 mb-8 leading-tight">
              Why Corporate Legal Teams Trust eLawyers
            </h3>
            
            <div className="space-y-8">
              {reasons.map((reason, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className={`p-4 rounded-2xl h-14 w-14 flex-shrink-0 flex items-center justify-center ${reason.color}`}>
                    <reason.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-950 mb-2">{reason.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800" 
                 alt="Lawyer sign audit" 
                 className="w-full h-[600px] object-cover"
               />
               <div className="absolute inset-0 bg-blue-950/20" />
             </div>
             
             {/* Float Card */}
             <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute top-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden sm:block"
             >
               <div className="text-blue-950 font-black text-4xl mb-1">15+</div>
               <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Years Experience</div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

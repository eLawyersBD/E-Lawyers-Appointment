/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Phone, Mail, MapPin, MessageSquare, Clock } from 'lucide-react';
import { Button, Input, Label } from '../ui/Base';

export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Connect With Us</p>
            <h3 className="text-3xl font-black text-brand-dark mb-6 leading-tight">
               Dedicated Support units <br /> for prompt response.
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Phone, label: 'Hotline', value: '+88 01335230170-81', sub: 'Sun - Thu, 9am - 6pm' },
                { icon: Mail, label: 'Official Enquiries', value: 'info@elawyersbd.com', sub: 'Priority Response' },
                { icon: MessageSquare, label: 'WhatsApp Support', value: '+88 01335230170', sub: 'Instant' },
                { icon: MapPin, label: 'Head Office', value: 'BTI Centara Grand', sub: 'G-5, 144-144/1 Green Road, Dhaka-1205' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300">
                  <item.icon className="w-4 h-4 text-blue-600 mb-3" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-black text-brand-dark mb-1">{item.value}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6">Quick Callback</h4>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input placeholder="Identified Principal" />
                </div>
                <div className="space-y-1">
                  <Label>Phone Identity</Label>
                  <Input placeholder="+8801..." />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Operational Unit</Label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                  <option>Tax / VAT Advisory</option>
                  <option>RJSC Compliance</option>
                  <option>Corporate Litigation</option>
                  <option>Contract Drafting</option>
                </select>
              </div>
              <Button className="w-full py-4 text-xs tracking-widest uppercase">Initiate Protocol</Button>
              <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-slate-400">
                <Clock className="w-3 h-3" />
                ESTIMATED LATENCY: 22 MINUTES
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

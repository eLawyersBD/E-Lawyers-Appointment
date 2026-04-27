/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MousePointerClick, PhoneIncoming, ShieldCheck, Clock, Globe, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { Button } from '../ui/Base';

export default function Hero({ onNavigateDashboard }: { onNavigateDashboard?: () => void }) {
  const scrollToBooking = () => {
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareTitle = "Book Your Legal Consultation with eLawyersBD";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    let popupUrl = '';
    
    switch (platform) {
      case 'facebook':
        popupUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        popupUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        popupUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    if (popupUrl) window.open(popupUrl, '_blank', 'width=600,height=400');
  };

  return (
    <section id="home" className="relative pt-32 pb-12 overflow-hidden bg-brand-dark">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded">
            Legal Technology Platform
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-white leading-[1.1] mb-6">
            Book Your Legal Consultation <br />
            <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">in Minutes</span>
          </h1>
          <p className="text-base text-slate-400 mb-8 max-w-xl leading-relaxed font-medium">
            Professional compliance solutions for Tax, VAT, RJSC, and Corporate Law. 
            Streamlining Bangladesh's legal landscape with speed & accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <Button size="lg" className="w-full sm:w-auto gap-3 text-sm py-4" onClick={scrollToBooking}>
               SUBMIT BOOKING REQUEST <span className="text-blue-400">→</span>
             </Button>
             
             <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mx-2">Share</span>
                <button onClick={() => handleShare('facebook')} className="text-slate-400 hover:text-blue-500 transition-colors" title="Share on Facebook">
                  <Facebook className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('twitter')} className="text-slate-400 hover:text-blue-400 transition-colors" title="Share on Twitter">
                  <Twitter className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('linkedin')} className="text-slate-400 hover:text-blue-600 transition-colors" title="Share on LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-12 max-w-lg mx-auto md:mx-0">
             {[
               { icon: ShieldCheck, title: "Confidential", desc: "100% Privacy" },
               { icon: Globe, title: "Nationwide", desc: "64 Districts" },
               { icon: Clock, title: "Fast", desc: "2hr Response" }
             ].map((item, i) => (
               <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col items-center md:items-start">
                  <item.icon className="w-4 h-4 text-blue-500 mb-2" />
                  <p className="text-[10px] font-black text-white uppercase">{item.title}</p>
                  <p className="text-[9px] text-slate-500 font-bold">{item.desc}</p>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full md:w-[400px] hidden lg:block"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl relative">
             <img 
               src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" 
               alt="Legal Office" 
               className="w-full h-[400px] object-cover rounded-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent flex items-bottom p-6 flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-brand-dark bg-slate-200" />)}
                   </div>
                   <span className="text-[10px] text-white font-bold">500+ Clients Trust Us</span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-yellow-400 text-xs">★★★★★</span>
                   <span className="text-[10px] text-slate-300 font-bold ml-1">4.9/5 RATING</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Scale({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  );
}

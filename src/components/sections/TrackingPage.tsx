import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowLeft, Clock, FileText, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Button, Input, Label } from '../ui/Base';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface TrackingPageProps {
  initialTrackingId: string;
  onBack: () => void;
}

export default function TrackingPage({ initialTrackingId, onBack }: TrackingPageProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const docRef = doc(db, 'bookings', trackingId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResult({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('No booking found with this reference ID. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching your booking status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      handleSearch();
    }
  }, [initialTrackingId]);

  return (
    <section className="py-24 min-h-[80vh] bg-slate-50 flex flex-col items-center">
      <div className="max-w-2xl w-full px-4 md:px-6">
        <Button variant="outline" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-3">Track Your Booking</h1>
            <p className="text-slate-600 text-sm">Enter your booking reference ID to check the current status of your request.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="e.g., A1B2C3D4..." 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full text-lg font-mono text-center tracking-wider"
              />
            </div>
            <Button type="submit" disabled={loading || !trackingId.trim()} className="gap-2 px-8">
              {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Track
            </Button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {result.status === 'Pending' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-700 text-sm font-bold">
                        <Clock className="w-4 h-4" /> Pending
                      </span>
                    ) : result.status === 'Confirmed' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 text-green-700 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-sm font-bold">
                        {result.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Booking Date</p>
                  <p className="font-mono text-sm font-bold text-slate-700">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Booking Details</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Service</Label>
                    <p className="text-sm font-medium text-brand-dark mt-0.5">{result.subService}</p>
                    <p className="text-xs text-slate-500">{result.serviceCategory}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Consultation Type</Label>
                    <p className="text-sm font-medium text-brand-dark mt-0.5">{result.consultationType}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Preferred Date</Label>
                    <p className="text-sm font-medium text-brand-dark mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> {result.date}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Preferred Time</Label>
                    <p className="text-sm font-medium text-brand-dark mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {result.time}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

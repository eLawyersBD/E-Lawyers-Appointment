/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileSearch,
  History,
  FileCheck
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';
import { Button, Input } from '../ui/Base';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Booking, BookingStatus } from '../../types';
import { STAFF_MEMBERS } from '../../constants';

// Reuse StatusBadge from ClientDashboard if possible, but let's define it here for consistency
const StatusBadge = ({ status }: { status: BookingStatus | string }) => {
  const configs: Record<string, { color: string, icon: any, label: string }> = {
    'Pending': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
    'Approved': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Approved' },
    'In-Progress': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: History, label: 'In-Progress' },
    'Completed': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Completed' },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: X, label: 'Cancelled' },
    'Closed': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Lock, label: 'Closed' }
  };

  const config = configs[status] || { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock, label: status };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const Lock = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

interface BookingDetailsData {
  taxFields?: Record<string, any>;
  vatFields?: Record<string, any>;
  rjscFields?: Record<string, any>;
  companyInfo?: Record<string, any>;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'overview'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsData | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBooking = async (id: string, updates: Partial<Booking>) => {
    setIsUpdating(true);
    try {
      const ref = doc(db, 'bookings', id);
      await updateDoc(ref, updates);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsLoading(true);
    setBookingDetails(null);
    try {
      // Fetch from bookingDetails subcollection
      const detailsRef = collection(db, 'bookings', booking.id!, 'bookingDetails');
      const detailsSnap = await getDocs(detailsRef);
      
      if (!detailsSnap.empty) {
        // Assume we take the first doc or merge them
        const data: BookingDetailsData = {};
        detailsSnap.forEach(doc => {
          const docData = doc.data();
          if (docData.taxFields) data.taxFields = { ...data.taxFields, ...docData.taxFields };
          if (docData.vatFields) data.vatFields = { ...data.vatFields, ...docData.vatFields };
          if (docData.rjscFields) data.rjscFields = { ...data.rjscFields, ...docData.rjscFields };
          if (docData.companyInfo) data.companyInfo = { ...data.companyInfo, ...docData.companyInfo };
          // If the fields are at the root of the doc
          if (doc.id === 'tax') data.taxFields = docData;
          if (doc.id === 'vat') data.vatFields = docData;
          if (doc.id === 'rjsc') data.rjscFields = docData;
          if (doc.id === 'company') data.companyInfo = docData;
        });
        setBookingDetails(data);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  const serviceCategories = useMemo(() => {
    const categories = new Set(bookings.map(b => b.serviceCategory));
    return ['All', ...Array.from(categories)];
  }, [bookings]);

  const staffMembers = useMemo(() => {
    return ['All', ...STAFF_MEMBERS];
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = b.name.toLowerCase().includes(query) ||
                           b.subService.toLowerCase().includes(query) ||
                           b.id?.toLowerCase().includes(query) ||
                           b.email.toLowerCase().includes(query) ||
                           b.status.toLowerCase().includes(query);
      
      const matchesService = serviceFilter === 'All' || b.serviceCategory === serviceFilter;
      const matchesStaff = staffFilter === 'All' || b.assignedStaff === staffFilter;

      return matchesSearch && matchesService && matchesStaff;
    });
  }, [bookings, searchQuery, serviceFilter, staffFilter]);

  const getFilenameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const filename = lastPart.split('?')[0].split('_').slice(1).join('_');
      return filename || 'Attached Document';
    } catch {
      return 'Attached Document';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-xl text-white">e</div>
            <span className="text-xl font-semibold tracking-tight">eLawyers<span className="text-blue-400">BD</span></span>
          </div>
          <div className="mt-4 px-3 py-1 bg-blue-900/40 border border-blue-700/50 rounded-md inline-block">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-5 h-5" /> Booking Management
          </button>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Analytics Overview
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-brand-dark tracking-tight">
              {activeTab === 'bookings' ? 'Booking Management' : 'Dashboard Overview'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Manage and review all client requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">System Online</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: bookings.length, color: 'blue' },
                  { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: 'amber' },
                  { label: 'Approved', value: bookings.filter(b => b.status === 'Approved').length, color: 'indigo' },
                  { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, color: 'green' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search ID, Client, Email, Service or Status..." 
                      className="pl-10 h-10 text-[13px] bg-slate-50/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex flex-col">
                      <select 
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="h-10 px-3 pr-8 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      >
                        {serviceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat === 'All' ? 'All Services' : cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-col">
                      <select 
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="h-10 px-3 pr-8 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      >
                        {staffMembers.map(staff => (
                          <option key={staff} value={staff}>{staff === 'All' ? 'All Staff' : staff}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[11px] text-slate-500" onClick={() => {
                    setSearchQuery('');
                    setServiceFilter('All');
                    setStaffFilter('All');
                  }}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Ref ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Client Name</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Service</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Assigned To</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Date & Time</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                            Loading bookings...
                          </td>
                        </tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                            No bookings found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {booking.id?.slice(0, 8)}...
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[13px] font-black text-brand-dark">{booking.name}</p>
                                <p className="text-[10px] text-slate-500">{booking.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-bold text-slate-700">{booking.subService}</p>
                              <p className="text-[10px] text-slate-400">{booking.serviceCategory}</p>
                            </td>
                            <td className="px-6 py-4">
                              {booking.assignedStaff ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                    {booking.assignedStaff.charAt(0)}
                                  </div>
                                  <p className="text-[11px] font-bold text-slate-700">{booking.assignedStaff}</p>
                                </div>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[11px] font-bold text-slate-700">{booking.date}</p>
                              <p className="text-[10px] text-slate-400">{booking.time}</p>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleViewDetails(booking)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
                <LayoutDashboard className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-brand-dark mb-2">Advanced Analytics</h2>
              <p className="text-slate-500 max-w-sm">This module is currently being optimized for peak performance. Coming soon!</p>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-brand-dark text-white border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <FileSearch className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Booking Details</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Reference: {selectedBooking.id}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted on {format(new Date(selectedBooking.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">
                {/* Basic User Info */}
                <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-100">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Client</p>
                        <p className="text-sm font-bold text-brand-dark">{selectedBooking.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">{selectedBooking.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</p>
                        <p className="text-sm font-bold text-brand-dark">{selectedBooking.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Company</p>
                        <p className="text-sm font-bold text-brand-dark">{selectedBooking.companyName || 'Not Provided'}</p>
                        <p className="text-[10px] font-medium text-slate-500">{selectedBooking.city}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Admin Assignment</p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Update Status</label>
                            <select 
                              className="w-full h-8 bg-white border border-slate-200 rounded-lg text-[11px] font-bold px-2 outline-none focus:ring-1 focus:ring-blue-500"
                              value={selectedBooking.status}
                              onChange={(e) => handleUpdateBooking(selectedBooking.id!, { status: e.target.value as BookingStatus })}
                              disabled={isUpdating}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="In-Progress">In-Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Assign Staff</label>
                            <select 
                              className="w-full h-8 bg-white border border-slate-200 rounded-lg text-[11px] font-bold px-2 outline-none focus:ring-1 focus:ring-blue-500"
                              value={selectedBooking.assignedStaff || ''}
                              onChange={(e) => handleUpdateBooking(selectedBooking.id!, { assignedStaff: e.target.value })}
                              disabled={isUpdating}
                            >
                              <option value="">Unassigned</option>
                              {STAFF_MEMBERS.map(staff => (
                                <option key={staff} value={staff}>{staff}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Service Context</h4>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Service Category</p>
                        <p className="text-[13px] font-bold text-brand-dark">{selectedBooking.serviceCategory}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sub-Service</p>
                        <p className="text-[13px] font-bold text-brand-dark">{selectedBooking.subService}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Description</p>
                      <p className="text-[12px] leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        "{selectedBooking.description}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Info from bookingDetails subcollection */}
                {(isDetailsLoading || bookingDetails) && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FileSearch className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Advanced Specification</h4>
                    </div>
                    
                    {isDetailsLoading && (
                      <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-xs text-slate-500 font-bold">Synchronizing with Secure Records...</p>
                      </div>
                    )}

                    {bookingDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookingDetails.taxFields && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px]">TAX</div>
                              <h5 className="text-[11px] font-black uppercase text-slate-700">Tax Information</h5>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(bookingDetails.taxFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-[11px] font-bold text-brand-dark">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {bookingDetails.vatFields && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">VAT</div>
                              <h5 className="text-[11px] font-black uppercase text-slate-700">VAT Details</h5>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(bookingDetails.vatFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-[11px] font-bold text-brand-dark">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {bookingDetails.rjscFields && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px]">RJSC</div>
                              <h5 className="text-[11px] font-black uppercase text-slate-700">RJSC Metadata</h5>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(bookingDetails.rjscFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-[11px] font-bold text-brand-dark">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {bookingDetails.companyInfo && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[10px]">CORP</div>
                              <h5 className="text-[11px] font-black uppercase text-slate-700">Company Intelligence</h5>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(bookingDetails.companyInfo).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-[11px] font-bold text-brand-dark">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Attached Documents */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Verified Documents</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBooking.fileURLs && selectedBooking.fileURLs.length > 0 ? (
                      selectedBooking.fileURLs.map((url, i) => (
                        <a 
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-black text-slate-700 truncate max-w-[160px]">
                                {getFilenameFromUrl(url)}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified Artifact</p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        </a>
                      ))
                    ) : (
                      <div className="md:col-span-2 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Documents Attached</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 h-10 font-black text-[11px]"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close Review
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2 h-10 bg-indigo-600 hover:bg-indigo-700 text-[11px] font-black"
                    onClick={() => window.open(`mailto:${selectedBooking.email}?subject=Regarding your booking ${selectedBooking.id}`)}
                  >
                    Contact Client <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

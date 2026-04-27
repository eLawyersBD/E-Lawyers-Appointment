import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, storage } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Label } from '../ui/Base';
import { LogOut, FileText, CheckCircle2, Clock, Upload, X, Loader2, Calendar as CalendarIcon, User, Save, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { cn } from '../../lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';

export default function ClientDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'calendar'>('bookings');
  const [profile, setProfile] = useState<{ displayName?: string; phone?: string; companyName?: string; address?: string; photoURL?: string }>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings;
    const lowerSearch = searchTerm.toLowerCase();
    return bookings.filter(b => 
      b.subService?.toLowerCase().includes(lowerSearch) || 
      b.service?.toLowerCase().includes(lowerSearch) || 
      b.date?.toLowerCase().includes(lowerSearch) ||
      b.id?.toLowerCase().includes(lowerSearch)
    );
  }, [bookings, searchTerm]);

  const bookingsByDateMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach(b => {
      if (b.date) {
        if (!map[b.date]) map[b.date] = [];
        map[b.date].push(b);
      }
    });
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [currentMonth]);

  const fetchBookings = async () => {
    if (!auth.currentUser?.email) return;
    try {
      const q = query(collection(db, 'bookings'), where('email', '==', auth.currentUser.email));
      const snaps = await getDocs(q);
      const data = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!auth.currentUser?.uid) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
         setProfile(docSnap.data());
      }
    } catch (err) {
       console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchProfile();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Pending':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100">
              <Clock className="w-3 h-3" /> Pending Review
            </span>
            <span className="text-[9px] text-amber-500 font-medium">Awaiting legal team review</span>
          </div>
        );
      case 'Confirmed':
      case 'Approved':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
              <CheckCircle2 className="w-3 h-3" /> {status}
            </span>
            <span className="text-[9px] text-emerald-500 font-medium">Scheduled and ready</span>
          </div>
        );
      case 'Completed':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
            <span className="text-[9px] text-blue-500 font-medium">Session successfully finished</span>
          </div>
        );
      case 'Closed':
      case 'Cancelled':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-200">
              <X className="w-3 h-3" /> {status}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">This booking is inactive</span>
          </div>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
       onLogout();
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser?.uid) return;
    setSavingProfile(true);
    try {
       const userRef = doc(db, 'users', auth.currentUser.uid);
       await updateDoc(userRef, {
          displayName: profile.displayName || '',
          phone: profile.phone || '',
          companyName: profile.companyName || '',
          address: profile.address || ''
       });
       alert('Profile updated successfully!');
    } catch (err) {
       console.error(err);
       alert('Failed to update profile');
    } finally {
       setSavingProfile(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser?.uid) return;

    setUploadingPic(true);
    try {
      const fileRef = ref(storage, `profile_pics/${auth.currentUser.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
         photoURL: url
      });
      setProfile(prev => ({ ...prev, photoURL: url }));
    } catch (err) {
       console.error("Profile picture upload failed", err);
       alert("Failed to upload profile picture");
    } finally {
       setUploadingPic(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBookingId(bookingId);
    try {
      const file = files[0];
      const fileRef = ref(storage, `bookings/${bookingId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
         fileURLs: arrayUnion(url)
      });
      fetchBookings(); // refresh
    } catch (err) {
       console.error("Upload failed", err);
       alert("Failed to upload document");
    } finally {
       setUploadingBookingId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[90vh] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 text-xl font-bold">
                    {(profile.displayName || auth.currentUser?.displayName)?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-brand-dark">Client Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back, {profile.displayName || auth.currentUser?.displayName}</p>
              </div>
           </div>
           <Button variant="outline" onClick={handleSignOut} className="gap-2 shrink-0 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700">
             <LogOut className="w-4 h-4" /> Sign Out
           </Button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200">
           <button 
             onClick={() => setActiveTab('bookings')}
             className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> My Bookings</div>
           </button>
           <button 
             onClick={() => setActiveTab('calendar')}
             className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Calendar</div>
           </button>
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             <div className="flex items-center gap-2"><User className="w-4 h-4" /> My Profile</div>
           </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search by service, date, or reference..." 
                      className="pl-10 h-10 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center p-12 text-slate-400">
                     <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center p-12">
                     <p className="text-slate-500 font-medium">
                       {searchTerm ? `No results found for "${searchTerm}"` : "You don't have any bookings yet."}
                     </p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                     {filteredBookings.map(booking => (
                       <div key={booking.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors bg-white">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                 <div className="flex flex-col">
                                   <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{booking.service}</span>
                                   <h3 className="font-bold text-brand-dark">{booking.subService}</h3>
                                 </div>
                                 <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider h-fit">
                                   Ref: {booking.id}
                                 </span>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-2">
                                 <CalendarIcon className="w-3.5 h-3.5" /> Booked for: {booking.date} at {booking.time}
                              </p>
                            </div>
                            <div>
                                <StatusBadge status={booking.status} />
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-100">
                             <div className="flex items-center justify-between mb-3">
                               <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attached Documents</h4>
                               <label className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                                  {uploadingBookingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3" />} 
                                  Upload New
                                  <input 
                                     type="file" 
                                     className="hidden" 
                                     onChange={(e) => handleFileUpload(e, booking.id)} 
                                     disabled={uploadingBookingId === booking.id || booking.status === 'Closed'}
                                     accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                  />
                               </label>
                             </div>
                             {booking.fileURLs && booking.fileURLs.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {booking.fileURLs.map((url: string, i: number) => (
                                    <a 
                                       key={i} 
                                       href={url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="text-xs text-slate-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors focus:ring-2 focus:ring-blue-500"
                                       title={url}
                                    >
                                      <FileText className="w-3 h-3 text-slate-400" />
                                      Doc {i + 1}
                                    </a>
                                  ))}
                                </div>
                             ) : (
                                <p className="text-xs text-slate-400 italic">No documents uploaded</p>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Calendar Column */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 text-lg">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 ring-1 ring-slate-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((day, i) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayBookings = bookingsByDateMap[dateStr] || [];
                        const isSelected = selectedCalendarDate && isSameDay(day, selectedCalendarDate);
                        
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedCalendarDate(day)}
                            className={cn(
                              "relative h-24 md:h-28 p-2 bg-white text-left transition-all hover:bg-blue-50 group",
                              !isSameMonth(day, currentMonth) && "bg-slate-50/50 text-slate-300 pointer-events-none opacity-50",
                              isSelected && "bg-blue-50 ring-2 ring-inset ring-blue-500 z-10"
                            )}
                          >
                            <span className={cn(
                              "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1",
                              isToday(day) ? "bg-blue-600 text-white" : "text-slate-600 group-hover:text-blue-600",
                              isSelected && !isToday(day) && "text-blue-600"
                            )}>
                              {format(day, 'd')}
                            </span>
                            
                            <div className="space-y-1">
                              {dayBookings.slice(0, 2).map((b, idx) => (
                                <div 
                                  key={idx} 
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate bg-blue-100 text-blue-700"
                                >
                                  {b.subService}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <div className="text-[9px] font-bold text-slate-400 pl-1">
                                  + {dayBookings.length - 2} more
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bookings for selected date column */}
                  <div className="lg:col-span-5 border-l border-slate-100 pl-0 lg:pl-8">
                    <div className="sticky top-6">
                      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                        {selectedCalendarDate ? format(selectedCalendarDate, 'MMMM d, yyyy') : 'Select a date'}
                      </h3>

                      {!selectedCalendarDate ? (
                        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm font-medium">Click on a date to view its bookings</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(bookingsByDateMap[format(selectedCalendarDate, 'yyyy-MM-dd')] || []).length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-slate-400 text-sm italic">No bookings scheduled for this day</p>
                            </div>
                          ) : (
                            bookingsByDateMap[format(selectedCalendarDate, 'yyyy-MM-dd')].map(booking => (
                              <div key={booking.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tight leading-none mb-0.5">{booking.service}</p>
                                    <h4 className="font-bold text-sm text-brand-dark">{booking.subService}</h4>
                                    <p className="text-[10px] font-bold text-slate-400">{booking.time}</p>
                                  </div>
                                  <StatusBadge status={booking.status} />
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setActiveTab('bookings');
                                      // Optional: logic to scroll to this booking in the list
                                    }}
                                    className="text-[10px] font-bold text-blue-600 hover:underline"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">
                            {(profile.displayName || auth.currentUser?.displayName)?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploadingPic ? (
                          <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} disabled={uploadingPic} />
                      </label>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Photo</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="flex-1 max-w-lg space-y-4">
                     <div>
                       <Label>Full Name</Label>
                       <Input 
                         value={profile.displayName || ''} 
                         onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                         placeholder="Your Name"
                       />
                     </div>
                     <div>
                       <Label>Email Address</Label>
                       <Input disabled value={auth.currentUser?.email || ''} className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                       <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed.</p>
                     </div>
                     <div>
                       <Label>Phone Number</Label>
                       <Input 
                         value={profile.phone || ''} 
                         onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                         placeholder="+880 1..."
                       />
                     </div>
                     <div>
                       <Label>Company Name</Label>
                       <Input 
                         value={profile.companyName || ''} 
                         onChange={(e) => setProfile(p => ({ ...p, companyName: e.target.value }))}
                         placeholder="Optional"
                       />
                     </div>
                     <div>
                       <Label>Address</Label>
                       <Input 
                         value={profile.address || ''} 
                         onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                         placeholder="Your physical address"
                       />
                     </div>
                     <Button type="submit" disabled={savingProfile} className="gap-2 mt-4">
                       {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Save Changes
                     </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

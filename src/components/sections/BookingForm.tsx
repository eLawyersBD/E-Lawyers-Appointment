/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone, Accept } from 'react-dropzone';
import { 
  User, Phone, Mail, Building2, MapPin, 
  ChevronRight, ChevronLeft, Upload, File, X, 
  Briefcase, Send, AlertCircle, CheckCircle2, Clock, Calendar, FileText, ShieldCheck, Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CATEGORIES, CITIES, SERVICES } from '../../constants';
import { Button, Input, Label } from '../ui/Base';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(?:\+88)?01[3-9]\d{8}$/, 'Valid Bangladeshi mobile number required (e.g., 017...)'),
  email: z.string().email('Invalid email address'),
  city: z.string().min(1, 'City is required'),
  companyName: z.string().optional(),
  consultationType: z.string().min(1, 'Consultation type is required'),
  priority: z.string(),
  date: z.string().min(1, 'Preferred date is required'),
  time: z.string().min(1, 'Preferred time is required'),
  description: z.string().min(20, 'Please provide more details (minimum 20 characters)'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
  // Conditional fields
  taxYear: z.string().optional(),
  tinNumber: z.string().optional(),
  returnStatus: z.string().optional(),
  incorporationNumber: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  annualReturnStatus: z.string().optional(),
  binNumber: z.string().optional(),
  businessType: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  selectedService: { category: string; subService: string };
  setSelectedService: (val: { category: string; subService: string }) => void;
  onTrackBooking?: (id?: string) => void;
}

export default function BookingForm({ selectedService, setSelectedService, onTrackBooking }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const { 
    register, 
    handleSubmit, 
    trigger, 
    watch, 
    formState: { errors }, 
    setValue 
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      consultationType: 'In-person',
      priority: 'Normal',
      consent: false,
    } as any
  });

  const watchDate = watch('date');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const now = new Date();
  const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  React.useEffect(() => {
    if (!watchDate) {
      setAvailableSlots([]);
      return;
    }
    
    const service = SERVICES.find(s => s.category === selectedService.category && s.title === selectedService.subService);
    let durationMins = 60;
    if (service && service.duration.includes('mins')) {
      durationMins = parseInt(service.duration) || 60;
    }

    const slots = [];
    const baseHour = 10; // 10 AM
    const endHour = 17; // 5 PM
    const intervalMins = durationMins > 30 ? 60 : 30;
    
    // Create dates in local time to avoid timezone issues when checking isToday
    const selYear = parseInt(watchDate.split('-')[0]);
    const selMonth = parseInt(watchDate.split('-')[1]) - 1;
    const selDay = parseInt(watchDate.split('-')[2]);
    const selectedDateLocal = new Date(selYear, selMonth, selDay);
    const now = new Date();
    
    const isToday = now.getFullYear() === selectedDateLocal.getFullYear() && 
                    now.getMonth() === selectedDateLocal.getMonth() && 
                    now.getDate() === selectedDateLocal.getDate();
                    
    const currentHour = now.getHours();
    const currentMins = now.getMinutes();

    for (let h = baseHour; h < endHour; h++) {
       for (let m = 0; m < 60; m += intervalMins) {
          if (h === 13) continue; // Lunch 1-2 PM
          if (isToday) {
             if (h < currentHour || (h === currentHour && m <= currentMins)) {
                continue;
             }
          }
          const ampm = h >= 12 ? 'PM' : 'AM';
          const displayH = h > 12 ? h - 12 : h;
          const displayM = m === 0 ? '00' : m.toString();
          
          // format output to be recognizable if we're picking
          // We can just use "10:00 AM" format
          slots.push(`${displayH}:${displayM} ${ampm}`);
       }
    }
    setAvailableSlots(slots);
    
    // Automatically reset time if selected time is no longer available
    const curTime = watch('time');
    if (curTime && !slots.includes(curTime)) {
       setValue('time', '');
    }
  }, [watchDate, selectedService, watch, setValue]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const accept: Accept = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept as any
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'phone', 'email', 'city'];
    if (step === 2) fieldsToValidate = ['date', 'time'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const onFormSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fileURLs = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(storage, `bookings/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        })
      );

      const conditionalData: any = {};
      if (selectedService.category === 'Tax' && selectedService.subService === 'Tax Consultation & Return') {
        conditionalData.taxYear = data.taxYear;
        conditionalData.tinNumber = data.tinNumber;
        conditionalData.returnStatus = data.returnStatus;
      } else if (selectedService.category === 'RJSC') {
        conditionalData.incorporationNumber = data.incorporationNumber;
        conditionalData.companyRegistrationNumber = data.companyRegistrationNumber;
        conditionalData.annualReturnStatus = data.annualReturnStatus;
      } else if (selectedService.category === 'VAT' || selectedService.category === 'VAT Services') {
        conditionalData.binNumber = data.binNumber;
        conditionalData.businessType = data.businessType;
      }

      const bookingData = {
        ...data,
        companyName: data.companyName || null,
        serviceCategory: selectedService.category,
        subService: selectedService.subService,
        conditionalData,
        fileURLs,
        status: 'Pending',
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      setBookingId(docRef.id);
      
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            service: selectedService.subService,
            date: data.date,
            time: data.time,
            reference_id: docRef.id,
            booking_details: data.description
          })
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // Continue to success step even if email fails
      }

      setSubmitStatus('success');
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMsg('Failed to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark mb-4">Booking Successful!</h3>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
          Thank you for choosing eLawyers. Your request has been received. 
          Our representative will contact you shortly to confirm the scheduled time.
        </p>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8 inline-block">
          <span className="text-[10px] text-blue-700 font-bold block mb-2 uppercase tracking-widest">Reference ID</span>
          <code className="text-2xl font-black text-brand-dark tracking-tighter">{bookingId}</code>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">Book Another Service</Button>
          {onTrackBooking && (
            <Button onClick={() => onTrackBooking(bookingId)}>Track Booking Status</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="booking" className="py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-3">
              <span className="w-2 h-6 bg-brand-blue rounded-full"></span>
              Smart Booking Form
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tight">
                Step {step} of 3
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Full Name*</Label>
                      <Input 
                        placeholder="John Doe" 
                        {...register('name')}
                        className={errors.name ? 'border-red-300 ring-red-50' : ''}
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Mobile Number*</Label>
                      <Input 
                        placeholder="+880 1..." 
                        {...register('phone')}
                        className={errors.phone ? 'border-red-300 ring-red-50' : ''}
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Email Address*</Label>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        {...register('email')}
                        className={errors.email ? 'border-red-300 ring-red-50' : ''}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>City*</Label>
                      <select 
                        {...register('city')}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          errors.city ? 'border-red-300' : 'border-slate-200'
                        }`}
                      >
                        <option value="">Select City</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.city && <p className="text-[10px] text-red-500 font-bold">{errors.city.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Company Name (Optional)</Label>
                    <Input 
                      placeholder="Organization Ltd." 
                      {...register('companyName')}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={nextStep} className="gap-2">
                       Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Service Category</Label>
                      <select 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        value={selectedService.category}
                        onChange={(e) => {
                          const newCategory = e.target.value;
                          const firstSubService = newCategory === 'Other' ? '' : SERVICES.find(s => s.category === newCategory)?.title || '';
                          setSelectedService({ category: newCategory, subService: firstSubService });
                        }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {selectedService.category === 'Other' ? (
                      <div className="space-y-1">
                        <Label>Specify Service</Label>
                        <Input 
                          placeholder="Please specify"
                          value={selectedService.subService}
                          onChange={(e) => setSelectedService({ ...selectedService, subService: e.target.value })}
                          className="bg-slate-50"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label>Specific Service</Label>
                        <select 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                          value={selectedService.subService}
                          onChange={(e) => setSelectedService({ ...selectedService, subService: e.target.value })}
                        >
                          {SERVICES.filter(s => s.category === selectedService.category).map(s => (
                            <option key={s.id} value={s.title}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>Consultation Type</Label>
                    <select 
                      {...register('consultationType')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="In-person">In-person</option>
                      <option value="Video Call">Video Call</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Document Review">Document Review</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Preferred Date*</Label>
                      <Input 
                        type="date" 
                        min={todayStr}
                        {...register('date')}
                        className={errors.date ? 'border-red-300 ring-red-50' : ''}
                      />
                      {errors.date && <p className="text-[10px] text-red-500 font-bold">{errors.date.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Preferred Time*</Label>
                      <select
                        {...register('time')}
                        disabled={!watchDate || availableSlots.length === 0}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.time ? 'border-red-300 ring-red-50' : 'border-slate-200'
                        }`}
                      >
                        <option value="">
                          {!watchDate ? 'Select a date first' : (availableSlots.length === 0 ? 'No slots available' : 'Select Time Slot')}
                        </option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.time && <p className="text-[10px] text-red-500 font-bold">{errors.time.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Normal', 'Urgent', 'Very Urgent'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setValue('priority', p)}
                          className={`py-2 px-3 rounded-md border text-[11px] font-bold transition-all ${
                            watch('priority') === p 
                            ? 'border-brand-blue bg-blue-50 text-brand-blue' 
                            : 'border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-500'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Fields Section */}
                  {((selectedService.category === 'Tax' && selectedService.subService === 'Tax Consultation & Return') ||
                    selectedService.category === 'RJSC' ||
                    selectedService.category === 'VAT' || selectedService.category === 'VAT Services') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 mt-6 relative overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-700"></div>
                      <div className="mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                          {selectedService.category === 'Tax' && <ShieldCheck className="w-5 h-5" />}
                          {selectedService.category === 'RJSC' && <Briefcase className="w-5 h-5" />}
                          {(selectedService.category === 'VAT' || selectedService.category === 'VAT Services') && <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-brand-dark">Additional Details Required</h4>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            {selectedService.category} Information
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Tax Fields */}
                        {selectedService.category === 'Tax' && selectedService.subService === 'Tax Consultation & Return' && (
                          <>
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Tax Year</Label>
                              <Input placeholder="2023-24" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('taxYear')} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">TIN Number</Label>
                              <Input placeholder="12-digit TIN" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('tinNumber')} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Return Status</Label>
                              <Input placeholder="Pending / Filed" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('returnStatus')} />
                            </div>
                          </>
                        )}

                        {/* RJSC Fields */}
                        {selectedService.category === 'RJSC' && (
                          <>
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Company Name</Label>
                              <Input placeholder="Acme Corp Ltd." className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('companyName')} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Registration Number</Label>
                              <Input placeholder="C-12345/2023" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('companyRegistrationNumber')} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Annual Return Status</Label>
                              <Input placeholder="Pending / Filed" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('annualReturnStatus')} />
                            </div>
                          </>
                        )}

                        {/* VAT Fields */}
                        {(selectedService.category === 'VAT' || selectedService.category === 'VAT Services') && (
                          <>
                            <div className="space-y-1.5 ">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">BIN Number</Label>
                              <Input placeholder="13-digit BIN" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('binNumber')} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">Business Type</Label>
                              <Input placeholder="Manufacturer / Service" className="bg-white focus:bg-white shadow-sm border-slate-200" {...register('businessType')} />
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="gap-2">
                      Final Step <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label>Issue Description*</Label>
                    <textarea 
                      placeholder="Briefly describe your legal/tax case. Min 20 characters."
                      className={`w-full h-24 px-3 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${
                        errors.description ? 'border-red-300 ring-red-50' : 'border-slate-200'
                      }`}
                      {...register('description')}
                    />
                    {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label>Document Upload (PDF, JPG, PNG)</Label>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer bg-slate-50 ${
                        isDragActive ? 'border-brand-blue bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] text-slate-500 font-bold">CLICK OR DRAG FILES TO UPLOAD</span>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-slate-100 shadow-sm">
                            <span className="text-[10px] text-slate-600 font-medium truncate max-w-[120px]">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-brand-dark focus:ring-brand-dark cursor-pointer shadow-sm" 
                        {...register('consent')}
                      />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                        I Agree to Terms & Data Privacy Policy
                      </span>
                    </label>
                    {errors.consent && <p className="text-[10px] text-red-500 font-bold">{errors.consent.message}</p>}
                  </div>

                  {submitStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded border border-red-100 text-[11px] flex items-center gap-2 font-bold">
                       <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                       Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 max-w-[240px] gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>Submit Request <Send className="w-4 h-4 text-blue-400" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  );
}

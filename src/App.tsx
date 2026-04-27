/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import WhyChooseUs from './components/sections/WhyChooseUs';
import BookingForm from './components/sections/BookingForm';
import Pricing from './components/sections/Pricing';
import FAQ from './components/sections/FAQ';
import Contact from './components/sections/Contact';
import TrackingPage from './components/sections/TrackingPage';
import Login from './components/dashboard/Login';
import ClientDashboard from './components/dashboard/ClientDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Footer from './components/layout/Footer';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ADMIN_EMAIL = 'erp.elawyers@gmail.com';

export default function App() {
  const [view, setView] = useState<'home' | 'tracking' | 'dashboard' | 'login'>('home');
  const [trackingId, setTrackingId] = useState('');
  const [selectedService, setSelectedService] = useState({
    category: 'Tax',
    subService: 'Tax Consultation & Return'
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && view === 'login') {
        setView('dashboard');
      } else if (!u && view === 'dashboard') {
        setView('login');
      }
    });
    return () => unsub();
  }, [view]);

  const handleSelectService = (title: string, category: string) => {
    setSelectedService({ category, subService: title });
    setView('home');
    setTimeout(() => {
      document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const navigateToTracking = (id?: string) => {
    if (id) setTrackingId(id);
    setView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateDashboard = () => {
    setView(user ? 'dashboard' : 'login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = user?.email === ADMIN_EMAIL && user?.emailVerified;

  return (
    <div className="min-h-screen bg-white selection:bg-amber-100 selection:text-amber-900 font-sans">
      <Navbar onNavigateHome={() => setView('home')} onNavigateDashboard={handleNavigateDashboard} />
      
      <main>
        {view === 'home' && (
          <>
            <Hero onNavigateDashboard={handleNavigateDashboard} />
            <Services onSelectService={handleSelectService} selectedService={selectedService} />
            <WhyChooseUs />
            <BookingForm 
              selectedService={selectedService} 
              setSelectedService={setSelectedService} 
              onTrackBooking={navigateToTracking}
            />
            <Pricing />
            <FAQ />
            <Contact />
          </>
        )}
        {view === 'tracking' && (
          <TrackingPage initialTrackingId={trackingId} onBack={() => setView('home')} />
        )}
        {view === 'login' && (
          <Login />
        )}
        {view === 'dashboard' && (
          isAdmin ? (
            <AdminDashboard onLogout={() => setView('home')} />
          ) : (
            <ClientDashboard onLogout={() => setView('home')} />
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

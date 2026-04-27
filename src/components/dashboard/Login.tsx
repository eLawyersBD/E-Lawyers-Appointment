import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Input, Label } from '../ui/Base';
import { AlertCircle, Chrome } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError && validateEmail(val)) {
      setEmailError('');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with email/password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
         await setDoc(userRef, {
             name: user.displayName,
             email: user.email,
             createdAt: Date.now()
         });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-24 px-4">
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center"
       >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">e</div>
          <h2 className="text-2xl font-black text-brand-dark mb-2">Client Portal</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to view your bookings and manage your documents.</p>

          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6 text-left">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={emailError ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
             variant="outline" 
             className="w-full h-12 flex items-center justify-center gap-3 text-sm" 
             onClick={handleGoogleSignIn}
             disabled={loading}
          >
             <Chrome className="w-5 h-5 text-blue-500" />
             {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm text-left">{error}</p>
            </div>
          )}
       </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }

      if (!userSnap?.exists()) {
        // Create new user profile
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            balance: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      let displayError = 'Failed to sign in';
      try {
        // Try to parse if it's the JSON error from handleFirestoreError
        const parsed = JSON.parse(err.message);
        displayError = parsed.error || displayError;
      } catch {
        displayError = err.message || displayError;
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl border border-neutral-100"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg mb-6">
            <Sparkles size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-neutral-500">Join SKILL2CASH today and start earning.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 italic">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white py-4 px-4 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md disabled:opacity-50 active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            {loading ? 'Processing...' : 'Continue with Google'}
          </button>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            <ShieldCheck size={14} />
            Secure & Verified
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { MessageSquarePlus, Star, FastForward, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return alert('Please select a rating');

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        rating,
        comment,
        type: 'feedback',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">Shape our <span className="text-orange-600">Future</span></h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">Your feedback is the most valuable currency we have. Tell us how we're doing.</p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-8 sm:p-12 rounded-[3.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <div className="h-20 w-20 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
                   <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-3">Shukriya! (Thank You!)</h2>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-sm mx-auto mb-10">We've received your feedback. Our team will review it and keep improving SKILL2CASH for you.</p>
                <button 
                  onClick={() => { setSuccess(false); setRating(0); setComment(''); }}
                  className="bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide"
                >
                  Back to Feedback
                </button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-10"
              >
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">How would you rate your experience?</label>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                          rating >= s 
                            ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-600/30' 
                            : 'bg-white dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 hover:bg-orange-50'
                        }`}
                      >
                        <Star size={24} fill={rating >= s ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between px-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">What's one thing we can improve?</label>
                  <textarea 
                    rows={4}
                    placeholder="Be honest. We can take it!"
                    className="w-full px-6 py-4 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-orange-500/20 text-neutral-900 dark:text-white font-medium resize-none shadow-inner"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-neutral-900 dark:bg-orange-600 text-white font-black py-5 rounded-[2rem] hover:bg-neutral-800 dark:hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-neutral-900/20"
                >
                  {loading ? 'Sending...' : <><MessageSquarePlus size={18} /> Submit Feedback</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
              <FastForward className="text-emerald-600 mb-3" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Real-time Updates</h4>
              <p className="text-[11px] text-neutral-500 mt-1">We push updates weekly based on your ideas.</p>
           </div>
           <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20">
              <Star className="text-blue-600 mb-3" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Top Rated App</h4>
              <p className="text-[11px] text-neutral-500 mt-1">Join 50,000+ happy earners in Pakistan.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

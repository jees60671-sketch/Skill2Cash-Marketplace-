import React, { useState } from 'react';
import { Send, MapPin, Mail, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const ContactPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        ...formData,
        type: 'contact',
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setSuccess(true);
      setFormData({ subject: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Left Column: Info */}
          <div>
            <div className="mb-12">
               <span className="text-orange-600 font-black text-xs uppercase tracking-widest bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-full border border-orange-100 dark:border-orange-900/30">Support Center</span>
               <h1 className="text-5xl font-black text-neutral-900 dark:text-white mt-6 tracking-tight leading-tight">
                 We're here to <br />help you <span className="text-orange-600">Grow.</span>
               </h1>
            </div>

            <div className="space-y-10">
               {[
                 { icon: MapPin, title: 'Office', content: 'Bahria Town Phase 7, Islamabad, Pakistan' },
                 { icon: Mail, title: 'Email', content: 'support@skill2cash.com' },
                 { icon: MessageSquare, title: 'Live Chat', content: 'Available inside the app for verified users' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-6 group">
                   <div className="h-14 w-14 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none flex items-center justify-center text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-800 group-hover:bg-orange-600 group-hover:text-white transition-all">
                     <item.icon size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-neutral-900 dark:text-white uppercase text-xs tracking-widest mb-1">{item.title}</h3>
                     <p className="text-neutral-500 dark:text-neutral-400 font-medium">{item.content}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 relative overflow-hidden">
               <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-orange-600/20" />
               <h4 className="text-lg font-bold mb-2">Fast Response Guarantee</h4>
               <p className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">Our team typically responds within 24 hours to all inquiries during business days.</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl shadow-neutral-200/20 dark:shadow-none">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <Send size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Message Sent!</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-8">We've received your inquiry and will get back shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Subject</label>
                    <input 
                      type="text" 
                      placeholder="Withdrawal Issue, Task Verification, etc."
                      className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-orange-500/20 text-neutral-900 dark:text-white font-medium"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="Tell us everything. The more details, the better!"
                      className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-orange-500/20 text-neutral-900 dark:text-white font-medium resize-none"
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-neutral-900 dark:bg-orange-600 text-white font-black py-5 rounded-[2rem] hover:bg-neutral-800 dark:hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

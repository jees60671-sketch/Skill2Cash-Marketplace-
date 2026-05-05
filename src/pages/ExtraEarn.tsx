import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { 
  Sparkles, 
  Users, 
  Copy, 
  Check, 
  RotateCw, 
  Gift, 
  TrendingUp,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  doc, 
  updateDoc, 
  increment, 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDoc,
  setDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const ExtraEarn = () => {
  const { userData, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const controls = useAnimation();
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const sections = [
    { value: 0.1, label: '$0.10', color: '#f97316' },
    { value: 0.05, label: '$0.05', color: '#10b981' },
    { value: 0.5, label: '$0.50', color: '#3b82f6' },
    { value: 0, label: 'Bummer', color: '#6b7280' },
    { value: 0.2, label: '$0.20', color: '#8b5cf6' },
    { value: 0.01, label: '$0.01', color: '#f43f5e' },
    { value: 1.0, label: '$1.00', color: '#fbbf24' },
    { value: 0.05, label: '$0.05', color: '#06b6d4' },
  ];

  useEffect(() => {
    checkSpinAvailability();
  }, []);

  const checkSpinAvailability = async () => {
    if (!user) return;
    const spinDoc = await getDoc(doc(db, 'user_spins', user.uid));
    if (spinDoc.exists()) {
      const lastSpin = spinDoc.data().lastSpin.toDate();
      const now = new Date();
      const diff = now.getTime() - lastSpin.getTime();
      const hoursRemaining = 24 - (diff / (1000 * 60 * 60));
      
      if (hoursRemaining <= 0) {
        setCanSpin(true);
      } else {
        setCanSpin(false);
        // Format time left
        const h = Math.floor(hoursRemaining);
        const m = Math.floor((hoursRemaining - h) * 60);
        setTimeLeft(`${h}h ${m}m`);
      }
    } else {
      setCanSpin(true);
    }
  };

  const handleCopy = () => {
    const refLink = `${window.location.origin}/auth?ref=${userData?.uid}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spin = async () => {
    if (!canSpin || spinning) return;

    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * sections.length);
    const rotation = 360 * 5 + (randomIndex * (360 / sections.length));

    await controls.start({
      rotate: rotation,
      transition: { duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }
    });

    const result = sections[randomIndex].value;
    setSpinResult(result);
    setSpinning(false);
    setCanSpin(false);

    // Save spin and update balance
    if (user) {
      await setDoc(doc(db, 'user_spins', user.uid), {
        lastSpin: serverTimestamp()
      });

      if (result > 0) {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: increment(result)
        });

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          amount: result,
          type: 'earning',
          category: 'spin_wheel',
          status: 'completed',
          createdAt: serverTimestamp()
        });
      }
      checkSpinAvailability();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
               <Sparkles size={20} />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight italic">EXTRA EARN</h1>
          </div>
          <p className="text-neutral-500 font-medium">Maximize your daily earnings with bonuses and rewards.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Spin Wheel Section */}
          <section className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <RotateCw size={120} className="text-orange-600 animate-spin-slow" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                Daily Spin <RotateCw size={20} className="text-orange-600" />
              </h2>
              <p className="text-neutral-500 text-sm font-medium mb-12">Spin the wheel every 24 hours to win instant cash prizes up to $1.00!</p>

              <div className="flex flex-col items-center justify-center space-y-12">
                <div className="relative h-64 w-64 md:h-80 md:w-80">
                  {/* Wheel Marker */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-orange-600 drop-shadow-md" />
                  </div>

                  <motion.div 
                    animate={controls}
                    className="h-full w-full rounded-full border-8 border-neutral-900 dark:border-white shadow-2xl relative overflow-hidden overflow-hidden"
                  >
                    {sections.map((sec, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 origin-bottom flex flex-col items-center pt-4"
                        style={{ 
                          transform: `translateX(-50%) rotate(${i * (360 / sections.length)}deg)`,
                          backgroundColor: sec.color,
                          clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
                        }}
                      >
                         <span className="font-black text-white text-xs md:text-sm mt-4 transform rotate-180 -scale-y-100">{sec.label}</span>
                      </div>
                    ))}
                    {/* Center Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-neutral-900 dark:bg-white z-10 shadow-lg" />
                  </motion.div>
                </div>

                <div className="text-center space-y-4">
                  {spinResult !== null && !spinning && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 inline-block"
                    >
                      <h3 className="font-black text-orange-600 text-lg">You won ${spinResult.toFixed(2)}!</h3>
                    </motion.div>
                  )}

                  <button 
                    onClick={spin}
                    disabled={!canSpin || spinning}
                    className={`w-full sm:w-64 py-5 rounded-[2rem] font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      canSpin && !spinning 
                        ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20' 
                        : 'bg-neutral-300 dark:bg-neutral-800 cursor-not-allowed text-neutral-500'
                    }`}
                  >
                    {spinning ? 'Good Luck...' : canSpin ? 'SPIN NOW' : `Wait ${timeLeft}`}
                  </button>
                  
                  {!canSpin && !spinning && (
                     <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">Check back in {timeLeft}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Referral Section */}
          <section className="space-y-12">
            <div className="bg-neutral-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.02]">
              <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-orange-600/20 rounded-full blur-3xl group-hover:bg-orange-600/40 transition-all" />
              
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                Refer & Earn <Gift size={20} className="text-orange-500" />
              </h2>
              <p className="text-neutral-400 text-sm font-medium mb-8">Share your code with friends. Earn <span className="text-orange-500">$0.50</span> for every user who completes their first task!</p>

              <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-sm">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Your Referral Link</label>
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                   <div className="text-xs font-medium text-neutral-400 truncate flex-1 select-all">
                     {`${window.location.origin}/auth?ref=${userData?.uid?.substring(0, 8)}...`}
                   </div>
                   <button 
                    onClick={handleCopy}
                    className="h-12 w-12 rounded-xl bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all shrink-0 active:scale-90"
                   >
                     {copied ? <Check size={20} /> : <Copy size={20} />}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <h4 className="text-2xl font-black text-white">{userData?.referralCount || 0}</h4>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Invites</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <h4 className="text-2xl font-black text-orange-500">${userData?.referralEarnings?.toFixed(2) || '0.00'}</h4>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Earned</p>
                 </div>
              </div>

              {userData && !userData.referredBy && (
                <div className="mt-8 pt-8 border-t border-white/10">
                   <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Referred by someone?</p>
                   <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const code = (e.currentTarget.elements.namedItem('refCode') as HTMLInputElement).value;
                      if (!code || code === userData.uid) return;
                      try {
                        const refDoc = await getDoc(doc(db, 'users', code));
                        if (refDoc.exists()) {
                          await updateDoc(doc(db, 'users', userData.uid), {
                            referredBy: code
                          });
                          await updateDoc(doc(db, 'users', code), {
                            referralCount: increment(1)
                          });
                          alert('Referrer linked successfully!');
                        } else {
                          alert('Invalid referral code.');
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex gap-2"
                   >
                     <input 
                       name="refCode"
                       type="text" 
                       placeholder="Enter Code" 
                       className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                     />
                     <button className="bg-orange-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">Submit</button>
                   </form>
                </div>
              )}
            </div>

            {/* AI Insights Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-neutral-800 shadow-sm">
               <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                 <TrendingUp size={20} className="text-emerald-500" /> Smart Earning Tips
               </h3>
               <div className="space-y-6">
                  {[
                    { icon: Target, title: 'Morning Hustle', desc: 'New tasks are usually posted between 9 AM - 11 AM PKT. Be the first to grab them!', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { icon: Users, title: 'Share in Groups', desc: 'Sharing your referral link in WhatsApp groups can increase your bonus earnings by 300%.', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' }
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4">
                       <div className={`h-10 w-10 rounded-xl ${tip.bg} ${tip.color} flex items-center justify-center shrink-0`}>
                          <tip.icon size={18} />
                       </div>
                       <div>
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{tip.title}</h4>
                          <p className="text-xs text-neutral-500 font-medium mt-1">{tip.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ExtraEarn;

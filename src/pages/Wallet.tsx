import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet as WalletIcon,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const Wallet = () => {
  const { userData, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('JazzCash');
  const [submitting, setSubmitting] = useState(false);

  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      alert("PIN must be exactly 6 digits");
      return;
    }
    if (newPin !== confirmPin) {
      alert("PINs do not match");
      return;
    }

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        securityPin: newPin
      });
      alert("Security PIN set successfully!");
      setIsSettingPin(false);
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      console.error(err);
      alert("Failed to set PIN");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (!user || isNaN(amount) || amount <= 0 || amount > (userData?.balance || 0)) {
      alert("Invalid withdrawal amount");
      return;
    }

    if (userData?.securityPin && pinInput !== userData.securityPin) {
      alert("Incorrect Security PIN");
      return;
    }

    if (!userData?.securityPin && !confirm("You haven't set a Security PIN. It is highly recommended to set one in your wallet settings. Continue anyway?")) {
      return;
    }

    setSubmitting(true);
    try {
      // Create pending withdrawal transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: -amount,
        type: 'withdrawal',
        method: withdrawMethod,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount)
      });

      alert(`Withdrawal request for $${amount} via ${withdrawMethod} submitted!`);
      setWithdrawAmount('');
      setPinInput('');
      setShowWithdraw(false);
    } catch (err) {
      console.error(err);
      alert('Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance & Actions */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.5rem] bg-neutral-900 p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <WalletIcon size={120} />
            </div>
            <div className="relative z-10">
               <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Balance</span>
               <div className="mt-2 text-5xl font-black tracking-tighter">
                  <span className="text-orange-500">$</span>{userData?.balance?.toFixed(2) || '0.00'}
               </div>
               <div className="mt-12 grid grid-cols-2 gap-4">
                  <button onClick={() => alert('Deposit feature coming soon!')} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-4 font-bold text-sm hover:bg-white/20 transition-all">
                     <Plus size={18} /> Deposit
                  </button>
                  <button onClick={() => setShowWithdraw(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30">
                     <ArrowUpRight size={18} /> Withdraw
                  </button>
               </div>
            </div>
          </motion.div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-100 shadow-sm">
             <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-6">Local Methods</h3>
             <div className="space-y-4">
                {[
                  { name: 'JazzCash', color: 'bg-red-50 text-red-600' },
                  { name: 'EasyPaisa', color: 'bg-emerald-50 text-emerald-600' },
                  { name: 'PayPal', color: 'bg-blue-50 text-blue-600' }
                ].map(method => (
                  <div key={method.name} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold ${method.color}`}>
                           {method.name[0]}
                        </div>
                        <span className="font-bold text-neutral-900">{method.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Connected</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Withdrawal Security</h3>
                <ShieldCheck size={18} className="text-orange-600" />
             </div>
             {userData?.securityPin ? (
               <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-700">
                     <CheckCircle2 size={18} />
                     <span className="text-xs font-bold uppercase tracking-widest leading-none">6-Digit PIN Active</span>
                  </div>
                  <button 
                    onClick={() => setIsSettingPin(true)}
                    className="w-full py-3 rounded-xl border-2 border-neutral-100 text-xs font-black text-neutral-400 uppercase tracking-widest hover:border-orange-200 hover:text-orange-600 transition-all font-sans"
                  >
                    Change Security PIN
                  </button>
               </div>
             ) : (
               <div className="space-y-4">
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed font-sans">
                    Set a 6-digit withdrawal PIN to protect your earnings from unauthorized access.
                  </p>
                  <button 
                    onClick={() => setIsSettingPin(true)}
                    className="w-full py-4 rounded-2xl bg-neutral-900 text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 font-sans"
                  >
                    Set Security PIN
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-white shadow-sm border border-neutral-100 flex flex-col h-full min-h-[600px]">
            <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Transaction History</h2>
              <div className="flex items-center gap-2">
                 <button className="p-2 rounded-xl bg-neutral-50 text-neutral-500 hover:bg-neutral-100"><Search size={18}/></button>
                 <button className="p-2 rounded-xl bg-neutral-50 text-neutral-500 hover:bg-neutral-100"><Filter size={18}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="p-12 text-center text-neutral-400">Loading history...</div>
              ) : transactions.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                   <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4">
                      <Zap size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-neutral-900">No activity yet</h3>
                   <p className="text-neutral-500">Earn money by completing tasks to see it here.</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${
                          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {isPositive ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</div>
                          <div className="text-xs text-neutral-400 font-medium tracking-tight">
                            {tx.method || 'System'} • {new Date(tx.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-lg ${isPositive ? 'text-emerald-600' : 'text-neutral-900'}`}>
                          {isPositive ? '+' : ''}{tx.amount.toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${
                          tx.status === 'completed' ? 'text-emerald-500' : 
                          tx.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
               onClick={() => setShowWithdraw(false)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Banknote size={120} />
                </div>
                <div className="relative z-10">
                   <h2 className="text-2xl font-black text-neutral-900 mb-2">Request Withdrawal</h2>
                   <p className="text-neutral-500 text-sm mb-8">Funds will be processed within 24 hours.</p>

                   <form onSubmit={handleWithdraw} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Amount to Withdraw ($)</label>
                         <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-neutral-300">$</span>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full pl-12 pr-6 py-5 rounded-2xl bg-neutral-50 border-none font-black text-3xl focus:ring-2 focus:ring-orange-500/20"
                              placeholder="0.00"
                              required
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                         </div>
                         <div className="text-[10px] font-bold text-neutral-400 text-right">MAX: ${userData?.balance?.toFixed(2)}</div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Transfer via</label>
                         <div className="grid grid-cols-2 gap-2">
                            {['JazzCash', 'EasyPaisa', 'PayPal'].map(m => (
                              <button 
                                key={m}
                                type="button"
                                onClick={() => setWithdrawMethod(m)}
                                className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                                  withdrawMethod === m ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-50 text-neutral-500'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                         </div>
                      </div>

                      {userData?.securityPin && (
                         <div className="space-y-2 font-sans">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Security PIN</label>
                            <input 
                              type="password" 
                              maxLength={6}
                              placeholder="••••••"
                              className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-black text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500/20"
                              required
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                            />
                            <p className="text-[10px] text-center font-bold text-neutral-400 uppercase tracking-widest">Enter your 6-digit withdrawal PIN</p>
                         </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-orange-600 text-white font-black py-5 rounded-3xl mt-4 hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50"
                      >
                         {submitting ? 'Processing...' : (
                           <>
                             <Send size={18} /> Confirm Withdrawal
                           </>
                         )}
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Set PIN Modal */}
      <AnimatePresence>
        {isSettingPin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
               onClick={() => setIsSettingPin(false)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden font-sans"
             >
                <div className="relative z-10">
                   <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                      <ShieldCheck size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-neutral-900 mb-2">Set Security PIN</h2>
                   <p className="text-neutral-500 text-sm mb-8">This PIN will be required for all future withdrawals.</p>

                   <form onSubmit={handleSetPin} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">New 6-Digit PIN</label>
                         <input 
                           type="password" 
                           maxLength={6}
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-black text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500/20"
                           placeholder="••••••"
                           required
                           value={newPin}
                           onChange={(e) => setNewPin(e.target.value)}
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Confirm PIN</label>
                         <input 
                           type="password" 
                           maxLength={6}
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-black text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500/20"
                           placeholder="••••••"
                           required
                           value={confirmPin}
                           onChange={(e) => setConfirmPin(e.target.value)}
                         />
                      </div>

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-neutral-900 text-white font-black py-5 rounded-3xl mt-4 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
                      >
                         {submitting ? 'Setting PIN...' : 'Save Security PIN'}
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;

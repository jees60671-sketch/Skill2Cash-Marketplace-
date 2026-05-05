import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs, orderBy, limit, updateDoc, doc, where, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldCheck, Users, ShoppingBag, Clock, CheckCircle2, ChevronRight, BrainCircuit, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const AdminPanel = () => {
  const { userData, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Hardcoded security check for the specific user email
  const isAuthorized = user?.email === 'jees60671@gmail.com';

  useEffect(() => {
    if (!isAuthorized || userData?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const uSnap = await getDocs(query(collection(db, 'users'), limit(50)));
        const tSnap = await getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(20)));
        const txSnap = await getDocs(query(collection(db, 'transactions'), where('type', '==', 'withdrawal'), where('status', '==', 'pending'), limit(50)));
        const depSnap = await getDocs(query(collection(db, 'transactions'), where('type', '==', 'deposit'), where('status', '==', 'pending'), limit(50)));
        
        setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTasks(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingDeposits(depSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData, user, isAuthorized]);

  const generateAiInsight = async () => {
    setGeneratingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a platform consultant for SKILL2CASH, a micro-task marketplace in Pakistan.
      Current Data:
      - Total active users being analyzed: ${users.length}
      - Recent tasks: ${tasks.length}
      - Pending withdrawals: ${transactions.length}
      - Categories: ${[...new Set(tasks.map(t => t.category))].join(', ')}
      
      Provide a brief, professional 3-sentence analysis of the platform health and one smart tip to increase engagement. Keep it concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiInsight(response.text || 'No insights available at the moment.');
    } catch (err) {
      console.error(err);
      setAiInsight('Intelligence module offline.');
    } finally {
      setGeneratingInsight(false);
    }
  };

  const handleApproveWithdrawal = async (txId: string, userId: string, amount: number) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'completed'
      });
      
      // Create notification for user
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        userId,
        title: 'Withdrawal Approved! 💸',
        message: `Your withdrawal of $${Math.abs(amount).toFixed(2)} has been processed successfully. Check your account!`,
        type: 'wallet',
        read: false,
        createdAt: serverTimestamp()
      });

      setTransactions(prev => prev.filter(t => t.id !== txId));
      alert('Withdrawal marked as completed and user notified!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDeposit = async (txId: string, userId: string, amount: number) => {
    if (!confirm(`Verify payment and approve deposit of $${amount}?`)) return;
    try {
      // 1. Mark transaction as completed
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'completed'
      });
      
      // 2. Add amount to user balance
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(amount)
      });

      // 3. Create notification
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        userId,
        title: 'Deposit Successful! 💰',
        message: `Your deposit of $${amount.toFixed(2)} has been verified and added to your balance.`,
        type: 'wallet',
        read: false,
        createdAt: serverTimestamp()
      });

      setPendingDeposits(prev => prev.filter(t => t.id !== txId));
      alert('Deposit approved and balance updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve deposit');
    }
  };

  if (!isAuthorized || userData?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-20 text-center bg-white dark:bg-neutral-950 transition-colors">
         <div className="h-24 w-24 rounded-full bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center shadow-inner mb-6">
            <ShieldCheck size={48} />
         </div>
         <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">Biometric Lock Active</h1>
         <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mt-4 font-medium">This terminal is restricted to authorized SKILL2CASH operators only. Unauthorized access is being logged.</p>
         <button 
           onClick={() => window.location.href = '/dashboard'}
           className="mt-12 text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest border-b-2 border-orange-600 pb-1"
         >
           Return to Safety
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
              <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                 <Globe size={12} /> Live Operations
              </div>
              <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">Command Center</h1>
           </div>
           <div className="flex items-center gap-3 bg-neutral-900 text-white px-6 py-4 rounded-[2rem] font-bold text-sm shadow-2xl border border-white/10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Authenticated: {user?.email}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Platform Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
             { label: 'Active Tasks', value: tasks.length, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
             { label: 'Total Volume', value: `$${tasks.reduce((acc, t) => acc + (t.price || 0), 0).toFixed(0)}`, icon: ChevronRight, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
             { label: 'Pending Payouts', value: transactions.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
             { label: 'Pending Deposits', value: pendingDeposits.length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' }
           ].map((stat, i) => (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={stat.label} className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                   <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">{stat.label}</span>
                <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{stat.value}</h3>
             </motion.div>
           ))}
        </div>

        {/* AI Insight Section */}
        <div className="mb-12">
           <div className="bg-neutral-900 dark:bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden text-white dark:text-neutral-900">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <BrainCircuit size={120} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                    <span className="h-8 w-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                       <BrainCircuit size={18} />
                    </span>
                    <h2 className="text-xl font-bold uppercase tracking-widest">AI Strategic Analyst</h2>
                 </div>
                 
                 <div className="min-h-[100px] flex items-center">
                    {aiInsight ? (
                      <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-4xl italic">
                        "{aiInsight}"
                      </p>
                    ) : (
                      <p className="text-neutral-400 dark:text-neutral-500 font-medium italic">
                        Select 'Initiate Scan' to analyze current platform metrics using Gemini Intelligence.
                      </p>
                    )}
                 </div>

                 <button 
                  onClick={generateAiInsight}
                  disabled={generatingInsight}
                  className="mt-10 bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all disabled:opacity-50"
                 >
                   {generatingInsight ? 'Core Processing...' : 'Initiate Platform Scan'}
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <section>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-8 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                 Pending Deposits
              </h2>
              <div className="space-y-6">
                 {pendingDeposits.length === 0 ? (
                   <div className="p-20 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400">
                      No pending deposits.
                   </div>
                 ) : (
                   pendingDeposits.map(tx => (
                     <div key={tx.id} className="p-8 rounded-[3rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col hover:shadow-xl transition-all gap-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
                                 {tx.method[0]}
                              </div>
                              <div>
                                 <div className="font-black text-neutral-900 dark:text-white uppercase text-[10px] tracking-widest">{tx.userEmail}</div>
                                 <div className="text-2xl font-black text-emerald-600">+${tx.amount.toFixed(2)}</div>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleApproveDeposit(tx.id, tx.userId, tx.amount)}
                             className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black px-6 py-3 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all uppercase tracking-widest"
                           >
                              Verify & Credit
                           </button>
                        </div>
                        <div className="pt-4 border-t border-neutral-50 dark:border-neutral-800">
                           <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-neutral-400 uppercase">Transaction ID</span>
                              <span className="text-neutral-900 dark:text-white font-mono">{tx.transactionId}</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-bold mt-1">
                              <span className="text-neutral-400 uppercase">Method</span>
                              <span className="text-neutral-900 dark:text-white">{tx.method}</span>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </section>

           <section>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-8 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                 Pending Withdrawals
              </h2>
              <div className="space-y-6">
                 {transactions.length === 0 ? (
                   <div className="p-20 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400">
                      Clean slate. All users paid.
                   </div>
                 ) : (
                   transactions.map(tx => (
                     <div key={tx.id} className="p-8 rounded-[3rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-black text-xl">
                              {tx.userId.slice(0, 1).toUpperCase()}
                           </div>
                           <div>
                              <div className="font-black text-neutral-900 dark:text-white uppercase text-xs tracking-widest mb-1">ID: {tx.userId.slice(0, 12)}...</div>
                              <div className="text-2xl font-black text-red-600">
                                 ${Math.abs(tx.amount).toFixed(2)}
                              </div>
                              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Method: {tx.method}</div>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleApproveWithdrawal(tx.id, tx.userId, tx.amount)}
                          className="w-full sm:w-auto bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black px-8 py-4 rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xl shadow-neutral-900/10 uppercase tracking-widest"
                        >
                           Release Funds
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </section>

           <section>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-8 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-orange-500" />
                 Market Activity
              </h2>
              <div className="space-y-4">
                 {tasks.map(t => (
                   <div key={t.id} className="p-6 rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
                            <ShoppingBag size={20} />
                         </div>
                         <div>
                            <div className="font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">{t.title}</div>
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                               {t.status} • {t.category}
                            </div>
                         </div>
                      </div>
                      <div className="font-black text-neutral-900 dark:text-white text-lg">${t.price?.toFixed(2)}</div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

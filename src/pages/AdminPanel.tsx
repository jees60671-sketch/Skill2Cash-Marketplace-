import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs, orderBy, limit, updateDoc, doc, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldCheck, Users, ShoppingBag, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const AdminPanel = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (userData?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const uSnap = await getDocs(query(collection(db, 'users'), limit(20)));
        const tSnap = await getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10)));
        const txSnap = await getDocs(query(collection(db, 'transactions'), where('type', '==', 'withdrawal'), where('status', '==', 'pending'), limit(20)));
        
        setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTasks(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleApproveWithdrawal = async (txId: string, userId: string, amount: number) => {
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

  if (userData?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
         <div className="h-20 w-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
            <ShieldCheck size={40} />
         </div>
         <h1 className="text-3xl font-black text-neutral-900">Access Restricted</h1>
         <p className="text-neutral-500 max-w-sm">This area is reserved for the SKILL2CASH admin team. If you think this is a mistake, contact support.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-12">
         <div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Admin Control Room</h1>
            <p className="text-neutral-500 mt-2 font-medium">Monitoring the marketplace and user activities.</p>
         </div>
         <div className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl">
            <ShieldCheck size={20} className="text-orange-500" /> System Secure
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         {[
           { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Total Tasks', value: tasks.length, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
           { label: 'System Volume', value: `$${tasks.reduce((acc, t) => acc + (t.price || 0), 0).toFixed(0)}`, icon: ChevronRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Pending Payouts', value: 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' }
         ].map((stat, i) => (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={stat.label} className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm flex flex-col justify-between h-40">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                 <stat.icon size={24} />
              </div>
              <div className="mt-4">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{stat.label}</span>
                 <h3 className="text-2xl font-black text-neutral-900">{stat.value}</h3>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <section>
            <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
               Pending Withdrawals <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce" />
            </h2>
            <div className="space-y-4">
               {transactions.length === 0 ? (
                 <div className="p-12 text-center bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200 text-neutral-400">
                    No pending requests.
                 </div>
               ) : (
                 transactions.map(tx => (
                   <div key={tx.id} className="p-6 rounded-3xl bg-white border-2 border-red-100 shadow-sm flex items-center justify-between">
                      <div>
                         <div className="font-bold text-neutral-900">User {tx.userId.slice(0, 5)}</div>
                         <div className="text-xs font-bold text-red-600 uppercase tracking-widest">
                            Requesting ${Math.abs(tx.amount).toFixed(2)} via {tx.method}
                         </div>
                      </div>
                      <button 
                        onClick={() => handleApproveWithdrawal(tx.id, tx.userId, tx.amount)}
                        className="bg-neutral-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20"
                      >
                         Mark Paid
                      </button>
                   </div>
                 ))
               )}
            </div>
         </section>

         <section>
            <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
               Live Marketplace <span className="h-2 w-2 rounded-full bg-orange-500" />
            </h2>
            <div className="space-y-4">
               {tasks.map(t => (
                 <div key={t.id} className="p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm flex items-center justify-between">
                    <div>
                       <div className="font-bold text-neutral-900 text-sm">{t.title}</div>
                       <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          {t.status} • {t.category}
                       </div>
                    </div>
                    <div className="font-black text-neutral-900">${t.price?.toFixed(2)}</div>
                 </div>
               ))}
            </div>
         </section>
      </div>
    </div>
  );
};

export default AdminPanel;

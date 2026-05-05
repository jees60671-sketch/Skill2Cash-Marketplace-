import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Plus,
  HelpCircle,
  Headphones,
  Wallet,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { userData } = useAuth();
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        setRecentTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTasks();
  }, []);

  const stats = [
    { name: 'Balance', value: `$${userData?.balance?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Completed', value: '12', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Pending', value: '3', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-neutral-900 tracking-tight mb-2">
          Hello, {userData?.displayName?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-neutral-500 font-medium">Your marketplace overview for today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-16">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={`group rounded-[2.5rem] bg-white p-8 border ${stat.border} hover:shadow-2xl hover:shadow-neutral-200/50 transition-all cursor-default`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`rounded-2xl ${stat.bg} p-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{stat.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-neutral-900 tracking-tight">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Getting Started Guide */}
          <section className="bg-orange-50 rounded-[2.5rem] p-10 border border-orange-100 mb-12">
            <h2 className="font-display text-2xl font-bold text-neutral-900 tracking-tight mb-6 flex items-center gap-3">
              <Sparkles className="text-orange-600" />
              Getting Started
            </h2>
            <div className="grid gap-6">
              {[
                { title: '1. Build Your Profile', desc: 'Add your skills and experience to unlock higher-paying tasks.', action: 'Go to Profile', to: `/profile/${userData?.uid}` },
                { title: '2. Find a Task', desc: 'Browse the marketplace for micro-tasks that match your expertise.', action: 'Browse Now', to: '/marketplace' },
                { title: '3. Submit & Earn', desc: 'Complete the task, upload proof, and get paid instantly to your wallet.', action: 'View Guide', to: '/' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-orange-100 shadow-sm transition-all hover:shadow-md">
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-500 font-medium">{step.desc}</p>
                  </div>
                  <Link to={step.to} className="shrink-0 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                    {step.action}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">Recommended</h2>
              <Link to="/marketplace" className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2 group italic">
                Marketplace
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid gap-4">
              {loading ? (
                [1, 2].map(i => <div key={i} className="h-28 rounded-3xl bg-neutral-50 animate-pulse border border-neutral-100" />)
              ) : recentTasks.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-10 bg-neutral-50 rounded-[2.5rem] border border-dashed border-neutral-200 mb-4">
                     <p className="text-neutral-500 font-medium italic">No live tasks yet. Here are some examples of what you can do:</p>
                  </div>
                  {[
                    { title: 'Graphic Logo Design', price: 25.0, category: 'Design', id: 'ex1' },
                    { title: 'Urdu to English Translation', price: 10.0, category: 'Writing', id: 'ex2' },
                    { title: 'Excel Data Cleaning', price: 5.0, category: 'Data', id: 'ex3' }
                  ].map((task) => (
                    <div 
                      key={task.id} 
                      className="group block rounded-[2rem] bg-white p-8 border border-neutral-100 opacity-60 grayscale-[0.5] cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-neutral-900">{task.title}</h3>
                          <div className="flex items-center gap-4">
                             <span className="px-3 py-1 rounded-full bg-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-widest border border-neutral-100">
                               {task.category}
                             </span>
                             <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Example Task</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl font-bold text-neutral-900">${task.price.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                recentTasks.map((task) => (
                  <Link 
                    key={task.id} 
                    to={`/tasks/${task.id}`}
                    className="group block rounded-[2rem] bg-white p-8 border border-neutral-100 hover:border-orange-500 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-orange-600 transition-colors">{task.title}</h3>
                        <div className="flex items-center gap-4">
                           <span className="px-3 py-1 rounded-full bg-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-widest border border-neutral-100">
                             {task.category || 'General'}
                           </span>
                           <span className="flex items-center gap-1.5 text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">
                             <Clock size={12}/> 
                             {new Date(task.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold text-neutral-900">${task.price?.toFixed(2)}</div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Accepting</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="rounded-[2.5rem] bg-neutral-900 p-10 text-white relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-600/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="font-display text-2xl font-bold mb-3 relative z-10">Post a Task</h3>
              <p className="text-neutral-400 text-sm mb-8 relative z-10 leading-relaxed">Leverage Pakistan's massive skill network today.</p>
              <Link to="/marketplace" className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-orange-500 transition-all shadow-xl shadow-orange-950/20 active:scale-95">
                 <Plus size={18} />
                 New Request
              </Link>
           </div>

           <div className="rounded-[2.5rem] bg-white p-10 border border-neutral-100 shadow-sm">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-10">Quick Actions</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Guide', to: '/', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
                   { name: 'Support', to: '/chat', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-50' },
                   { name: 'Wallet', to: '/wallet', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                   { name: 'Refer', to: '/profile', icon: Share2, color: 'text-orange-500', bg: 'bg-orange-50' }
                 ].map(item => (
                   <Link 
                    key={item.name} 
                    to={item.to}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-all group"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm bg-white ${item.color} group-hover:scale-110 transition-all`}>
                            <item.icon size={20} />
                         </div>
                         <span className="text-sm font-bold text-neutral-600 font-sans group-hover:text-neutral-900 transition-colors uppercase tracking-widest text-[11px]">{item.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-neutral-200 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

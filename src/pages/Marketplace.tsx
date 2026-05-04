import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign,
  ChevronRight,
  TrendingUp,
  Tag,
  Plus,
  X,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Marketplace = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Task Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('Social Media');
  const [isCreating, setIsCreating] = useState(false);

  const categories = ['All', 'Social Media', 'Data Entry', 'Survey', 'Graphic Design', 'Content Writing', 'Transcription', 'Video Editing', 'App Testing', 'Virtual Assistant', 'Research', 'Translation'];

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle || !newDesc || !newPrice) return;
    
    setIsCreating(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTitle,
        description: newDesc,
        price: parseFloat(newPrice),
        category: newCat,
        creatorId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'tasks');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12 mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="font-display text-5xl font-bold text-neutral-900 tracking-tight mb-4">Marketplace</h1>
            <p className="text-neutral-500 font-medium">Discover micro-opportunities and trade your skills for instant earnings.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Find a task..." 
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-neutral-900/10 hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus size={18} /> Post Task
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-neutral-50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white text-neutral-400 border border-neutral-100 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] flex items-center gap-3">
          {filteredTasks.length} Opportunities Found
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-[2.5rem] bg-neutral-50 animate-pulse border border-neutral-100" />
            ))
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
               <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center text-neutral-200 mb-6 shadow-sm">
                  <Search size={32} />
               </div>
               <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2 tracking-tight">No tasks found</h3>
               <p className="text-neutral-500 font-medium">Try adjusting your filters to find more work.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link 
                  to={`/tasks/${task.id}`}
                  className="group relative flex flex-col h-full rounded-[2.5rem] bg-white border border-neutral-100 p-8 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                       <Tag size={20} />
                    </div>
                    <div className="flex flex-col items-end">
                       <div className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl tracking-tight leading-none">${task.price?.toFixed(2)}</div>
                       <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Ready</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 mb-10">
                    <h3 className="font-display text-xl font-bold text-neutral-900 leading-tight group-hover:text-orange-600 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-neutral-500 text-sm font-medium line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{task.category || 'Gig'}</span>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-900 p-2 transform transition-transform group-hover:translate-x-1 group-hover:bg-orange-600 group-hover:text-white">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
               onClick={() => setShowCreateModal(false)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Zap size={120} />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black text-neutral-900">Post a New Task</h2>
                      <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-neutral-50 transition-colors"><X size={20}/></button>
                   </div>

                   <form onSubmit={handleCreateTask} className="space-y-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Task Title</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Like my photo on Instagram"
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-bold text-neutral-900 focus:ring-2 focus:ring-orange-500/20"
                           required
                           value={newTitle}
                           onChange={(e) => setNewTitle(e.target.value)}
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Category</label>
                          <select 
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-bold text-neutral-900 focus:ring-2 focus:ring-orange-500/20 appearance-none"
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                          >
                             {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Price ($)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-black text-neutral-900 focus:ring-2 focus:ring-orange-500/20"
                            required
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Instructions / Description</label>
                         <textarea 
                           placeholder="What does the worker need to do? Mention how to provide proof."
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-none font-medium text-neutral-900 h-32 focus:ring-2 focus:ring-orange-500/20"
                           required
                           value={newDesc}
                           onChange={(e) => setNewDesc(e.target.value)}
                         />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-neutral-900 text-white font-black py-5 rounded-3xl mt-4 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
                      >
                         {isCreating ? 'Posting...' : (
                           <>
                             Post Task to Market
                           </>
                         )}
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

export default Marketplace;

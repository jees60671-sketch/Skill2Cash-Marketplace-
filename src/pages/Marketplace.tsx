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
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [timePeriod, setTimePeriod] = useState('all'); // all, 24h, 7d, 30d
  const [sortBy, setSortBy] = useState('newest'); // newest, price-high, price-low
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Task Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('Social Media');
  const [newMinRating, setNewMinRating] = useState('0');
  const [isCreating, setIsCreating] = useState(false);

  const categories = ['All', 'Social Media', 'Content Review', 'Data Entry', 'Survey', 'Short Video', 'Writing', 'Translation', 'Transcription', 'Testing', 'Research', 'Marketing', 'Administrative', 'Voice Over', 'Coding Help'];

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
        requiredRating: parseInt(newMinRating),
        creatorId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
      setNewMinRating('0');
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
    
    const price = task.price || 0;
    const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);
    
    const reqRating = task.requiredRating || 0;
    const matchesRating = reqRating >= parseInt(minRating);

    const createdAt = task.createdAt?.toDate ? task.createdAt.toDate() : new Date();
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffHours = diffMs / (1000 * 60 * 60);

    const matchesTime = timePeriod === 'all' || 
                        (timePeriod === '24h' && diffHours <= 24) ||
                        (timePeriod === '7d' && diffDays <= 7) ||
                        (timePeriod === '30d' && diffDays <= 30);

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating && matchesTime;
  }).sort((a, b) => {
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'price-low') return a.price - b.price;
    // Default to newest
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('0');
    setTimePeriod('all');
    setSortBy('newest');
    setSelectedCategory('All');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12 mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="font-display text-5xl font-bold text-neutral-900 tracking-tight mb-4">Marketplace</h1>
            <p className="text-neutral-500 font-medium">Discover micro-opportunities and trade your skills for instant earnings.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-80 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Find a task..." 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 bg-white dark:bg-neutral-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-bold text-sm text-neutral-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl border transition-all ${
                  showFilters || minPrice || maxPrice || minRating !== '0' || sortBy !== 'newest'
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' 
                    : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 dark:bg-orange-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-neutral-900/10 hover:bg-neutral-800 dark:hover:bg-orange-500 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus size={18} /> Post Task
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 mb-8"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Price Range ($)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-bold text-neutral-900 dark:text-white"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-neutral-300">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-bold text-neutral-900 dark:text-white"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Worker Rating Req.</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-bold text-neutral-900 dark:text-white appearance-none"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="0">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Time Period</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-bold text-neutral-900 dark:text-white appearance-none"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                  >
                    <option value="all">Any Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Sort By</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm font-bold text-neutral-900 dark:text-white appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Recently Posted</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={clearFilters}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-600 uppercase tracking-widest">{task.category || 'Gig'}</span>
                       {task.requiredRating > 0 && (
                         <span className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md">
                           ★ {task.requiredRating}+
                         </span>
                       )}
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 transform transition-transform group-hover:translate-x-1 group-hover:bg-orange-600 group-hover:text-white">
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
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20"
                           required
                           value={newTitle}
                           onChange={(e) => setNewTitle(e.target.value)}
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Category</label>
                          <select 
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 appearance-none"
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
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-black text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20"
                            required
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Worker Rating Req.</label>
                          <select 
                             className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 appearance-none"
                             value={newMinRating}
                             onChange={(e) => setNewMinRating(e.target.value)}
                           >
                              <option value="0">Open to All</option>
                              <option value="1">1+ Star Workers</option>
                              <option value="2">2+ Star Workers</option>
                              <option value="3">3+ Star Workers</option>
                              <option value="4">Top Rated (4+)</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Est. Duration</label>
                          <div className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold text-neutral-400 italic text-[11px] flex items-center justify-center">
                             AI Calculated
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Instructions / Description</label>
                         <textarea 
                           placeholder="What does the worker need to do? Mention how to provide proof."
                           className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-medium text-neutral-900 dark:text-white h-32 focus:ring-2 focus:ring-orange-500/20"
                           required
                           value={newDesc}
                           onChange={(e) => setNewDesc(e.target.value)}
                         />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-neutral-900 dark:bg-orange-600 text-white font-black py-5 rounded-3xl mt-4 hover:bg-neutral-800 dark:hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
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

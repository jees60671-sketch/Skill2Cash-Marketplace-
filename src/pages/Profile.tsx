import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Star, CheckCircle2, Clock, ShieldCheck, Mail } from 'lucide-react';

const Profile = () => {
  const { uid } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'reviews'>('tasks');

  useEffect(() => {
    if (!uid) return;
    
    const fetchProfile = async () => {
      try {
        const profileSnap = await getDoc(doc(db, 'users', uid));
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        const taskQ = query(
          collection(db, 'tasks'),
          where('workerId', '==', uid),
          where('status', '==', 'completed'),
          orderBy('updatedAt', 'desc')
        );
        const taskSnap = await getDocs(taskQ);
        setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const reviewQ = query(
          collection(db, 'reviews'),
          where('revieweeId', '==', uid),
          orderBy('createdAt', 'desc')
        );
        const reviewSnap = await getDocs(reviewQ);
        setReviews(reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  if (loading) return <div className="p-12 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-12 text-center">User not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[3rem] shadow-xl border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="h-48 bg-neutral-900 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-blue-600/20" />
           <div className="absolute -bottom-16 left-12">
              <div className="h-32 w-32 rounded-3xl bg-white p-2 shadow-2xl">
                 <div className="h-full w-full rounded-2xl bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
                    ) : (
                      <User size={48} className="text-neutral-400" />
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-20 px-12 pb-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                 <h1 className="text-4xl font-black text-neutral-900 tracking-tight">{profile.displayName}</h1>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-orange-600 font-bold">
                       <Star size={18} fill="currentColor" />
                       {profile.rating?.toFixed(1) || '0.0'}
                       <span className="text-neutral-400 font-medium ml-1">({profile.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                       <ShieldCheck size={14} className="text-blue-500" /> Verified Member
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button className="px-8 py-3 rounded-2xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20">Message</button>
                 <button className="p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600"><Mail size={20} /></button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-neutral-100">
              <div className="text-center md:text-left">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Tasks Completed</span>
                 <span className="text-3xl font-black text-neutral-900">{tasks.length}</span>
              </div>
              <div className="text-center md:text-left">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Reviews Received</span>
                 <span className="text-3xl font-black text-neutral-900">{reviews.length}</span>
              </div>
              <div className="text-center md:text-left">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Member Since</span>
                 <span className="text-3xl font-black text-neutral-900">{new Date(profile.createdAt?.toDate?.() || Date.now()).getFullYear()}</span>
              </div>
           </div>

           <div className="mt-12">
              <div className="flex items-center gap-8 border-b border-neutral-100 mb-8">
                 <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === 'tasks' ? 'border-orange-600 text-neutral-900' : 'border-transparent text-neutral-400'
                  }`}
                 >
                   Execution History
                 </button>
                 <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === 'reviews' ? 'border-orange-600 text-neutral-900' : 'border-transparent text-neutral-400'
                  }`}
                 >
                   Reviews
                 </button>
              </div>

              {activeTab === 'tasks' ? (
                tasks.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200 text-neutral-400">
                    No completed tasks to show.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div key={task.id} className="p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">{task.title}</h4>
                              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{task.category}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-black text-lg text-neutral-900">${task.price?.toFixed(2)}</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              {new Date(task.updatedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                reviews.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200 text-neutral-400">
                    No reviews received yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="p-8 rounded-[2.5rem] bg-neutral-50 border border-neutral-100 relative">
                        <div className="flex items-center gap-1 text-orange-500 mb-4">
                           {Array(5).fill(0).map((_, i) => (
                             <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                           ))}
                        </div>
                        <p className="text-neutral-700 font-medium leading-relaxed mb-6 italic">"{review.comment}"</p>
                        <div className="flex items-center justify-between mt-4 pb-2 border-t border-neutral-100 pt-4">
                           <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                              Reviewer ID: {review.reviewerId.slice(0, 8)}...
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              <Clock size={12} />
                              {new Date(review.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

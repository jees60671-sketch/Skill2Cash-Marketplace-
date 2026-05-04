import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Wallet, 
  ShoppingBag, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(notif => {
      if (!notif.read) {
        const ref = doc(db, 'users', user.uid, 'notifications', notif.id);
        batch.update(ref, { read: true });
      }
    });
    await batch.commit();
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), {
      read: true
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'wallet': return <Wallet className="text-emerald-500" />;
      case 'task': return <ShoppingBag className="text-orange-500" />;
      case 'message': return <MessageSquare className="text-blue-500" />;
      default: return <Bell className="text-neutral-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Notifications</h1>
          <p className="text-neutral-500 font-medium">Stay updated with your latest alerts.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
          >
            <CheckCircle2 size={18} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full bg-white rounded-3xl animate-pulse border border-neutral-100" />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-neutral-100">
             <div className="h-16 w-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-300">
                <Bell size={32} />
             </div>
             <h3 className="text-xl font-bold text-neutral-900">All caught up!</h3>
             <p className="text-neutral-500">No new notifications at the moment.</p>
             <Link to="/marketplace" className="inline-flex mt-6 bg-neutral-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-neutral-800 transition-all">
                Browse Tasks
             </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`relative p-6 rounded-[2rem] border transition-all ${
                  notif.read ? 'bg-white border-neutral-100 opacity-60' : 'bg-white border-orange-200 shadow-sm'
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                {!notif.read && (
                  <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-orange-600" />
                )}
                <div className="flex gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-neutral-50' : 'bg-neutral-100'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-1">{notif.title}</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed">{notif.message}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                       <Clock size={12} />
                       {notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Notifications;

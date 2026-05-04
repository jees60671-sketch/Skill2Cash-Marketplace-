import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Wallet, 
  MessageSquare, 
  User, 
  LogOut,
  Sparkles,
  Bell
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'motion/react';

const Navbar = () => {
  const { userData } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Market', path: '/marketplace', icon: ShoppingBag },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-xl transition-all group-hover:scale-105 group-hover:bg-orange-600 group-hover:border-orange-500">
                <Sparkles size={18} className="text-orange-500 group-hover:text-white transition-colors" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-neutral-900 italic">
                SKILL<span className="text-orange-600">2CASH</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-orange-600' 
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={18} />
                      {item.name}
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
               <Bell size={20} />
               {unreadCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-orange-600 border-2 border-white text-[8px] font-black text-white">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
            </Link>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest leading-none">Wallet</span>
              <span className="text-sm font-bold text-neutral-900">${userData?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            
            <Link to={`/profile/${userData?.uid}`} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1 pr-3 hover:bg-neutral-100 transition-colors">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="User" referrerPolicy="no-referrer" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="text-sm font-medium text-neutral-700 hidden sm:inline">{userData?.displayName?.split(' ')[0] || 'User'}</span>
            </Link>

            <button 
              onClick={() => auth.signOut()}
              className="rounded-full p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Target, ShieldCheck, Globe, Banknote, Sparkles, HeartHandshake, Shield, MessageCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white dark:bg-neutral-950 selection:bg-orange-100 selection:text-orange-900 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-100 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-neutral-900 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-orange-500" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              SKILL<span className="text-orange-600">2CASH</span>
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/trust" className="hidden md:block text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Trust</Link>
            <Link to="/marketplace" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Marketplace</Link>
            <Link to="/auth" className="text-sm font-bold text-white bg-neutral-900 dark:bg-orange-600 px-6 py-2.5 rounded-xl hover:bg-neutral-800 dark:hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-neutral-900/10 dark:shadow-orange-600/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 mb-8">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-500 font-display">
                  Live in Pakistan & Worldwide
                </span>
              </div>
              <h1 className="font-display text-6xl md:text-8xl font-bold tracking-[-0.04em] text-neutral-900 dark:text-white leading-[0.9] mb-8">
                Turn your <br />
                <span className="text-orange-600">Spare Time</span> <br />
                into Earnings.
              </h1>
              <p className="max-w-md text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-12">
                The most advanced micro-task ecosystem. Secure escrow, intelligent verification, and direct-to-bank payouts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-neutral-900 dark:bg-white px-10 py-5 text-sm font-bold text-white dark:text-neutral-900 shadow-2xl transition-all hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:-translate-y-1 active:translate-y-0"
                >
                  Join Marketplace
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-10 py-5 text-sm font-bold text-neutral-900 dark:text-white transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  Browse Tasks
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative z-10 p-4 bg-neutral-900 dark:bg-neutral-800 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
                <div className="aspect-[1.1] rounded-[2rem] bg-neutral-800 dark:bg-neutral-900 border border-neutral-700/50 overflow-hidden relative">
                  {/* Decorative Dashboard UI Elements */}
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-neutral-700 rounded-full" />
                      <div className="h-8 w-8 rounded-full bg-orange-600/20 flex items-center justify-center">
                        <Zap size={16} className="text-orange-500" />
                      </div>
                    </div>
                    <div className="h-40 w-full bg-neutral-700/30 rounded-3xl border border-neutral-700/50 flex items-center justify-center px-12">
                       <div className="w-full space-y-3">
                          <div className="h-2 w-full bg-neutral-600 rounded-full" />
                          <div className="h-2 w-2/3 bg-neutral-600 rounded-full" />
                          <div className="h-2 w-1/2 bg-neutral-600 rounded-full opacity-50" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-orange-600/10 rounded-2xl border border-orange-500/20 flex flex-col p-4 justify-between">
                         <div className="h-2 w-12 bg-orange-500/30 rounded-full" />
                         <div className="text-2xl font-display font-bold text-orange-500">$1,420</div>
                      </div>
                      <div className="h-24 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex flex-col p-4 justify-between">
                         <div className="h-2 w-12 bg-blue-500/30 rounded-full" />
                         <div className="text-2xl font-display font-bold text-blue-500">248</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-900 to-transparent opacity-50" />
                </div>
              </div>
              {/* Background Shapes */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-[100px] -z-10" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Referral Teaser */}
      <section className="py-24 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
         <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-4xl font-black mb-6 tracking-tight">Earn more with <span className="text-orange-500">Referrals</span></h2>
                  <p className="text-neutral-400 dark:text-neutral-500 font-medium mb-10 text-lg">Invite your friends and earn a commission on every task they complete. It's the ultimate way to build passive income.</p>
                  <div className="space-y-4">
                     {[
                       { icon: HeartHandshake, title: 'Mutual Bonus', desc: 'Both you and your friend get a $0.50 starter bonus.' },
                       { icon: Target, title: 'No Limits', desc: 'Invite as many people as you want. Truly unlimited.' }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-4">
                          <div className="h-10 w-10 bg-white/10 dark:bg-neutral-100 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                             <item.icon size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-sm">{item.title}</h4>
                             <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 uppercase tracking-widest font-black leading-tight">{item.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white/5 dark:bg-neutral-50 rounded-[3rem] p-10 border border-white/10 dark:border-neutral-200">
                  <div className="text-center">
                     <Shield className="h-16 w-16 text-orange-600 mx-auto mb-6" />
                     <h3 className="text-2xl font-black mb-2">Verified & Secure</h3>
                     <p className="text-neutral-400 dark:text-neutral-500 text-sm font-medium mb-8">We use enterprise-grade security to protect your earnings and identity.</p>
                     <Link to="/trust" className="inline-block border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">
                        View Trust Page
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-orange-600" />
              <span className="font-display text-xl font-bold tracking-tight text-neutral-900 dark:text-white italic">SKILL2CASH</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
               <Link to="/trust" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Trust</Link>
               <Link to="/contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Contact</Link>
               <Link to="/feedback" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Feedback</Link>
               <Link to="/marketplace" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Market</Link>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-neutral-50 dark:border-neutral-900 text-center">
            <p className="text-xs font-bold text-neutral-300 dark:text-neutral-700 uppercase tracking-[0.5em]">© 2026 SKILL2CASH ENTERPRISE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

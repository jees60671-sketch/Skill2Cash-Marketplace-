import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Target, ShieldCheck, Globe, Banknote, Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-orange-500" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
              SKILL<span className="text-orange-600">2CASH</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/marketplace" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">Marketplace</Link>
            <Link to="/auth" className="text-sm font-bold text-white bg-neutral-900 px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/10">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-8">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 font-display">
                  Live in Pakistan & Worldwide
                </span>
              </div>
              <h1 className="font-display text-6xl md:text-8xl font-bold tracking-[-0.04em] text-neutral-900 leading-[0.9] mb-8">
                Turn your <br />
                <span className="text-orange-600">Spare Time</span> <br />
                into Earnings.
              </h1>
              <p className="max-w-md text-lg text-neutral-500 font-medium leading-relaxed mb-12">
                A professional-grade micro-task marketplace. Secure escrow, instant verification, and localized withdrawals for the modern workforce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-neutral-900 px-10 py-5 text-sm font-bold text-white shadow-2xl transition-all hover:bg-neutral-800 hover:-translate-y-1 active:translate-y-0"
                >
                  Join Marketplace
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-10 py-5 text-sm font-bold text-neutral-900 transition-all hover:bg-neutral-50 hover:border-neutral-300"
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
              <div className="relative z-10 p-4 bg-neutral-900 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
                <div className="aspect-[1.1] rounded-[2rem] bg-neutral-800 border border-neutral-700/50 overflow-hidden relative">
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
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-900 to-transparent" />
                </div>
              </div>
              {/* Background Shapes */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-100 rounded-full blur-[100px] -z-10" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-12">Trusted by 10,000+ Workers in Pakistan</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <div className="flex items-center justify-center gap-2 font-display font-bold text-2xl">JAZZ<span className="text-orange-500 text-xs">CASH</span></div>
             <div className="flex items-center justify-center gap-2 font-display font-bold text-2xl">EASY<span className="text-emerald-500 text-xs">PAISA</span></div>
             <div className="flex items-center justify-center gap-2 font-display font-bold text-2xl tracking-tighter">PAYPAL</div>
             <div className="flex items-center justify-center gap-2 font-display font-bold text-2xl italic tracking-tight">FIREBASE</div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-neutral-50">
        <div className="mx-auto max-max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="font-display text-5xl font-bold tracking-tight text-neutral-900 mb-6">Designed for Reliability.</h2>
              <p className="text-lg text-neutral-500 font-medium">We've built the most secure platform for micro-earning, focusing on what matters: fast approvals and instant payouts.</p>
            </div>
            <Link to="/marketplace" className="text-sm font-bold text-neutral-900 flex items-center gap-2 group underline-offset-8 hover:underline italic">
              See the marketplace in action
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Precision Matching', desc: 'Our algorithm connects you with tasks that match your verified skill set perfectly.', color: 'border-orange-200 bg-orange-50/30' },
              { icon: ShieldCheck, title: 'Escrow Guarantee', desc: 'Secure payment is held in escrow from the start. You work, you earn, you get paid.', color: 'border-blue-200 bg-blue-50/30' },
              { icon: Banknote, title: 'Instant Liquidity', desc: 'Withdraw your earnings as soon as the task is marked as finished. No long wait times.', color: 'border-emerald-200 bg-emerald-50/30' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className={`p-10 rounded-[2.5rem] border transition-all hover:bg-white hover:shadow-2xl ${f.color}`}
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-neutral-900 mb-8 border border-neutral-100">
                  <f.icon size={26} />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-40 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-12">Start your journey today.</h2>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-3xl bg-neutral-900 px-12 py-6 text-lg font-bold text-white shadow-3xl hover:bg-neutral-800 transition-all active:scale-95"
          >
            Create your account
          </Link>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-50/50 -z-10 blur-[100px] rounded-full scale-150" />
      </section>

      <footer className="py-20 border-t border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-orange-600" />
              <span className="font-display text-xl font-bold tracking-tight text-neutral-900 italic">SKILL2CASH</span>
            </div>
            <div className="flex gap-12 text-sm font-bold text-neutral-500 uppercase tracking-widest">
               <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
               <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
               <a href="#" className="hover:text-neutral-900 transition-colors">Careers</a>
               <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-neutral-50 text-center">
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-[0.5em]">© 2026 SKILL2CASH ENTERPRISE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

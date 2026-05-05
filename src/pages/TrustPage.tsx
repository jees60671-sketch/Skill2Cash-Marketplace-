import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Shield, HeartHandshake, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

const TrustPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 mx-auto mb-8 shadow-xl"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight mb-6">
            Built on <span className="text-emerald-600">Trust</span>
          </h1>
          <p className="text-xl text-neutral-500 font-medium">
            SKILL2CASH is committed to creating a secure and transparent marketplace for the Pakistani workforce.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              title: 'Secure Payouts', 
              desc: 'Every withdrawal is manually verified by our team to ensure your hard-earned money reaches you safely.',
              icon: Lock,
              color: 'text-orange-600',
              bg: 'bg-orange-50 dark:bg-orange-900/10'
            },
            { 
              title: 'Verified Tasks', 
              desc: 'We scan every task posted to our marketplace to prevent scams and ensure fair working conditions.',
              icon: BadgeCheck,
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/10'
            },
            { 
              title: 'Data Privacy', 
              desc: 'Your personal information and identity are encrypted. We never share your data with third parties.',
              icon: Shield,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-900/10'
            },
            { 
              title: 'Anti-Bot Protection', 
              desc: 'Our system uses advanced detection to ensure only real humans can earn on SKILL2CASH.',
              icon: HeartHandshake,
              color: 'text-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-900/10'
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group"
            >
              <div className={`h-14 w-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-12 rounded-[3.5rem] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 dark:bg-emerald-600/5 -skew-x-12 translate-x-1/2" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">Our Promise to You</h2>
              <p className="text-neutral-400 dark:text-neutral-500 font-medium mb-8">
                We believe in the power of micro-entrepreneurship. Our platform is built to empower you to turn your skills into a reliable stream of income, without the complexity of traditional freelancing sites.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-neutral-100 font-bold text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Transparent
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-neutral-100 font-bold text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Reliable
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-emerald-500 font-display text-8xl font-black opacity-20">100%</div>
              <div className="text-2xl font-bold mt-[-2rem]">Safe & Secured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustPage;

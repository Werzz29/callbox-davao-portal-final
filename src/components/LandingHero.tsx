/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Fingerprint, Cpu, Clock 
} from 'lucide-react';

interface LandingHeroProps {
  onEnterPortal: () => void;
  onOpenSitemap: () => void;
}

export default function LandingHero({ onEnterPortal, onOpenSitemap }: LandingHeroProps) {
  const [dvoTime, setDvoTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const string = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setDvoTime(string);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden relative flex flex-col justify-between" id="portal-landing-hero">
      
      {/* Decorative gradient glowing backing fields */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-50px] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating high-tech abstract nodes */}
      <div className="absolute top-24 left-[10%] opacity-20 hidden md:block animate-pulse">
        <div className="h-2 w-2 rounded-full bg-brand-primary gold-glow" />
      </div>
      <div className="absolute top-48 right-[15%] opacity-20 hidden md:block animate-bounce" style={{ animationDuration: '6s' }}>
        <div className="h-3 w-3 rounded-full bg-brand-accent gold-glow" />
      </div>

      {/* 1. Header Navigation Bar */}
      <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-surface/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-sm">
              <Fingerprint className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-white tracking-tight uppercase text-xs sm:text-sm">
              CALLBOX <span className="text-brand-primary">DAVAO</span>
            </span>
          </div>

          {/* Dynamic Davao timezone clock in the middle of the header */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary/10 rounded-xl border border-brand-primary/15 text-gray-300 font-mono text-[10px] sm:text-xs">
            <Clock className="h-3.5 w-3.5 text-brand-primary animate-pulse shrink-0" />
            <span className="text-gray-500 hidden xs:inline">DVO LOCAL:</span>
            <span className="text-white font-bold tracking-wider">{dvoTime || "00:00:00 AM"}</span>
            <span className="text-[9px] px-1.5 py-0.2 select-none bg-brand-primary/15 text-brand-primary/95 border border-brand-primary/20 rounded font-bold uppercase hidden md:inline">PST</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Tech Specs Overlay button */}
            <button
              onClick={onOpenSitemap}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all cursor-pointer"
              title="Open Blueprint specifications"
            >
              <Cpu className="h-3.5 w-3.5 text-brand-primary" /> Technical Specs
            </button>
          </div>
        </div>
      </header>

      {/* 2. Primary Hero Body */}
      <main className="relative flex-1 flex items-center justify-center z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-12 md:py-20 lg:py-24">
        <div className="space-y-8 text-center flex flex-col items-center">
          
          {/* Soft alert pill */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/15 rounded-full text-[10px] sm:text-xs font-mono text-brand-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-ping" />
            <span>Callbox Davao Branch active portal</span>
          </motion.div>

          {/* Display Headings */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Everything Callbox.
            <span className="block text-gradient mt-1">One Workspace.</span>
          </motion.h1>

          {/* Subheadings */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed"
          >
            Access company tools, operational resources, announcements, training materials, and employee services through a centralized, secure intranet gate node.
          </motion.p>

          {/* CTA panel buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onEnterPortal}
              className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono border-none cursor-pointer group"
              id="landing-cta-enter"
            >
              Access Employee Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Micro credentials checklist */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-8 border-t border-white/5 w-full max-w-2xl justify-center"
          >
            {[
              { label: 'Supabase Handshake' },
              { label: 'Outbound CRM Nodes' },
              { label: 'Compliance Policies' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-mono">
                <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </main>

      {/* 3. Footer branding log */}
      <footer className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-20 border-t border-white/5 mt-auto text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-600">
          <span>© 2026 Callbox Inc. Davao Branch. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Security protocols</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Support desk (Local: 512)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, Scale, FileText, Users, Landmark, AlertTriangle, HelpCircle, HardDrive, ScrollText
} from 'lucide-react';

interface PolicyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'community';
}

export default function PolicyOverlay({ isOpen, onClose, initialTab = 'terms' }: PolicyOverlayProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'community'>(initialTab);

  // Sync active tab with initialTab prop when overlay opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      document.body.classList.add('scroll-locked');
      document.documentElement.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    };
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/85 backdrop-blur-md">
        {/* Backdrop dismiss click handler */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative h-full w-full max-w-4xl overflow-y-auto border-l border-white/10 bg-[#0b0f19] p-6 sm:p-8 text-brand-light shadow-2xl z-10 flex flex-col justify-between"
          id="legal-policy-drawer"
        >
          <div>
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-8 pr-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
                <span className="font-mono text-xs tracking-widest text-brand-primary uppercase">Compliance & Ethics Center</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Callbox Davao Legal & Operational Guidelines</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Official operational standards, privacy frameworks, and employee guidelines for Callbox Inc. Davao Branch.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scrollbar-thin">
              {[
                { id: 'terms', label: 'Terms & Conditions', icon: ScrollText },
                { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
                { id: 'community', label: 'Community Guidelines', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs tracking-wider uppercase transition-all duration-200 shrink-0 cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-brand-primary text-brand-dark font-semibold shadow-lg shadow-brand-primary/10' 
                        : 'text-gray-400 hover:text-brand-light hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content view panels */}
            <div className="mt-4 prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed space-y-6">
              
              {/* 1. TERMS & CONDITIONS */}
              {activeTab === 'terms' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/10 bg-brand-surface/40 p-5">
                    <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-brand-primary" /> 1. Overview of Platform Usage Terms
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      This system constitutes a proprietary node of Callbox Inc. (Davao Branch). Authorized personnel must comply with the conditions below. Unauthorized attempts to gain root access or extract information are strictly penalized under Republic Act No. 10175 (Cybercrime Prevention Act of 2012).
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-2 border-brand-primary/30 pl-4">
                      <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">Section 1.1: System Entitlement & Security</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Accounts are assigned specifically to employees of Callbox Davao. Shareable logging credentials are strictly prohibited. Employees are legally accountable for all actions performed using their designated account credentials.
                      </p>
                    </div>

                    <div className="border-l-2 border-brand-primary/30 pl-4">
                      <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">Section 1.2: System Monitoring and Auditing</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Callbox IT maintains absolute audit transparency. The system log records operations including file modifications, portal sign-ins, and data state transitions. By using this portal, you express full, unretractable consent to real-time security tracking and session observation.
                      </p>
                    </div>

                    <div className="border-l-2 border-brand-primary/30 pl-4">
                      <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">Section 1.3: Acceptable Limitations of Liability</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        The platform is offered on an "AS IS" and "AS AVAILABLE" paradigm. Callbox does not assume liability for temporary workspace downtimes or loss of draft items caused by unexpected local ISP/infrastructure disruptions in the Davao region.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20 text-xs">
                    <AlertTriangle className="h-5 w-5 text-brand-primary shrink-0" />
                    <span className="text-gray-400">
                      Failure to adhere to the aforementioned terms will trigger immediate disciplinary panels and potential revocation of secure branch credentials.
                    </span>
                  </div>
                </div>
              )}

              {/* 2. PRIVACY POLICY */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/10 bg-brand-surface/40 p-5">
                    <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-brand-primary" /> Data Privacy Act (DPA) of 2012 Compliance
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      We strictly respect and implement the principles of Republic Act No. 10173, also known as the Philippine Data Privacy Act of 2012. Callbox Davao guarantees the confidentiality, integrity, and safety of employee personal information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-brand-primary">
                        <HardDrive className="h-3.5 w-3.5" /> What Data We Gather
                      </h4>
                      <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                        <li>Official Employee IDs and structural titles</li>
                        <li>Session IP logs & Davao branch locations</li>
                        <li>Activity inputs, system task actions</li>
                        <li>Temporary browser session configurations</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-brand-primary">
                        <HelpCircle className="h-3.5 w-3.5" /> Why We Process Data
                      </h4>
                      <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                        <li>To verify identity & maintain local portal security</li>
                        <li>To streamline task management and scheduling</li>
                        <li>To generate analytics on operational efficiency</li>
                        <li>To enforce automatic inactivity lockouts</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">Data Storage and Safeguard Measures</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      All collected data is stored in localized secure servers utilizing state-of-the-art AES-256 cryptographic configurations. No data is shared with external third-party agencies unless mandated by Philippine national legal framework processes. Under the DPA, employees reserve absolute rights to inspect, update, or appeal for erasure of their recorded details.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. COMMUNITY GUIDELINES */}
              {activeTab === 'community' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/10 bg-brand-surface/40 p-5">
                    <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-primary" /> Professional Ethics & Collaboration Guide
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Our system is engineered to foster professional, helpful, and respectful collaboration across the Davao Callbox branch. Employees must observe peak cyber-hygiene and ethical practices in all visual workspaces.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Permitted Core Behaviors</h4>
                      <ul className="text-xs text-gray-400 mt-1.5 space-y-1 list-disc list-inside">
                        <li>Fostering constructive criticism during joint work exercises</li>
                        <li>Sharing reliable operational workflows, shortcuts, and document models</li>
                        <li>Reporting software errors immediately to the local IT Help Desk</li>
                        <li>Supporting branch co-workers with clarity and high-quality solutions</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">Unacceptable Violations</h4>
                      <ul className="text-xs text-gray-400 mt-1.5 space-y-1 list-disc list-inside">
                        <li>Using offensive language or inappropriate visual layouts in announcements</li>
                        <li>Intentionally inserting malicious code scripts, XSS vectors, or corrupted objects</li>
                        <li>Using company portal dashboards for non-operational social tasks</li>
                        <li>Simulating activity through custom macro-scripts to bypass the session safety timer</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">Incident Reporting Mechanisms</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      If you witness a violation of these guidelines or experience unfair behavior on the network, submit an anonymous ticket directly via local branch extension 512 or email the site compliance group.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer of the Drawer */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-500">
            <span>Callbox Inc. Branch SEC Reg No. CS200812345</span>
            <div className="flex gap-4">
              <span>Updated: July 2026</span>
              <span>Version: 3.2.1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

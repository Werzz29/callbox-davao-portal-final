/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Lock, Unlock, ArrowRight, FileText, ScrollText, Users, Check, AlertCircle
} from 'lucide-react';
import { Employee } from '../types';

interface PolicyAcceptanceModalProps {
  isOpen: boolean;
  currentUser: Employee;
  onAccept: () => void;
  onDecline: () => void;
  onReviewPolicy: (tab: 'terms' | 'privacy' | 'community') => void;
}

export default function PolicyAcceptanceModal({ 
  isOpen, 
  currentUser, 
  onAccept, 
  onDecline,
  onReviewPolicy 
}: PolicyAcceptanceModalProps) {
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedPrivacy, setCheckedPrivacy] = useState(false);
  const [checkedCommunity, setCheckedCommunity] = useState(false);
  
  // Track if they have actually clicked to review each policy
  const [reviewedTerms, setReviewedTerms] = useState(false);
  const [reviewedPrivacy, setReviewedPrivacy] = useState(false);
  const [reviewedCommunity, setReviewedCommunity] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const allChecked = checkedTerms && checkedPrivacy && checkedCommunity;

  const handleReview = (type: 'terms' | 'privacy' | 'community') => {
    if (type === 'terms') {
      setReviewedTerms(true);
      setCheckedTerms(true); // Auto-check for smoother UX once they open/review
    } else if (type === 'privacy') {
      setReviewedPrivacy(true);
      setCheckedPrivacy(true);
    } else if (type === 'community') {
      setReviewedCommunity(true);
      setCheckedCommunity(true);
    }
    onReviewPolicy(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;

    setIsSubmitting(true);
    // Simulate biometric/cryptographic registration of signature
    setTimeout(() => {
      onAccept();
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl bg-[#0b0f19] border border-white/10 rounded-3xl p-6 sm:p-8 text-brand-light shadow-2xl space-y-6"
        id="policy-acceptance-modal"
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary mb-2 gold-glow">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-primary"></span>
            <span className="font-mono text-[10px] tracking-widest text-brand-primary uppercase">Security Compliance Roster</span>
          </div>
          
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
            Operational Policy Consent Required
          </h2>
          
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Attention <span className="text-brand-secondary font-medium">{currentUser.name}</span>. To complete your secure gateway entry, you are required to review and consent to our updated administrative, legal, and privacy guidelines.
          </p>
        </div>

        {/* Regulatory Citation Notice */}
        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex gap-2.5 items-start text-[11px] text-gray-400 leading-relaxed">
          <AlertCircle className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
          <span>
            Complies with <strong className="text-white">RA 10173 (Data Privacy Act of 2012)</strong> and <strong className="text-white">RA 10175 (Cybercrime Prevention Act of 2012)</strong> of the Republic of the Philippines.
          </span>
        </div>

        {/* Policy Interactive Checklist */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            
            {/* 1. TERMS */}
            <div 
              onClick={() => setCheckedTerms(!checkedTerms)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-between gap-4 ${
                checkedTerms 
                  ? 'bg-brand-primary/5 border-brand-primary/30' 
                  : 'bg-white/2 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 ${
                  checkedTerms 
                    ? 'bg-brand-primary border-brand-primary text-brand-dark' 
                    : 'border-white/30 text-transparent'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-white">Terms & platform Conditions</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Governs system monitoring, session monitoring and liability caps.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview('terms');
                }}
                className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-md border transition-all duration-200 shrink-0 cursor-pointer ${
                  reviewedTerms 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-brand-primary hover:bg-brand-primary/10'
                }`}
              >
                {reviewedTerms ? 'Reviewed ✓' : 'Review Doc'}
              </button>
            </div>

            {/* 2. PRIVACY POLICY */}
            <div 
              onClick={() => setCheckedPrivacy(!checkedPrivacy)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-between gap-4 ${
                checkedPrivacy 
                  ? 'bg-brand-primary/5 border-brand-primary/30' 
                  : 'bg-white/2 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 ${
                  checkedPrivacy 
                    ? 'bg-brand-primary border-brand-primary text-brand-dark' 
                    : 'border-white/30 text-transparent'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-white">Data Privacy Policy</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Confirms compliance with Republic Act No. 10173 frameworks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview('privacy');
                }}
                className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-md border transition-all duration-200 shrink-0 cursor-pointer ${
                  reviewedPrivacy 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-brand-primary hover:bg-brand-primary/10'
                }`}
              >
                {reviewedPrivacy ? 'Reviewed ✓' : 'Review Doc'}
              </button>
            </div>

            {/* 3. COMMUNITY GUIDELINES */}
            <div 
              onClick={() => setCheckedCommunity(!checkedCommunity)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-between gap-4 ${
                checkedCommunity 
                  ? 'bg-brand-primary/5 border-brand-primary/30' 
                  : 'bg-white/2 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 ${
                  checkedCommunity 
                    ? 'bg-brand-primary border-brand-primary text-brand-dark' 
                    : 'border-white/30 text-transparent'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-white">Community & Ethics Guidelines</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Defines rules of professional collaboration and cyber hygiene.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview('community');
                }}
                className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-md border transition-all duration-200 shrink-0 cursor-pointer ${
                  reviewedCommunity 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-brand-primary hover:bg-brand-primary/10'
                }`}
              >
                {reviewedCommunity ? 'Reviewed ✓' : 'Review Doc'}
              </button>
            </div>

          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={!allChecked || isSubmitting}
              className={`w-full py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                allChecked && !isSubmitting
                  ? 'bg-brand-primary text-brand-dark hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5'
                  : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-brand-dark border-t-transparent animate-spin" />
                  <span>Registering Secure Signature...</span>
                </>
              ) : (
                <>
                  {allChecked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4 text-gray-500" />}
                  <span>Confirm Agreement & Enter Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onDecline}
              className="w-full py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Decline & Exit Gateway
            </button>
            
            {!allChecked && (
              <p className="text-[10px] text-center text-gray-500 mt-2 font-mono">
                * Please check all checkboxes or review the documents to authorize.
              </p>
            )}
          </div>
        </form>

        {/* Security watermark footer */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-500">
          <span>SEC PROTOCOL CO-1902</span>
          <span>DAVAO GATEWAY COMPLIANT</span>
        </div>
      </motion.div>
    </div>
  );
}

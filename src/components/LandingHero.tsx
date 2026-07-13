/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Clock, ChevronLeft, ChevronRight, Megaphone, User, Calendar, X, Pin,
  MapPin, Users, Award, BookOpen, Phone, ChevronDown, ChevronUp, Mail, Globe, Building, Search, Filter,
  Menu
} from 'lucide-react';
import { Announcement } from '../types';
import { mockAnnouncements } from '../mockData';
import CallboxLogo from './CallboxLogo';

interface LandingHeroProps {
  onEnterPortal: (tab?: string) => void;
  onOpenSitemap: () => void;
  onOpenPolicy?: (tab: 'terms' | 'privacy' | 'community') => void;
  announcements?: Announcement[];
}

export default function LandingHero({ onEnterPortal, onOpenSitemap, onOpenPolicy, announcements }: LandingHeroProps) {
  const [dvoTime, setDvoTime] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [itemsPerView, setItemsPerView] = React.useState(1);
  const [autoplay, setAutoplay] = React.useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);
  const [activeSection, setActiveSection] = React.useState('portal-landing-hero');
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [showAllAnnouncements, setShowAllAnnouncements] = React.useState(false);
  const [bulletinSearchQuery, setBulletinSearchQuery] = React.useState('');
  const [bulletinFilterCategory, setBulletinFilterCategory] = React.useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const announcementsToUse = announcements || mockAnnouncements;

  // Lock body scroll when announcement/bulletin modal is open
  React.useEffect(() => {
    const isAnyModalOpen = !!selectedAnnouncement || showAllAnnouncements;
    if (isAnyModalOpen) {
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
  }, [selectedAnnouncement, showAllAnnouncements]);

  // Handle section smooth scrolling with offsets for the sticky header
  const scrollToSection = (id: string) => {
    if (id === 'portal-landing-hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Track scroll position to update active navbar links dynamically
  React.useEffect(() => {
    const handleScroll = () => {
      // Toggle scroll to top button visibility
      setShowScrollTop(window.scrollY > 400);

      const bulletinEl = document.getElementById('landing-bulletin-slideshow');
      const aboutEl = document.getElementById('about-workspace-section');
      const faqEl = document.getElementById('faq-section');

      const scrollPosition = window.scrollY + 180; // Offset for detection triggers

      let currentSection = 'portal-landing-hero';
      if (faqEl && scrollPosition >= faqEl.offsetTop) {
        currentSection = 'faq-section';
      } else if (aboutEl && scrollPosition >= aboutEl.offsetTop) {
        currentSection = 'about-workspace-section';
      } else if (bulletinEl && scrollPosition >= bulletinEl.offsetTop) {
        currentSection = 'landing-bulletin-slideshow';
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, announcementsToUse.length - itemsPerView);

  // Safeguard index bounds on screen size / dataset resizing
  React.useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  // Wrap around index properly
  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  // Autoplay intervals
  React.useEffect(() => {
    if (!autoplay || maxIndex === 0 || selectedAnnouncement) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay, maxIndex, selectedAnnouncement, nextSlide]);

  return (
    <div className="flex-1 bg-transparent overflow-x-hidden relative flex flex-col justify-between" id="portal-landing-hero">
      
      {/* Sui-style Premium Sticky Navigation Header */}
      <header className="w-full border-b border-white/5 bg-[#030712]/60 backdrop-blur-md z-30 sticky top-0 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand name */}
        <div 
          id="header-brand-logo-container" 
          className="flex items-center gap-3 cursor-pointer group hover:scale-105 transition-transform duration-300 ease-out origin-left" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <CallboxLogo 
            className="h-6 w-auto transition-transform duration-300 ease-out group-hover:rotate-3 hover:rotate-3" 
            caretColor="#FFB800" 
            textColor="#ffffff" 
          />
          <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 transition-all duration-300 ease-out group-hover:translate-x-1">Davao</span>
        </div>

        {/* Middle: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: 'Home', targetId: 'portal-landing-hero' },
            { label: 'Bulletins', targetId: 'landing-bulletin-slideshow' },
            { label: 'About', targetId: 'about-workspace-section' },
            { label: 'FAQ', targetId: 'faq-section' }
          ].map((item) => {
            const isActive = activeSection === item.targetId;
            return (
              <button 
                key={item.targetId} 
                onClick={() => scrollToSection(item.targetId)}
                className={`relative py-1 text-xs font-mono tracking-wider uppercase font-bold transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-white'
                }`}
                id={`nav-link-${item.targetId}`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-brand-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls (Mobile burger + SUI-style action button) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSitemap}
            id="landing-cta-sitemap"
            className="hidden sm:block px-5 py-2 bg-white hover:bg-gray-100 text-black hover:scale-[1.02] active:scale-[0.98] font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 font-mono border border-transparent cursor-pointer"
          >
            Sitemap Index
          </button>
          
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-300 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden w-full border-b border-white/5 bg-[#030712]/95 backdrop-blur-lg overflow-hidden z-25 sticky top-[57px]"
          >
            <div className="px-5 py-6 flex flex-col gap-4">
              {[
                { label: 'Home', targetId: 'portal-landing-hero' },
                { label: 'Bulletins', targetId: 'landing-bulletin-slideshow' },
                { label: 'About', targetId: 'about-workspace-section' },
                { label: 'FAQ', targetId: 'faq-section' }
              ].map((item) => {
                const isActive = activeSection === item.targetId;
                return (
                  <button 
                    key={item.targetId} 
                    onClick={() => {
                      scrollToSection(item.targetId);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 text-xs font-mono tracking-wider uppercase font-bold transition-all duration-300 cursor-pointer flex items-center justify-between border-b border-white/5 pb-2.5 ${
                      isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                  </button>
                );
              })}
              
              {/* Mobile-only sitemap button display (when sm hidden) */}
              <button 
                onClick={() => {
                  onOpenSitemap();
                  setIsMobileMenuOpen(false);
                }}
                className="sm:hidden w-full mt-2 py-3 bg-white hover:bg-gray-100 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 font-mono text-center cursor-pointer"
              >
                Sitemap Index
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative gradient glowing backing fields */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-50px] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating high-tech abstract nodes */}
      <div className="absolute top-24 left-[10%] opacity-45 hidden md:block">
        <div className="h-2 w-2 rounded-full bg-brand-primary gold-glow-pulse" />
      </div>
      <div className="absolute top-48 right-[15%] opacity-45 hidden md:block">
        <div className="h-3 w-3 rounded-full bg-brand-accent gold-glow-pulse" />
      </div>

      {/* 2. Primary Hero Body */}
      <main className="relative flex-1 flex flex-col items-center justify-center z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-16 md:py-24">
        <div className="space-y-8 text-center flex flex-col items-center w-full">
          
          {/* Soft alert pill with time */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/15 rounded-full text-[10px] sm:text-xs font-mono text-brand-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-ping" />
            <span>Callbox Davao Branch active portal • Davao Time: {dvoTime || 'Loading...'}</span>
          </motion.div>

          {/* Display Headings with SUI-style progressive horizontal stretch & blur effect */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full flex flex-col items-center"
          >
            {/* The Stretched/Blurred dynamic letters container */}
            <div className="w-full overflow-visible py-4 flex justify-center">
              <div className="flex flex-col lg:flex-row items-center justify-center font-display font-black tracking-tight text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white select-none relative gap-y-2 lg:gap-y-0 lg:gap-x-5">
                {/* Word 1: Everything */}
                <div className="flex flex-row items-center justify-center">
                  {"Everything".split("").map((char, index) => {
                    const globalIndex = index;
                    const stretchStart = 8;
                    const factor = Math.max(0, globalIndex - stretchStart);
                    const scaleX = 1 + (factor * 0.05); // horizontal stretching
                    const opacity = Math.max(0.2, 1 - (factor * 0.035)); // fade
                    
                    return (
                      <span
                        key={globalIndex}
                        className="inline-block transition-all duration-300"
                        style={{
                          transform: `scaleX(${scaleX})`,
                          transformOrigin: 'left center',
                          filter: 'none',
                          opacity: opacity,
                          color: factor > 0 ? '#38bdf8' : '#ffffff',
                          marginRight: '1px',
                          textShadow: factor > 0 ? `0 0 15px rgba(56, 189, 248, ${0.4 * opacity})` : 'none'
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                {/* Word 2: Callbox. */}
                <div className="flex flex-row items-center justify-center">
                  {"Callbox.".split("").map((char, index) => {
                    const globalIndex = index + 11;
                    const stretchStart = 8;
                    const factor = Math.max(0, globalIndex - stretchStart);
                    const scaleX = 1 + (factor * 0.05); // horizontal stretching
                    const opacity = Math.max(0.2, 1 - (factor * 0.035)); // fade
                    
                    return (
                      <span
                        key={globalIndex}
                        className="inline-block transition-all duration-300"
                        style={{
                          transform: `scaleX(${scaleX})`,
                          transformOrigin: 'left center',
                          filter: 'none',
                          opacity: opacity,
                          color: factor > 0 ? '#38bdf8' : '#ffffff',
                          marginRight: index >= 11 ? '8px' : '1px',
                          textShadow: factor > 0 ? `0 0 15px rgba(56, 189, 248, ${0.4 * opacity})` : 'none'
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subheadings */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Callbox Davao delivers the full suite of outbound solutions and business growth tools — powered by outbound CRM nodes and our unified workspace gate.
          </motion.p>

          {/* SUI-style flat rectangular high-contrast action buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-row items-center justify-center gap-4 pt-4"
          >
            <button
               onClick={() => onEnterPortal()}
               className="px-8 py-3.5 bg-brand-secondary hover:bg-brand-primary text-white hover:text-brand-dark border border-white/10 font-bold text-xs uppercase tracking-wider rounded-none transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
               id="landing-cta-portal"
             >
              Access Portal
            </button>
          </motion.div>

          {/* Micro credentials checklist */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 pt-10 sm:mt-14 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-8 border-t border-white/5 w-full max-w-2xl justify-center"
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

          {/* 🚨 Horizontally Sliding Bulletin Slideshow 🚨 */}
          {announcementsToUse.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-5xl mx-auto mt-28 sm:mt-40 pt-16 sm:pt-24 pb-16 sm:pb-24 border-t border-white/5 space-y-6"
              id="landing-bulletin-slideshow"
            >
              {/* Slideshow Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-brand-primary">
                    <Megaphone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary">Callbox Davao Branch Bulletins</h3>
                  </div>
                </div>

                {/* Status Indicator & Show All Button */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 rounded-full border border-white/10 text-[9px] font-mono text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                    <span>{announcementsToUse.length} active announcements</span>
                  </div>
                  <button
                    onClick={() => {
                      setBulletinSearchQuery('');
                      setBulletinFilterCategory('All');
                      setShowAllAnnouncements(true);
                    }}
                    className="px-4 py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-brand-dark border border-brand-primary/20 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer"
                    id="btn-show-all-bulletins"
                  >
                    View All
                  </button>
                </div>
              </div>

              {/* Slider track viewport */}
              {announcementsToUse.length === 1 ? (
                /* Static Roomy Layout when there's "no other post" (put spacing if no other post) */
                <div className="flex justify-center w-full py-6 px-2">
                  {announcementsToUse.map((ann) => {
                    let badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (ann.category === 'HR Notice') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    else if (ann.category === 'Operations') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    else if (ann.category === 'Training') badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                    else if (ann.category === 'Upcoming Event') badgeColor = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
                    else if (ann.category === 'IT Support') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <div
                        key={ann.id}
                        className="w-full max-w-3xl text-left p-10 sm:p-12 bg-brand-surface/30 hover:bg-brand-surface/45 hover:border-brand-primary/40 border border-brand-primary/15 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[280px] shadow-lg group hover:scale-[1.01]"
                        onClick={() => setSelectedAnnouncement(ann)}
                        id={`announcement-slide-${ann.id}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase border px-3 py-1 rounded-full ${badgeColor}`}>
                              {ann.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 font-semibold">
                              {ann.isPinned && <Pin className="h-3.5 w-3.5 text-brand-primary fill-brand-primary shrink-0" />}
                              <span>{ann.publishedDate}</span>
                            </div>
                          </div>

                          <h4 className="text-white font-display text-lg sm:text-xl md:text-2xl font-bold tracking-wide group-hover:text-brand-primary transition-colors flex items-center gap-2">
                            {ann.icon ? (
                              <span className="text-xl sm:text-2xl shrink-0 leading-none">{ann.icon}</span>
                            ) : null}
                            <span>{ann.title}</span>
                          </h4>

                          <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed line-clamp-3 mt-2.5">
                            {ann.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono text-brand-primary mt-6 pt-5 border-t border-white/5">
                          <span className="truncate max-w-[200px] text-gray-500">Posted by: {ann.publishedBy}</span>
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read full details &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Infinite ticker running LTR, compress card widths when there are many */
                <div className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden py-4 pause-hover">
                  {/* Premium screen-edge fades for continuous blending */}
                  <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/70 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0f1a] via-[#0a0f1a]/70 to-transparent z-10 pointer-events-none" />

                  {/* LTR scrolling row (the list is repeated 4 times to render infinite background width flawlessly) */}
                  <div 
                    className="animate-marquee-ltr flex flex-row items-center gap-6"
                    style={{
                      animationDuration: `${Math.max(40, announcementsToUse.length * 15)}s`
                    }}
                  >
                    {[...announcementsToUse, ...announcementsToUse, ...announcementsToUse, ...announcementsToUse].map((ann, idx) => {
                      let badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      if (ann.category === 'HR Notice') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                      else if (ann.category === 'Operations') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      else if (ann.category === 'Training') badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                      else if (ann.category === 'Upcoming Event') badgeColor = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
                      else if (ann.category === 'IT Support') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                      // Compress cards if there are many active posts, otherwise spacious layout
                      const isMany = announcementsToUse.length >= 4;
                      // Increased sizes for both compressed and spacious states:
                      const cardWidthClass = isMany ? 'w-[360px] sm:w-[400px]' : 'w-[420px] sm:w-[460px]';
                      const cardPaddingClass = isMany ? 'p-6 sm:p-8' : 'p-8 sm:p-10';
                      const cardHeightClass = isMany ? 'h-56 sm:h-64' : 'h-64 sm:h-72';

                      return (
                        <div
                          key={`${ann.id}-rep-${idx}`}
                          className={`shrink-0 text-left cursor-pointer select-none ${cardWidthClass}`}
                          onClick={() => setSelectedAnnouncement(ann)}
                        >
                          <div className={`${cardPaddingClass} bg-brand-surface/10 hover:bg-brand-surface/35 border border-white/5 hover:border-brand-primary/30 rounded-2xl flex flex-col justify-between ${cardHeightClass} transition-all duration-300 group`}>
                            <div>
                              {/* Metadata Row */}
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase border px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                                  {ann.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 font-semibold">
                                  {ann.isPinned && <Pin className="h-3.5 w-3.5 text-brand-primary fill-brand-primary shrink-0" />}
                                  <span>{ann.publishedDate}</span>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="text-white font-display text-base sm:text-lg font-bold tracking-snug line-clamp-2 group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                                {ann.icon ? (
                                  <span className="text-base sm:text-lg shrink-0 leading-none">{ann.icon}</span>
                                ) : null}
                                <span>{ann.title}</span>
                              </h4>

                              {/* Summary */}
                              <p className="text-[13px] sm:text-[14px] text-gray-400 font-sans leading-relaxed line-clamp-3 mt-2">
                                {ann.summary}
                              </p>
                            </div>

                            {/* Footer link */}
                            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-brand-primary mt-3 pt-3 border-t border-white/5">
                              <span className="truncate max-w-[140px] text-gray-500">By {ann.publishedBy}</span>
                              <span className="font-bold uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">Read &rarr;</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>

      {/* 2.5 About Callbox Davao Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-48 pb-20 border-t border-white/5 space-y-20" id="about-workspace-section">
        {/* Title row */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-brand-primary/10 border border-brand-primary/15 rounded-full text-[10px] font-mono text-brand-primary uppercase tracking-wider">
              About Our Branch
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              About Callbox <span className="text-gradient">Davao.</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] sm:text-xs text-brand-primary uppercase tracking-widest max-w-sm leading-relaxed border-l border-brand-primary/20 pl-4 text-left">
            Connecting global enterprises from the heart of Southern Philippines.
          </p>
        </div>

        {/* Two-column split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Identity & Pillars */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4 text-left">
              <p className="font-sans text-sm text-gray-400 leading-relaxed">
                As one of Callbox’s flagship multi-channel operational nodes, the Davao City branch delivers premium B2B lead generation, market expansion, and appointment setting campaigns for global enterprises.
              </p>
              <p className="font-sans text-sm text-gray-400 leading-relaxed">
                Our workspace is designed to bridge regional talent with high-standard cloud infrastructures, offering team members a supportive, cohesive ecosystem equipped with compliant databases, dual-redundant network paths, and direct support streams.
              </p>
            </div>

            {/* Value Pillars List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {[
                {
                  icon: <Award className="h-5 w-5 text-brand-primary shrink-0" />,
                  title: "Regional Pride",
                  description: "Cultivating top-tier Southern Mindanao talent to match international communication standards."
                },
                {
                  icon: <Users className="h-5 w-5 text-brand-primary shrink-0" />,
                  title: "Unified Roster",
                  description: "Coordinating 220+ operations specialists through shared portals and active supervisor pipelines."
                },
                {
                  icon: <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0" />,
                  title: "Strict Compliance",
                  description: "Rigorous security audits, local site protocols, and clean administrative credential systems."
                },
                {
                  icon: <Building className="h-5 w-5 text-brand-primary shrink-0" />,
                  title: "Robust Infrastructure",
                  description: "Dual backup power generators and high-speed dedicated lease lines ensuring zero downtime."
                }
              ].map((pillar, idx) => (
                <div key={idx} className="space-y-2 text-left bg-white/2 border border-white/5 rounded-2xl p-4.5 hover:border-brand-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-primary/10 border border-brand-primary/15 rounded-xl text-brand-primary">
                      {pillar.icon}
                    </div>
                    <h4 className="text-white font-display text-xs sm:text-sm font-bold tracking-wide">
                      {pillar.title}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed pl-0.5">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Quick Stats & Shift Hours Card */}
          <div className="lg:col-span-6 space-y-8">
            {/* Stats Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "150+", label: "Workstations" },
                { value: "220+", label: "Specialists" },
                { value: "99.98%", label: "Average Uptime" },
                { value: "80,000+", label: "Daily Call Attempts" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-brand-surface/20 border border-white/5 hover:border-brand-primary/20 rounded-2xl p-5 text-center transition-all duration-300 group">
                  <span className="block text-3xl sm:text-4xl font-display font-black text-brand-primary group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Core Support Details Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-left">
              <h3 className="text-white font-display text-base font-bold tracking-wide flex items-center gap-2 border-b border-white/5 pb-3">
                <Globe className="h-4.5 w-4.5 text-brand-primary" />
                <span>Operational Desk Coordinates</span>
              </h3>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="block text-gray-200 font-semibold text-left">Physical Site Address</span>
                    <span className="text-gray-400 leading-relaxed text-left block">IT Park Building, Davao City, Southern Mindanao, Philippines 8000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="block text-gray-200 font-semibold text-left">Coverage Alignment</span>
                    <span className="text-gray-400 leading-relaxed text-left block">24 hours / 5 days a week supporting APAC, EMEA, and North American campaigns.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="block text-gray-200 font-semibold text-left">Local Extension Help</span>
                    <span className="text-gray-400 text-left block font-mono">Ext 512 (IT Helpdesk) • Ext 104 (HR Office) • compliance@callboxinc.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordions Section */}
        <div className="space-y-12 mt-24 pt-16 pb-16 border-t border-white/5 max-w-5xl mx-auto" id="faq-section">
          <div className="space-y-2 text-center">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="font-sans text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              Understand how Callbox Davao manages compliance, self-service passcodes, and infrastructure.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              {
                question: "What is the primary purpose of this centralized Workspace?",
                answer: "The Callbox Davao Central Workspace acts as a secure intranet portal for branch employees. It unifies operations by providing access to official communication nodes, internal tool directories (LinkHub), compliant documentation, and live branch announcements."
              },
              {
                question: "How do I update or reset my self-service login passcode?",
                answer: "First-time users can establish a custom passcode on their initial login. If you need to reset an existing passcode, you can use the self-service request feature on the login page. This submits a secure authorization request to the Super Admin's queue for review and clearance."
              },
              {
                question: "What are the core operational coverage shifts of the Davao Branch?",
                answer: "The Davao branch maintains 24/5 live coverage to support global markets. This includes the APAC shift (8:00 AM - 5:00 PM PHT), EMEA coverage (2:00 PM - 11:00 PM PHT), and US Eastern/Western coverage (10:00 PM - 7:00 AM PHT)."
              },
              {
                question: "How are compliance and data security managed within the portal?",
                answer: "We adhere strictly to international standards, utilizing secure Row-Level Security (RLS) policies within our database cluster. All admin changes, employee designations, and database updates generate irreversible cryptographic audit logs visible to Super Admins."
              },
              {
                question: "Who can I contact for localized IT support or workstation issues?",
                answer: "For real-time hardware, software, or network support, call the local IT Support desk at Extension 512. For compliance concerns, email compliance@callboxinc.com or open a ticket through the official Resource Library."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-white/5 bg-brand-surface/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-primary/10"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-white bg-transparent hover:bg-white/2 transition-colors cursor-pointer border-none font-sans"
                  >
                    <span className="font-display text-xs sm:text-sm font-semibold pr-4 leading-normal">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-brand-primary shrink-0 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 shrink-0 transition-transform duration-300" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-white/5 font-sans text-xs text-gray-400 leading-relaxed whitespace-pre-line text-left">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Footer branding log */}
      <footer className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-20 border-t border-white/5 mt-auto text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-600">
          <span>© 2026 Callbox Inc. Davao Branch. All Rights Reserved.</span>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1">
            <span className="hover:text-gray-400 transition-colors cursor-pointer" onClick={onOpenSitemap}>Sitemap Index</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer" onClick={() => onOpenPolicy?.('terms')}>Terms</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer" onClick={() => onOpenPolicy?.('privacy')}>Privacy</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer" onClick={() => onOpenPolicy?.('community')}>Guidelines</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Support desk (Local: 512)</span>
          </div>
        </div>
      </footer>

      {/* Dynamic Announcement detail reader modal overlay */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-xl w-full rounded-3xl border border-white/10 bg-brand-surface p-6 sm:p-8 text-left shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                title="Dismiss Notice"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-brand-primary bg-brand-primary/10 border border-brand-primary/15 px-2.5 py-0.5 rounded-full">
                  {selectedAnnouncement.category}
                </span>
                
                <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-3 leading-snug flex items-center gap-2">
                  {selectedAnnouncement.icon ? (
                    <span className="text-2xl shrink-0 leading-none">{selectedAnnouncement.icon}</span>
                  ) : null}
                  <span>{selectedAnnouncement.title}</span>
                </h3>
              </div>

              {/* Notice Metadata Row */}
              <div className="border-t border-b border-white/10 py-3 mb-5 flex flex-wrap gap-4 text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span>Posted by: <strong className="text-gray-300">{selectedAnnouncement.publishedBy}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Date: <strong className="text-gray-300">{selectedAnnouncement.publishedDate}</strong></span>
                </div>
              </div>

              {/* Notice Complete Body */}
              <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans space-y-3 max-h-[45vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {selectedAnnouncement.content}
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary hover:gold-glow text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Dismiss Broadcast
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Bulletins Modal Overlay */}
      <AnimatePresence>
        {showAllAnnouncements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-4xl w-full rounded-3xl border border-white/10 bg-[#0a0f1a] p-6 sm:p-8 text-left shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAllAnnouncements(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Megaphone className="h-5 w-5" />
                  <span className="font-mono text-xs uppercase font-bold tracking-widest">Callbox Davao Bulletin Board</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                  All Active Announcements
                </h3>
              </div>

              {/* Search and Category Filters */}
              <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search announcements by keyword, title, or details..."
                    value={bulletinSearchQuery}
                    onChange={(e) => setBulletinSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/45 transition-colors font-sans"
                  />
                  {bulletinSearchQuery && (
                    <button
                      onClick={() => setBulletinSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['All', 'HR Notice', 'Operations', 'Training', 'Upcoming Event', 'IT Support'].map((cat) => {
                    const isSelected = bulletinFilterCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setBulletinFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-primary text-brand-dark border-brand-primary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list of filtered announcements */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {(() => {
                  const filtered = announcementsToUse.filter((ann) => {
                    const matchesSearch = 
                      ann.title.toLowerCase().includes(bulletinSearchQuery.toLowerCase()) ||
                      ann.summary.toLowerCase().includes(bulletinSearchQuery.toLowerCase());
                    const matchesCategory = 
                      bulletinFilterCategory === 'All' || 
                      ann.category === bulletinFilterCategory;
                    return matchesSearch && matchesCategory;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 space-y-3">
                        <p className="text-sm text-gray-500 font-mono">No matching announcements found.</p>
                        <button
                          onClick={() => {
                            setBulletinSearchQuery('');
                            setBulletinFilterCategory('All');
                          }}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all font-mono"
                        >
                          Reset Filters
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((ann) => {
                    let badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (ann.category === 'HR Notice') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    else if (ann.category === 'Operations') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    else if (ann.category === 'Training') badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                    else if (ann.category === 'Upcoming Event') badgeColor = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
                    else if (ann.category === 'IT Support') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <div
                        key={ann.id}
                        onClick={() => {
                          setSelectedAnnouncement(ann);
                        }}
                        className="p-5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-brand-primary/30 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                      >
                        <div className="space-y-2 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold tracking-wider uppercase border px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {ann.category}
                            </span>
                            {ann.isPinned && (
                              <span className="flex items-center gap-1 text-[9px] font-mono text-brand-primary uppercase font-bold">
                                <Pin className="h-3 w-3 fill-brand-primary shrink-0" />
                                Pinned
                              </span>
                            )}
                          </div>

                          <h4 className="text-white font-display text-base font-bold tracking-wide group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                            {ann.icon && <span className="text-lg shrink-0">{ann.icon}</span>}
                            <span>{ann.title}</span>
                          </h4>

                          <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 max-w-2xl">
                            {ann.summary}
                          </p>
                        </div>

                        <div className="flex flex-row sm:flex-col justify-between sm:items-end text-[10px] font-mono text-gray-500 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 shrink-0">
                          <span className="truncate max-w-[150px]">By {ann.publishedBy}</span>
                          <span>{ann.publishedDate}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                <span>Showing {
                  announcementsToUse.filter((ann) => {
                    const matchesSearch = 
                      ann.title.toLowerCase().includes(bulletinSearchQuery.toLowerCase()) ||
                      ann.summary.toLowerCase().includes(bulletinSearchQuery.toLowerCase());
                    const matchesCategory = 
                      bulletinFilterCategory === 'All' || 
                      ann.category === bulletinFilterCategory;
                    return matchesSearch && matchesCategory;
                  }).length
                } of {announcementsToUse.length} Bulletins</span>
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncements(false)}
                  className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Close Board
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('portal-landing-hero')}
            className="fixed bottom-8 right-8 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-brand-dark shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-brand-primary/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.55)] transition-shadow cursor-pointer focus:outline-none"
            title="Scroll to Top"
            id="btn-scroll-to-top"
          >
            <ChevronUp className="h-6 w-6 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

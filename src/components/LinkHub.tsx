/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Star, Sparkles, ExternalLink, Activity, ArrowRight,
  Mail, MessageSquare, Video, Database, PhoneCall, Users, 
  Fingerprint, Wrench, DollarSign, GraduationCap, BookOpen, BarChart3, Clock, Check, AlertCircle,
  ArrowLeft, RotateCw, Copy, Globe, X, Shield, Eye, ChevronLeft, ChevronRight, LayoutGrid, Sliders
} from 'lucide-react';
import { ResourceLink, UserRole } from '../types';

// Real-time responsive Link Preview Image Component with Unsplash thematic fallbacks
export function LinkPreviewImage({ 
  url, 
  category, 
  alt, 
  onClick,
  children
}: { 
  url: string; 
  category: string; 
  alt: string; 
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const fallbacks: Record<string, string> = {
    'Communication': 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=450&auto=format&fit=crop&q=80',
    'Operations': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=450&auto=format&fit=crop&q=80',
    'Human Resources': 'https://images.unsplash.com/photo-1521791136368-1a46827d0adb?w=450&auto=format&fit=crop&q=80',
    'Learning': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=450&auto=format&fit=crop&q=80',
    'IT Support': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=450&auto=format&fit=crop&q=80',
  };
  
  const defaultImg = fallbacks[category] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=450&auto=format&fit=crop&q=80';
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Lazy load: Observe intersection viewport presence before starting costly dynamic microlink preview downloads
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let active = true;
    let resolved = false;
    setLoading(true);

    // Dynamic responsive fallback: if API requests take longer than 4.5 seconds, fallback to high-res thematic Unsplash
    const timeoutTimer = setTimeout(() => {
      if (active && !resolved) {
        resolved = true;
        setImgSrc(defaultImg);
        setLoading(false);
        setImageLoaded(true);
      }
    }, 4500);

    const delayTimer = setTimeout(() => {
      if (resolved) return;
      const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
      
      const img = new Image();
      img.onload = () => {
        if (active && !resolved) {
          resolved = true;
          setImgSrc(screenshotUrl);
        }
      };
      img.onerror = () => {
        if (active && !resolved) {
          resolved = true;
          setImgSrc(defaultImg);
          setLoading(false);
          setImageLoaded(true);
        }
      };
      img.src = screenshotUrl;
    }, Math.random() * 600 + 100); // Randomized stagger delay to avoid simultaneous API requests limit

    return () => {
      active = false;
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [url, isInView, defaultImg]);

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-44 bg-brand-dark/40 rounded-xl overflow-hidden border border-white/5 mb-3 group-hover:border-brand-primary/25 cursor-pointer transition-all duration-300 active:scale-[0.98]"
      title="Launch external page"
    >
      {/* High-fidelity custom Skeleton Loader with shimmer gradient moving */}
      {(!isInView || loading || !imageLoaded) && (
        <div className="absolute inset-0 z-10 bg-[#070b13] flex flex-col justify-between p-4 overflow-hidden">
          {/* Animated custom shimmer moving left-to-right */}
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" style={{ left: '-50%' }} />
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 bg-white/10 rounded-sm w-3/4 animate-pulse" />
              <div className="h-1.5 bg-white/5 rounded-sm w-1/2 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="h-2 bg-white/5 rounded-sm w-full animate-pulse" />
            <div className="h-2 bg-white/5 rounded-sm w-[90%] animate-pulse" />
          </div>
          
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
            <div className="h-2 bg-white/5 rounded-sm w-12 animate-pulse" />
            <div className="h-4 bg-brand-primary/15 rounded-md w-14 animate-pulse" />
          </div>
        </div>
      )}

      {/* Actual lazy-loaded image view */}
      {isInView && imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => {
            setImageLoaded(true);
            setLoading(false);
          }}
          onError={() => {
            if (imgSrc !== defaultImg) {
              setImgSrc(defaultImg);
            }
          }}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-110 group-hover:brightness-105`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f]/90 via-[#0d121f]/20 to-transparent opacity-80" />
      <div className="absolute bottom-2.5 right-2.5 z-20 p-1.5 bg-brand-dark/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110">
        <ExternalLink className="h-3.5 w-3.5 text-brand-primary" />
      </div>
      {children}
    </div>
  );
}

// Safe component mapper for dynamic Lucide icons
export function DynamicIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  switch (name) {
    case 'Mail': return <Mail className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Video': return <Video className={className} />;
    case 'Database': return <Database className={className} />;
    case 'PhoneCall': return <PhoneCall className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Fingerprint': return <Fingerprint className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'BarChart3': return <BarChart3 className={className} />;
    default: return <ExternalLink className={className} />;
  }
}

interface LinkHubProps {
  links: ResourceLink[];
  onIncrementClick: (linkId: string) => void;
  favorites: string[];
  onToggleFavorite: (linkId: string) => void;
  userRole: UserRole;
  employeeName: string;
  currentUserId: string;
}

export default function LinkHub({ 
  links, 
  onIncrementClick, 
  favorites, 
  onToggleFavorite, 
  userRole,
  employeeName,
  currentUserId
}: LinkHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter links declared early for scroll listeners and sub-hooks
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            link.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [links, searchTerm, selectedCategory]);

  const [recentLaunches, setRecentLaunches] = useState<string[]>([]);

  // Load user-scoped recently visited links
  React.useEffect(() => {
    if (currentUserId) {
      try {
        const saved = localStorage.getItem(`cb_recentLaunches_${currentUserId}`);
        setRecentLaunches(saved ? JSON.parse(saved) : []);
      } catch {
        setRecentLaunches([]);
      }
    } else {
      setRecentLaunches([]);
    }
  }, [currentUserId]);

  // Persist user-scoped recently visited links
  React.useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`cb_recentLaunches_${currentUserId}`, JSON.stringify(recentLaunches));
    }
  }, [recentLaunches, currentUserId]);

  const [launchingLink, setLaunchingLink] = useState<ResourceLink | null>(null);
  const [launchStep, setLaunchStep] = useState(0);

  // Embedded Sandbox Workspace Viewer
  const [sandboxLink, setSandboxLink] = useState<ResourceLink | null>(null);

  // Lock body scroll when sandbox modal or launching transition dialog is open
  useEffect(() => {
    const isAnyModalOpen = !!sandboxLink || !!launchingLink;
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
  }, [sandboxLink, launchingLink]);
  const [sandboxIframeLoading, setSandboxIframeLoading] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'carousel' | 'grid'>('carousel');

  const categories = ['All', 'Communication', 'Operations', 'Human Resources', 'Learning', 'IT Support'];

  // Carousel ref and scroll state synchronizer
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) {
      setScrollProgress(100);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const currentScroll = el.scrollLeft;
    const progress = (currentScroll / maxScrollLeft) * 100;
    setScrollProgress(progress);
    setCanScrollLeft(currentScroll > 5);
    setCanScrollRight(currentScroll < maxScrollLeft - 5);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.82;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    handleCarouselScroll();
    
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', handleCarouselScroll, { passive: true });
    }
    
    window.addEventListener('resize', handleCarouselScroll);
    
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleCarouselScroll);
      }
      window.removeEventListener('resize', handleCarouselScroll);
    };
  }, [filteredLinks]);

  // Handle launch animation sequence
  const handleLaunch = (link: ResourceLink) => {
    onIncrementClick(link.id);
    setRecentLaunches(prev => {
      const filtered = prev.filter(id => id !== link.id);
      return [link.id, ...filtered].slice(0, 4);
    });

    setLaunchingLink(link);
    setLaunchStep(1);

    setTimeout(() => setLaunchStep(2), 700);
    setTimeout(() => setLaunchStep(3), 1500);
    setTimeout(() => {
      setLaunchingLink(null);
      setLaunchStep(0);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }, 2200);
  };

  const mostUsedLinks = useMemo(() => {
    return [...links].sort((a, b) => b.clickCount - a.clickCount).slice(0, 3);
  }, [links]);

  return (
    <div className="space-y-6" id="smart-link-hub-module">
      {/* Intro section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4 text-brand-primary animate-pulse" /> Active System Router
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Central System Catalog</h2>
          <p className="text-sm text-gray-400">Launch authenticated internal workspaces, dialing nodes, and department resources.</p>
        </div>

        {/* Global Hub Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search utility tags, SOPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
            title="Search links"
          />
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex gap-2 pb-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-brand-primary text-brand-dark font-bold' 
                : 'bg-brand-surface border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Main layout: Links Grid (Left) + Analytical Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Links Grid */}
        <div className="lg:col-span-3 space-y-4 overflow-hidden">
          {/* Futuristic Header Panel with glowing status light */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-brand-surface/20 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping" />
                <span className="font-mono text-[10px] text-brand-primary uppercase tracking-widest font-extrabold">
                  {viewLayout === 'carousel' ? 'System Matrix Carousel' : 'Unified Grid Engine'}
                </span>
              </div>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {filteredLinks.length} Active Node{filteredLinks.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Layout Switcher with view all options */}
              <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5 font-mono text-[9px] font-bold">
                <motion.button
                  type="button"
                  onClick={() => setViewLayout('carousel')}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 font-bold flex items-center gap-1.5 ${
                    viewLayout === 'carousel' 
                      ? 'bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/15 font-bold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Carousel slider view"
                >
                  <Sliders className="h-3 w-3" />
                  Slider
                </motion.button>
                <motion.button
                  type="button"
                  id="view-all-links-btn"
                  onClick={() => setViewLayout('grid')}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 font-bold flex items-center gap-1.5 ${
                    viewLayout === 'grid' 
                      ? 'bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/15 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Show all links in a grid"
                >
                  <LayoutGrid className="h-3 w-3" />
                  View All ({filteredLinks.length})
                </motion.button>
              </div>
            </div>
          </div>

          {/* Futuristic carousel view */}
          {links.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-brand-surface/10 flex flex-col items-center justify-center p-6 select-none">
              <div className="h-12 w-12 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-white text-sm font-semibold tracking-wide">No Central Resources Registered</p>
              <p className="text-gray-400 text-xs mt-1 max-w-sm leading-relaxed mx-auto">
                {userRole === 'Employee' 
                  ? 'All sample links have been removed. Central resources are awaiting activation and routing by administrative coordinators.' 
                  : userRole === 'Inactive' 
                    ? 'No guest resources available at this moment. Contact your administrator to register accessible ports.'
                    : 'The resource catalog has been cleared. Administrative accounts are authorized to register new system endpoints.'}
              </p>
              {(userRole === 'Super Admin' || userRole === 'HR') && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="text-[10px] text-gray-500 font-mono">
                    Navigate to <span className="text-brand-primary font-semibold">Governance Panel &gt; Link Registry</span> to configure active system roots.
                  </p>
                </div>
              )}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-brand-surface/20 select-none">
              <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2 animate-bounce" />
              <p className="text-gray-400 text-xs font-medium">No system tags matched your search query</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="mt-2 text-xs text-brand-primary hover:underline font-mono cursor-pointer"
              >
                Reset active filter
              </button>
            </div>
          ) : viewLayout === 'carousel' ? (
            <div className="space-y-4">
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none gap-5 py-2 px-1 relative mask-fade-edges"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredLinks.map((link) => {
                    const isFav = favorites.includes(link.id);
                    return (
                      <motion.div
                        layout
                        key={link.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[285px] sm:w-[320px] md:w-[calc(50%-10px)] xl:w-[calc(33.333%-14px)] shrink-0 snap-start glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-brand-surface/20 p-5 text-left transition-all duration-500 select-none hover:border-brand-primary/25 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(255,199,44,0.06)]"
                      >
                        {/* Top border glowing neon transition */}
                        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent opacity-50 group-hover:via-brand-primary group-hover:opacity-100 transition-all duration-500" />
                        
                        {/* Glowing vertical left edge overlay */}
                        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-brand-primary scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />

                        <div>
                          {/* Auto embedded landing page image preview */}
                          <LinkPreviewImage 
                            url={link.url} 
                            category={link.category} 
                            alt={link.title} 
                            onClick={() => handleLaunch(link)} 
                          >
                            {/* Floating components inside the image preview */}
                            <div className="absolute top-2.5 left-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10 text-brand-primary shadow-lg transition-all duration-300 hover:scale-105">
                              <DynamicIcon name={link.icon} className="h-4.5 w-4.5" />
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(link.id);
                              }}
                              className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 ${
                                isFav 
                                  ? 'bg-brand-primary border-brand-primary text-brand-dark' 
                                  : 'bg-brand-dark/80 border-white/10 text-gray-400 hover:text-white'
                              }`}
                              title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                          </LinkPreviewImage>

                          {/* Category Label and Technical Authority */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="font-mono text-[9px] uppercase font-bold text-brand-accent tracking-widest bg-brand-primary/5 px-2.5 py-0.5 rounded-md border border-brand-primary/10">
                              {link.category}
                            </span>
                            {link.postedBy && (
                              <span className="font-mono text-[8.5px] uppercase font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5" title={`Authorized by ${link.postedBy}`}>
                                By: {link.postedByRole === 'Super Admin' ? 'Admin' : link.postedBy}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-display font-bold text-sm text-white mt-3 group-hover:text-brand-primary transition-colors flex items-center gap-1.5 truncate">
                            {link.title}
                            {link.isPopular && (
                              <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-mono font-bold tracking-tight border border-brand-primary/10">POPULAR</span>
                            )}
                          </h3>
                          
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 min-h-[36px] whitespace-normal leading-relaxed">
                            {link.description}
                          </p>
                        </div>

                        {/* Bottom stats & Launch Trigger */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-3 mt-3 gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                            <Activity className="h-3 w-3 text-brand-primary" />
                            <span>{link.clickCount.toLocaleString()} launches</span>
                          </div>

                          <div className="flex items-center gap-1.5 self-end">
                            <button
                              onClick={() => handleLaunch(link)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/15 hover:bg-brand-primary text-brand-primary hover:text-brand-dark border border-brand-primary/20 hover:border-brand-primary transition-all duration-300 text-[10px] font-semibold font-mono cursor-pointer"
                              title="Launch website directly in another browser tab"
                            >
                              Quick Launch <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Slider timeline & arrow controls */}
              <div className="flex items-center gap-3 bg-brand-surface/10 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    canScrollLeft 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary active:scale-95 cursor-pointer' 
                      : 'bg-white/0 border-white/0 text-gray-600 lg:hover:bg-white/5 hover:text-gray-500 cursor-not-allowed'
                  }`}
                  title="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Cyberpunk progress line tracker */}
                <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-accent to-brand-primary rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(8, scrollProgress))}%` }}
                  />
                </div>

                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest select-none">
                  Track progress
                </div>

                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    canScrollRight
                      ? 'bg-white/5 border-white/10 text-white hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary active:scale-95 cursor-pointer'
                      : 'bg-white/0 border-white/0 text-gray-600 lg:hover:bg-white/5 hover:text-gray-500 cursor-not-allowed'
                  }`}
                  title="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 py-2">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => {
                  const isFav = favorites.includes(link.id);
                  return (
                    <motion.div
                      layout
                      key={link.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-brand-surface/20 p-5 text-left transition-all duration-500 select-none hover:border-brand-primary/25 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(255,199,44,0.06)]"
                    >
                      {/* Top border glowing neon transition */}
                      <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent opacity-50 group-hover:via-brand-primary group-hover:opacity-100 transition-all duration-500" />
                      
                      {/* Glowing vertical left edge overlay */}
                      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-brand-primary scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />

                      <div>
                        {/* Auto embedded landing page image preview */}
                        <LinkPreviewImage 
                          url={link.url} 
                          category={link.category} 
                          alt={link.title} 
                          onClick={() => handleLaunch(link)} 
                        >
                          {/* Floating components inside the image preview */}
                          <div className="absolute top-2.5 left-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10 text-brand-primary shadow-lg transition-all duration-300 hover:scale-105">
                            <DynamicIcon name={link.icon} className="h-4.5 w-4.5" />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(link.id);
                            }}
                            className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 ${
                              isFav 
                                ? 'bg-brand-primary border-brand-primary text-brand-dark' 
                                : 'bg-brand-dark/80 border-white/10 text-gray-400 hover:text-white'
                            }`}
                            title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
                          >
                            <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </LinkPreviewImage>

                        {/* Category Label and Technical Authority */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="font-mono text-[9px] uppercase font-bold text-brand-accent tracking-widest bg-brand-primary/5 px-2.5 py-0.5 rounded-md border border-brand-primary/10">
                            {link.category}
                          </span>
                          {link.postedBy && (
                            <span className="font-mono text-[8.5px] uppercase font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5" title={`Authorized by ${link.postedBy}`}>
                              By: {link.postedByRole === 'Super Admin' ? 'Admin' : link.postedBy}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-display font-bold text-sm text-white mt-3 group-hover:text-brand-primary transition-colors flex items-center gap-1.5 truncate">
                          {link.title}
                          {link.isPopular && (
                            <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-mono font-bold tracking-tight border border-brand-primary/10">POPULAR</span>
                          )}
                        </h3>
                        
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 min-h-[36px] whitespace-normal leading-relaxed">
                          {link.description}
                        </p>
                      </div>

                      {/* Bottom stats & Launch Trigger */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-3 mt-3 gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                          <Activity className="h-3 w-3 text-brand-primary" />
                          <span>{link.clickCount.toLocaleString()} launches</span>
                        </div>

                        <div className="flex items-center gap-1.5 self-end">
                          <button
                            onClick={() => handleLaunch(link)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/15 hover:bg-brand-primary text-brand-primary hover:text-brand-dark border border-brand-primary/20 hover:border-brand-primary transition-all duration-300 text-[10px] font-semibold font-mono cursor-pointer"
                            title="Launch website directly in another browser tab"
                          >
                            Quick Launch <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Helpful interactive instruction tip */}
          <p className="text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1.5 select-none text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-ping" />
            <span>Hover matrix components for active glow, select custom category nodes, or interact via <strong className="text-brand-primary">Quick Launch</strong> parameters.</span>
          </p>
        </div>

        {/* Sidebar Info Panels (Favorites, Analytics, Recent) */}
        <div className="space-y-6">
          
          {/* Favourites Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-brand-primary/10">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-brand-secondary mb-4 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-primary fill-brand-primary" /> Personalized Toolbar
            </h3>
            
            {favorites.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 rounded-xl bg-brand-dark/40 border border-white/5">
                <p>Star items to bookmark on your quick launch dock.</p>
              </div>
            ) : (
              <ul className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-primary/10 hover:scrollbar-thumb-brand-primary/35">
                {links.filter(l => favorites.includes(l.id)).map(link => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleLaunch(link)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/30 transition-all duration-200 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-brand-primary border border-brand-primary/15">
                          <DynamicIcon name={link.icon} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-brand-primary transition-colors">{link.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">{link.category}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-primary transition-colors shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recently Visited Links */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-primary animate-pulse" /> Recently Visited
            </h3>

            {recentLaunches.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-5 border border-dashed border-white/5 rounded-xl font-mono">No visited links recorded yet</p>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-primary/10 hover:scrollbar-thumb-brand-primary/35">
                {recentLaunches.map(id => {
                  const item = links.find(l => l.id === id);
                  if (!item) return null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleLaunch(item)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/25 transition-all duration-200 text-left cursor-pointer group"
                      title={`Revisit ${item.title}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                          <DynamicIcon name={item.icon} className="h-3 w-3" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate group-hover:text-brand-primary transition-colors">{item.title}</p>
                          <p className="text-[9px] text-gray-500 font-mono truncate">{item.category}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[8px] text-brand-primary group-hover:text-white bg-brand-primary/15 group-hover:bg-brand-primary px-1.5 py-0.5 rounded transition-colors shrink-0">VISIT</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Used Statistics Hub */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3.5">
              🔥 Callbox Davao Popularity Indexes
            </h3>
            <div className="space-y-3">
              {mostUsedLinks.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-brand-primary text-xs font-bold w-4">#{idx+1}</span>
                    <span className="text-gray-300 truncate font-medium max-w-[120px]">{item.title}</span>
                  </div>
                  <span className="text-gray-500 text-[10px] shrink-0">{item.clickCount} access</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Launch Portal Simulated Loader with Awwwards style details */}
      <AnimatePresence>
        {launchingLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -10 }}
              className="max-w-md w-full mx-4 rounded-3xl border border-white/15 bg-brand-surface p-8 text-center shadow-2xl relative overflow-hidden"
              id="authenticated-loader"
            >
              {/* Pulsing background glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand-primary/10 blur-3xl animate-pulse" />
              
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/10 mb-6 animate-bounce">
                <DynamicIcon name={launchingLink.icon} className="h-8 w-8" />
              </div>

              <h3 className="font-display text-xl font-bold text-white mb-2">Workspace Redirection</h3>
              <p className="text-xs text-gray-400 px-4 mb-6">
                Establishing handshake pipeline with <span className="text-brand-secondary font-semibold">{launchingLink.title}</span>
              </p>

              {/* Progress Stepper Log */}
              <div className="border border-white/5 bg-brand-dark p-4 rounded-xl mb-6 font-mono text-[11px] text-left leading-relaxed min-h-24">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {userRole === 'Inactive' 
                      ? 'Establishing anonymous guest validation handshake... ACCORDED' 
                      : `Validating credentials for ${employeeName} ... ACCORDED`
                    }
                  </span>
                </div>
                
                {launchStep >= 2 && (
                  <div className="flex items-center gap-2 text-emerald-400 mt-1">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {userRole === 'Inactive' 
                        ? 'Applying sandboxed visitor restrictions... APPLIED' 
                        : `Resolving secure token for role: ${userRole} ... RESOLVED`
                      }
                    </span>
                  </div>
                )}

                {launchStep >= 3 && (
                  <div className="flex items-center gap-2 text-yellow-400 mt-1 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                    <span>Redirecting through Callbox Central VPN network...</span>
                  </div>
                )}
              </div>

              {/* Spinning progress loader line */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="h-full bg-brand-primary rounded-full w-1/3"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded live interactive portal viewer sandbox */}
      <AnimatePresence>
        {sandboxLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-brand-dark/95 backdrop-blur-md p-4 sm:p-6"
            id="portal-sandbox-iframe-overlay"
          >
            {/* Top Chrome Toolbar mock */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-brand-surface/80 border border-white/10 rounded-2xl p-3.5 mb-4 shadow-2xl backdrop-blur-md">
              {/* Left Meta Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 shrink-0">
                  <DynamicIcon name={sandboxLink.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-white truncate max-w-[150px] sm:max-w-[280px]">
                      {sandboxLink.title}
                    </h3>
                    <span className="font-mono text-[9px] font-semibold text-brand-accent uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/10 shrink-0">
                      {sandboxLink.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono truncate flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Sandbox Container Mode
                  </p>
                </div>
              </div>

              {/* Center Address Bar Mock */}
              <div className="flex-1 max-w-xl mx-0 md:mx-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-dark/80 border border-white/5 rounded-xl font-mono text-[10px] text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate select-all text-xs flex-1 text-gray-300">{sandboxLink.url}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sandboxLink.url);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors cursor-pointer"
                    title="Copy direct web link"
                  >
                    {copiedUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setSandboxIframeLoading(true);
                      const frame = document.getElementById('sandbox-viewport') as HTMLIFrameElement;
                      if (frame) frame.src = sandboxLink.url;
                    }}
                    className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors cursor-pointer"
                    title="Force refresh container"
                  >
                    <RotateCw className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Right control buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    handleLaunch(sandboxLink);
                    setSandboxLink(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-primary text-brand-dark rounded-xl text-xs font-semibold font-mono hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Force relaunch directly in fully un-sandboxed secure standard browser tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Launch Tab
                </button>

                <button
                  onClick={() => setSandboxLink(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
                  title="Close and exit workspace preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Warning disclaimer regarding iframe policies */}
            <div className="mb-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-[10px] sm:text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Sandbox Handshake Protocol Disclaimer:</strong> Some external domains (e.g. Google Services, Zoom, Discord, and internal VPN panels) restrict direct iframe rendering using browser headers (<code className="text-white">X-Frame-Options: SAMEORIGIN</code>) to prevent framing exploits. If the viewport below remains blank or states "Connection refused", click the <strong>Launch Tab</strong> button in the top right to complete standard routing.
              </div>
            </div>

            {/* IFrame Viewport Frame */}
            <div className="flex-1 bg-brand-dark rounded-2xl border border-white/10 overflow-hidden relative shadow-inner">
              {sandboxIframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-dark/95 animate-fade-in">
                  <div className="h-10 w-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs text-gray-400 animate-pulse">Mounting landing page into live iframe context wrapper...</p>
                </div>
              )}
              
              <iframe
                id="sandbox-viewport"
                src={sandboxLink.url}
                className="w-full h-full bg-[#111113]"
                referrerPolicy="no-referrer"
                onLoad={() => setSandboxIframeLoading(false)}
                title={`Live Workspace Viewport - ${sandboxLink.title}`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

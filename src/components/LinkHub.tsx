/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Star, Sparkles, ExternalLink, Activity, ArrowRight,
  Mail, MessageSquare, Video, Database, PhoneCall, Users, 
  Fingerprint, Wrench, DollarSign, GraduationCap, BookOpen, BarChart3, Clock, Check, AlertCircle 
} from 'lucide-react';
import { ResourceLink, UserRole } from '../types';

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

  // Custom Controls for the Infinite Marquee Slides
  const [speed, setSpeed] = useState<number>(135); // animation duration in seconds
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'marquee' | 'grid'>('marquee');

  const categories = ['All', 'Communication', 'Operations', 'Human Resources', 'Learning', 'IT Support'];

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

  // Filter links
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            link.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [links, searchTerm, selectedCategory]);

  const duplicatedLinks = useMemo(() => {
    if (filteredLinks.length === 0) return [];
    let list = [...filteredLinks];
    // Scale up catalog length so animation is continuous & fills horizontal space
    while (list.length < 10) {
      list = [...list, ...filteredLinks];
    }
    // Duplicate fully to build seamless 50% loop offset boundaries
    return [...list, ...list];
  }, [filteredLinks]);

  const mostUsedLinks = useMemo(() => {
    return [...links].sort((a, b) => b.clickCount - a.clickCount).slice(0, 3);
  }, [links]);

  return (
    <div className="space-y-6" id="smart-link-hub-module">
      {/* Intro section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" /> Smart Resource Router
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Central System Catalog</h2>
          <p className="text-sm text-gray-400">Launch authenticated internal workspaces, dialing nodes, and human resources utilities.</p>
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
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-brand-primary text-brand-dark font-bold' 
                : 'bg-brand-surface border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main layout: Links Grid (Left) + Analytical Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Links Grid */}
        <div className="lg:col-span-3 space-y-4 overflow-hidden">
          {/* Marquee Header Toolbar with controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-brand-surface/30 px-4 py-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="font-mono text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                  {viewLayout === 'marquee' ? 'Infinite Slideshow' : 'Unified Hub Grid'}
                </span>
              </div>
              
              <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5 font-mono text-[9px] relative align-middle self-center font-bold">
                <button
                  type="button"
                  onClick={() => setViewLayout('marquee')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all duration-200 font-semibold flex items-center gap-1 ${
                    viewLayout === 'marquee' 
                      ? 'bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/15' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Slides
                </button>
                <button
                  type="button"
                  id="view-all-links-btn"
                  onClick={() => setViewLayout('grid')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all duration-200 font-semibold flex items-center gap-1 ${
                    viewLayout === 'grid' 
                      ? 'bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/15'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  View All ({filteredLinks.length})
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-[9px] text-gray-500 uppercase tracking-wider">
              <span>Automatic Pace: 135s</span>
            </div>
          </div>

          {/* Infinite Marquee Outer Track vs Static Grid View */}
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
          ) : viewLayout === 'marquee' ? (
            <div className="relative w-full overflow-hidden py-4 bg-gradient-to-b from-brand-surface/10 to-brand-dark/20 rounded-2xl border border-white/5 pause-hover">
              {/* Visual fade edges overlays */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0f1a] to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0f1a] to-transparent z-10" />

              <div 
                className="animate-marquee-ltr"
                style={{
                  animationDuration: `${speed}s`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              >
                {duplicatedLinks.map((link, index) => {
                  const isFav = favorites.includes(link.id);
                  return (
                    <div
                      key={`${link.id}-marquee-${index}`}
                      className="w-[280px] sm:w-[320px] shrink-0 mx-2 glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden select-none text-left inline-flex"
                    >
                      {/* Glowing highlight indicator */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300" />

                      <div>
                        {/* Top Bar inside card Pin/Icon */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/10 text-brand-primary group-hover:gold-glow transition-all duration-300">
                            <DynamicIcon name={link.icon} className="h-5 w-5" />
                          </div>

                          <div className="flex gap-1.5">
                            {/* Favorite button */}
                            <button
                              onClick={() => onToggleFavorite(link.id)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isFav 
                                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                              }`}
                              title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-brand-primary' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Category Label */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="font-mono text-[8px] uppercase font-semibold text-brand-accent tracking-widest bg-brand-primary/5 px-2 py-0.5 rounded-full border border-brand-primary/10">
                            {link.category}
                          </span>
                          {link.postedBy && (
                            <span className="font-mono text-[8px] uppercase font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5" title={`Authorized by ${link.postedBy}`}>
                              By: {link.postedByRole === 'Super Admin' ? 'Admin' : link.postedBy}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-display font-bold text-sm text-white mt-2 group-hover:text-brand-primary transition-colors flex items-center gap-1.5 truncate">
                          {link.title}
                          {link.isPopular && (
                            <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono font-medium tracking-tight">POPULAR</span>
                          )}
                        </h3>
                        
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 min-h-[32px] whitespace-normal">
                          {link.description}
                        </p>
                      </div>

                      {/* Bottom stats & Launch Trigger */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                          <Activity className="h-3 w-3 text-brand-primary" />
                          <span>{link.clickCount.toLocaleString()} launches</span>
                        </div>

                        <button
                          onClick={() => handleLaunch(link)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-brand-dark border border-white/10 hover:border-brand-primary transition-all duration-300 text-[10px] font-semibold text-brand-primary font-mono cursor-pointer"
                        >
                          Quick Launch <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 py-2">
              <AnimatePresence>
                {filteredLinks.map((link) => {
                  const isFav = favorites.includes(link.id);
                  return (
                    <motion.div
                      layout
                      key={link.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden text-left"
                    >
                      {/* Glowing highlight indicator */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300" />

                      <div>
                        {/* Top Bar inside card Pin/Icon */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/10 text-brand-primary group-hover:gold-glow transition-all duration-300">
                            <DynamicIcon name={link.icon} className="h-5 w-5" />
                          </div>

                          <div className="flex gap-1.5">
                            {/* Favorite button */}
                            <button
                              onClick={() => onToggleFavorite(link.id)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isFav 
                                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                              }`}
                              title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-brand-primary' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Category Label */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="font-mono text-[8px] uppercase font-semibold text-brand-accent tracking-widest bg-brand-primary/5 px-2 py-0.5 rounded-full border border-brand-primary/10">
                            {link.category}
                          </span>
                          {link.postedBy && (
                            <span className="font-mono text-[8px] uppercase font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5" title={`Authorized by ${link.postedBy}`}>
                              By: {link.postedByRole === 'Super Admin' ? 'Admin' : link.postedBy}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-display font-bold text-sm text-white mt-2 group-hover:text-brand-primary transition-colors flex items-center gap-1.5 truncate">
                          {link.title}
                          {link.isPopular && (
                            <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono font-medium tracking-tight">POPULAR</span>
                          )}
                        </h3>
                        
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 min-h-[32px] whitespace-normal">
                          {link.description}
                        </p>
                      </div>

                      {/* Bottom stats & Launch Trigger */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                          <Activity className="h-3 w-3 text-brand-primary" />
                          <span>{link.clickCount.toLocaleString()} launches</span>
                        </div>

                        <button
                          onClick={() => handleLaunch(link)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-brand-dark border border-white/10 hover:border-brand-primary transition-all duration-300 text-[10px] font-semibold text-brand-primary font-mono cursor-pointer"
                        >
                          Quick Launch <ArrowRight className="h-3 w-3" />
                        </button>
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
            <span>Hover slide track to pause, drag/swipe or use <strong className="text-brand-primary">Quick Launch</strong> parameters.</span>
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
              <ul className="space-y-2.5">
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
              <div className="space-y-2">
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
    </div>
  );
}

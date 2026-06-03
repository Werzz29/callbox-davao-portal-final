/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pin, Calendar, User, Newspaper, Plus, Search, Archive, ChevronRight, X, Clock,
  Flame, Megaphone, Bell, ShieldPlus, Trash2, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { Announcement, UserRole } from '../types';

interface AnnouncementsProps {
  announcements: Announcement[];
  onAddAnnouncement: (item: Omit<Announcement, 'id' | 'publishedDate'>) => void;
  onRemoveAnnouncement: (id: string) => void;
  userRole: UserRole;
  employeeName: string;
}

export default function Announcements({ 
  announcements, 
  onAddAnnouncement, 
  onRemoveAnnouncement,
  userRole,
  employeeName 
}: AnnouncementsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsDrawerItem, setNewsDrawerItem] = useState<Announcement | null>(null);
  const [isPublishingModalOpen, setIsPublishingModalOpen] = useState(false);

  // Form states for creating announcement
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Company Wide' | 'HR Notice' | 'Operations' | 'Training' | 'Upcoming Event' | 'IT Support'>('Company Wide');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsCritical, setFormIsCritical] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const categories = ['All', 'Company Wide', 'HR Notice', 'Operations', 'Training', 'Upcoming Event', 'IT Support'];

  // Filter announcements
  const filteredGrid = announcements.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedItems = announcements.filter(item => item.isPinned);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary || !formContent) return;

    onAddAnnouncement({
      title: formTitle,
      category: formCategory,
      summary: formSummary,
      content: formContent,
      publishedBy: employeeName,
      isPinned: formIsPinned,
      isCritical: formIsCritical
    });

    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setIsPublishingModalOpen(false);
      // Reset form
      setFormTitle('');
      setFormSummary('');
      setFormContent('');
      setFormIsPinned(false);
      setFormIsCritical(false);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="announcements-center-module">
      {/* Upper header action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Megaphone className="h-4 w-4" /> Operational News Feed
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Bulletin Board & Broadcasts</h2>
          <p className="text-sm text-gray-400">Essential regulatory notices, upcoming calibrations, and Davao branch highlights.</p>
        </div>

        {/* Create post button - Visible only for HR and Admin roles */}
        {(userRole === 'Super Admin' || userRole === 'HR') && (
          <button
            onClick={() => setIsPublishingModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            id="draft-announcement-button"
          >
            <ShieldPlus className="h-4 w-4" /> Publish Broadcast
          </button>
        )}
      </div>

      {/* Featured / Pinned Carousel */}
      {pinnedItems.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-brand-primary/25 bg-gradient-to-r from-brand-surface via-brand-surface to-brand-primary/5 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-1.5 text-brand-primary font-mono text-[10px] uppercase font-semibold tracking-widest bg-brand-primary/10 w-fit px-2.5 py-0.5 rounded-full border border-brand-primary/20 mb-4 animate-pulse">
            <Pin className="h-3 w-3 fill-brand-primary" /> Bullet Priority Alert
          </div>

          <div className="max-w-2xl">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-snug hover:text-brand-secondary transition-colors cursor-pointer" onClick={() => setNewsDrawerItem(pinnedItems[0])}>
              {pinnedItems[0].title}
            </h3>
            <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
              {pinnedItems[0].summary}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-5 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-brand-primary" />
              <span>{pinnedItems[0].publishedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{pinnedItems[0].publishedDate}</span>
            </div>

            <button
              onClick={() => setNewsDrawerItem(pinnedItems[0])}
              className="ml-auto flex items-center gap-1 text-xs text-brand-primary hover:underline group cursor-pointer"
            >
              Read full release <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Toolbar (Search & Category tags) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-surface/40 p-4 rounded-xl border border-white/5">
        
        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1.5 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-brand-primary text-brand-dark' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inline Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search bulletins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
            title="Search news bulletins"
          />
        </div>
      </div>

      {/* Announcements Stream List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredGrid.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl border p-5 flex flex-col justify-between hover:bg-brand-surface/50 transition-colors focus-within:ring-1 focus-within:ring-brand-primary ${
                item.isPinned ? 'border-brand-primary/20 bg-brand-surface/30' : 'border-white/5 bg-brand-surface/20'
              }`}
            >
              <div>
                {/* Meta Header */}
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-brand-accent bg-brand-primary/10 border border-brand-primary/15 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.isPinned && <Pin className="h-3 w-3 text-brand-primary fill-brand-primary" />}
                    
                    {/* Authorized delete item button */}
                    {(userRole === 'Super Admin' || userRole === 'HR') && (
                      <button
                        onClick={() => onRemoveAnnouncement(item.id)}
                        className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Archive post"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-display font-semibold text-white group-hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1" onClick={() => setNewsDrawerItem(item)}>
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-sans">{item.summary}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 mt-4 border-t border-white/5 pt-3">
                <span className="truncate max-w-[120px]">{item.publishedBy}</span>
                <span>{item.publishedDate}</span>
                <button
                  onClick={() => setNewsDrawerItem(item)}
                  className="text-xs text-brand-primary hover:underline hover:text-brand-secondary inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Retrieve <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredGrid.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border border-white/5 rounded-xl bg-brand-surface/10">
            <Newspaper className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm">No board messages matching criteria</p>
          </div>
        )}
      </div>

      {/* Slide-over Reader Modal Panel */}
      <AnimatePresence>
        {newsDrawerItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-xl w-full mx-4 rounded-2xl border border-white/15 bg-brand-surface p-6 sm:p-8 text-left shadow-2xl relative max-h-[85vh] overflow-y-auto"
              id="broadcast-reader-dialog"
            >
              <button
                onClick={() => setNewsDrawerItem(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                title="Close Broadcast"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-brand-primary bg-brand-primary/10 border border-brand-primary/15 px-2.5 py-0.5 rounded-full">
                  {newsDrawerItem.category}
                </span>
                
                <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-2 leading-snug">
                  {newsDrawerItem.title}
                </h3>
              </div>

              <div className="border-t border-b border-white/10 py-3 mb-6 flex gap-4 text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Posted by: <strong className="text-gray-300">{newsDrawerItem.publishedBy}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Date: <strong className="text-gray-300">{newsDrawerItem.publishedDate}</strong></span>
                </div>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
                {newsDrawerItem.content}
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setNewsDrawerItem(null)}
                  className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary transition-all text-xs font-semibold font-mono cursor-pointer"
                >
                  Dismiss Broadcast
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Bulletin Modal - Admin/HR Draw-down */}
      <AnimatePresence>
        {isPublishingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-lg w-full mx-4 rounded-3xl border border-brand-primary/20 bg-brand-surface p-6 sm:p-8 shadow-2xl relative"
              id="publish-broadcast-form-container"
            >
              <button
                onClick={() => setIsPublishingModalOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                title="Cancel Publish"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-brand-primary font-bold">
                  <ShieldPlus className="h-3.5 w-3.5" /> HR Policy Dispatcher
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">Compose System Broadcast</h3>
                <p className="text-xs text-gray-400 mt-1">Immediately post a persistent operational bulletin to employee dashboards.</p>
              </div>

              {publishedSuccess ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                  <p className="text-sm font-semibold text-white uppercase font-mono tracking-wider">Broadcast Dispatched!</p>
                  <p className="text-xs text-gray-400">Appending bulletin log index immediately...</p>
                </div>
              ) : (
                <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-sans">
                  {/* Title & Category row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Title Headline *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Mandatory Calibration Q3"
                        className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                        title="Form title"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Bullet Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                        title="Form category"
                      >
                        <option value="Company Wide">Company Wide Notice</option>
                        <option value="HR Notice">HR & Legal Notice</option>
                        <option value="Operations">Operations Update</option>
                        <option value="Training">Training SOP Refresh</option>
                        <option value="Upcoming Event">Upcoming Event</option>
                        <option value="IT Support">IT Support Notice</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div>
                    <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Brief Summary * (shown in card)</label>
                    <input
                      type="text"
                      required
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="e.g. Schedule and access details relative to newly updated Maxicare HMO card limits."
                      className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      title="Form summary"
                    />
                  </div>

                  {/* Full Markdown/Text content info */}
                  <div>
                    <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Complete Notice content *</label>
                    <textarea
                      required
                      rows={4}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="e.g. Enter comprehensive instructions, links and contacts regarding HMO coverage..."
                      className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary font-mono text-[11px] leading-relaxed"
                      title="Form content"
                    />
                  </div>

                  {/* Pin to top toggle */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="formIsPinned"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="accent-brand-primary h-4.5 w-4.5 cursor-pointer rounded"
                      title="Pin to top toggle"
                    />
                    <label htmlFor="formIsPinned" className="text-gray-300 font-medium font-mono text-[11px] cursor-pointer selection:bg-brand-primary/20">
                      Pin to Top (Priority alert header)
                    </label>
                  </div>

                  {/* Critical Urgent overlay toggle */}
                  <div className="flex items-center gap-2 py-1 border-t border-white/5 pt-3 mt-1">
                    <input
                      type="checkbox"
                      id="formIsCritical"
                      checked={formIsCritical}
                      onChange={(e) => setFormIsCritical(e.target.checked)}
                      className="accent-rose-500 h-4.5 w-4.5 cursor-pointer rounded"
                      title="Is critical flag"
                    />
                    <label htmlFor="formIsCritical" className="text-gray-300 font-medium font-mono text-[11px] cursor-pointer selection:bg-brand-primary/20 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <span className="text-rose-400 font-bold">Mark as Critical Update</span> 
                      <span className="text-gray-500">(Forces user confirmation overlay)</span>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsPublishingModalOpen(false)}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 rounded-lg font-mono"
                    >
                      Cancel Draft
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold rounded-lg font-mono"
                    >
                      Authenticate & Dispatch
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

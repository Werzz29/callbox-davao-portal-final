/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Download, HelpCircle, ArrowUpRight, Upload, X, ShieldAlert,
  ArrowRight, Check, HardDrive, Filter, BookOpen, FileSpreadsheet, Eye, Plus, CheckCircle2, Trash2 
} from 'lucide-react';
import { ResourceDocument, UserRole } from '../types';

interface ResourceLibraryProps {
  documents: ResourceDocument[];
  onDownloadDoc: (docId: string) => void;
  onAddDocument: (doc: Omit<ResourceDocument, 'id' | 'downloadCount' | 'uploadedDate'>) => void;
  onDeleteDocument?: (docId: string) => void;
  userRole: UserRole;
  employeeName: string;
}

export default function ResourceLibrary({
  documents,
  onDownloadDoc,
  onAddDocument,
  onDeleteDocument,
  userRole,
  employeeName
}: ResourceLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [downloadingDoc, setDownloadingDoc] = useState<ResourceDocument | null>(null);
  
  // Custom upload drawer states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ResourceDocument['category']>('SOPs');
  const [formFileType, setFormFileType] = useState<'pdf' | 'docx' | 'xlsx' | 'pptx'>('pdf');
  const [formFileSize, setFormFileSize] = useState('1.5 MB');
  const [uploadedSuccess, setUploadedSuccess] = useState(false);

  const categories: Array<ResourceDocument['category'] | 'All'> = [
    'All', 'Company Policies', 'SOPs', 'Employee Handbook', 'Forms', 'Templates', 'Training Guides'
  ];

  // Helper for mock downloading
  const handleDownload = (doc: ResourceDocument) => {
    setDownloadingDoc(doc);
    onDownloadDoc(doc.id);
    setTimeout(() => {
      setDownloadingDoc(null);
      // Simulate real download by opening a blank page or alert
      const fileUrl = "data:text/plain;charset=utf-8," + encodeURIComponent("Callbox Document Content for " + doc.title);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${doc.title.replace(/\s+/g, "_")}.${doc.fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription) return;

    onAddDocument({
      title: formTitle,
      description: formDescription,
      category: formCategory,
      fileType: formFileType,
      fileSize: formFileSize,
      uploadedBy: employeeName
    });

    setUploadedSuccess(true);
    setTimeout(() => {
      setUploadedSuccess(false);
      setIsUploadOpen(false);
      // Reset form fields
      setFormTitle('');
      setFormDescription('');
      setFormCategory('SOPs');
      setFormFileType('pdf');
      setFormFileSize('1.5 MB');
    }, 1500);
  };

  // Filter lists
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="resource-library-module">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
            <HardDrive className="h-4 w-4" /> Operations Document Vault
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Resource Library & SOPs</h2>
          <p className="text-sm text-gray-400">Secure directory hosting global employee compliance handbook, dialing briefs, and legal assets.</p>
        </div>

        {/* Upload Action Button for Admin & HR */}
        {(userRole === 'Super Admin' || userRole === 'HR') && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:gold-glow"
            id="open-upload-resources-button"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Grid Filter Bar */}
      <div className="p-4 rounded-xl border border-white/5 bg-brand-surface/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category List */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none max-w-full">
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

        {/* Search Input inline */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search filenames, SOP codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
            title="Search documents"
          />
        </div>
      </div>

      {/* Document Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredDocs.map((doc) => {
            // Assign color badge relative to filetype
            let fileTypeBadge = 'bg-red-500/10 text-red-400 border-red-500/20';
            if (doc.fileType === 'xlsx') fileTypeBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (doc.fileType === 'docx') fileTypeBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (doc.fileType === 'pptx') fileTypeBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            return (
              <motion.div
                layout
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-brand-primary">
                      {doc.category}
                    </span>
                    <span className={`font-mono text-[9px] uppercase font-bold tracking-tight px-1.5 py-0.2 rounded border ${fileTypeBadge}`}>
                      {doc.fileType}
                    </span>
                  </div>

                  <h3 className="font-display font-medium text-white group-hover:text-brand-primary transition-colors text-sm line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 min-h-8">
                    {doc.description}
                  </p>
                </div>

                {/* Meta bottom stats */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <div className="space-y-0.5">
                    <div>Size: <span className="text-gray-300">{doc.fileSize}</span></div>
                    <div>Downloads: <span className="text-gray-300">{doc.downloadCount}</span></div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Authorized delete item button */}
                    {(userRole === 'Super Admin' || userRole === 'HR') && onDeleteDocument && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 text-red-400 group cursor-pointer"
                        title={`Delete ${doc.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-dark hover:border-brand-primary hover:gold-glow transition-all duration-300 group cursor-pointer"
                      title={`Retrieve ${doc.title}`}
                    >
                      <Download className="h-4.5 w-4.5 transition-transform group-hover:translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-brand-surface/20">
            <FileText className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No resource documents found</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-3 text-xs text-brand-primary hover:underline font-mono"
            >
              Reset view categories
            </button>
          </div>
        )}
      </div>

      {/* Simulated downloader animation drawer */}
      <AnimatePresence>
        {downloadingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-xs w-full mx-4 rounded-2xl border border-white/15 bg-brand-surface p-6 text-center shadow-2xl"
              id="download-dialog"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Download className="h-6 w-6" />
              </div>
              <p className="font-display font-medium text-white text-sm">Streaming Resource Document</p>
              <p className="text-xs text-gray-400 mt-1 font-mono truncate">{downloadingDoc.title}</p>
              
              <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden mx-auto mt-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-brand-primary"
                  transition={{ duration: 1.1 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Document Drawer Form Overlay */}
      <AnimatePresence>
        {isUploadOpen && (
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
              className="max-w-md w-full mx-4 bg-brand-surface border border-brand-primary/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
              id="upload-resource-form"
            >
              <button
                onClick={() => setIsUploadOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                title="Cancel upload"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-brand-primary font-bold">
                  <Upload className="h-3.5 w-3.5" /> Repository Dispatch
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">Upload Compliance Document</h3>
                <p className="text-xs text-gray-400 mt-1">Register new templates, legal charts or compliance SOPs onto employee list views.</p>
              </div>

              {uploadedSuccess ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                  <p className="text-sm font-semibold text-white uppercase font-mono tracking-wider">Document Registered!</p>
                  <p className="text-xs text-gray-300">Adding metadata to Callbox database index...</p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
                  {/* Title */}
                  <div>
                    <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Document Title *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Davao Dialer Proxy Standard SOP"
                      className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      title="Form title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Vault Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Detailed explanation of the resource containing context, compliance constraints, and targeted departments."
                      className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary font-medium leading-relaxed"
                      title="Form description"
                    />
                  </div>

                  {/* Category and Type Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                        title="Form category"
                      >
                        <option value="Company Policies">Company Policies</option>
                        <option value="SOPs">SOPs Catalog</option>
                        <option value="Employee Handbook">Employee Handbook</option>
                        <option value="Forms">Forms Drawer</option>
                        <option value="Templates">Templates Drawer</option>
                        <option value="Training Guides">Training Guides</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">File format *</label>
                      <select
                        value={formFileType}
                        onChange={(e) => setFormFileType(e.target.value as any)}
                        className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary"
                        title="Form file type"
                      >
                        <option value="pdf">Acrobat PDF (.pdf)</option>
                        <option value="docx">Word Document (.docx)</option>
                        <option value="xlsx">Excel Sheet (.xlsx)</option>
                        <option value="pptx">PowerPoint (.pptx)</option>
                      </select>
                    </div>
                  </div>

                  {/* Simulated File upload area */}
                  <div className="border border-dashed border-white/15 bg-brand-dark/50 rounded-xl p-5 text-center flex flex-col justify-center items-center">
                    <FileText className="h-8 w-8 text-brand-primary opacity-60 mb-2" />
                    <span className="text-gray-300 font-medium font-mono text-[10px] uppercase">Simulated Attachment Attached</span>
                    <span className="text-gray-500 font-mono text-[9px] mt-1">DVO_DIALER_UPDATE.pdf (1.43 MB)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-400 rounded-lg font-mono"
                    >
                      Dismiss Draft
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold rounded-lg font-mono"
                    >
                      Authenticate & Commit
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

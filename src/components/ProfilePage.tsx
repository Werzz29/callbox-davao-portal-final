/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, CheckCircle, Clock, Users, Camera, Trash2, AlertCircle, Link
} from 'lucide-react';
import { Employee, PortalActivity } from '../types';
import DefaultAvatar from './DefaultAvatar';

interface ProfilePageProps {
  currentUser: Employee;
  onUpdateContactInfo: (
    phone: string,
    email: string,
    avatarUrl: string,
    name: string,
    position: string,
    department: string,
    gender?: 'Male' | 'Female'
  ) => void;
  favoritesCount: number;
  employees?: Employee[];
}

const getInitials = (fullName: string) => {
  const parts = fullName.trim().replaceAll(/[^a-zA-Z\s]/g, '').split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'CB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

export default function ProfilePage({ 
  currentUser, 
  onUpdateContactInfo,
  favoritesCount,
  employees = []
}: ProfilePageProps) {
  // Input fields state
  const [name, setName] = useState(currentUser.name);
  const [position, setPosition] = useState(currentUser.position);
  const [department, setDepartment] = useState(currentUser.department);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [gender, setGender] = useState<'Male' | 'Female'>(() => {
    if (currentUser.gender) return currentUser.gender;
    const lowercaseName = currentUser.name.toLowerCase();
    if (
      lowercaseName.includes('mae') || 
      lowercaseName.includes('jane') || 
      lowercaseName.includes('santos') || 
      lowercaseName.includes('delacruz') || 
      lowercaseName.includes('tim')
    ) {
      return 'Female';
    }
    return 'Male';
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // File loading capabilities
  const handleFileChange = (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError('Unsupported file format. Please upload an image format (JPEG, PNG, WEBP).');
      return;
    }
    
    if (file.size > 1.5 * 1024 * 1024) {
      setUploadError('File size exceeds limits. Max image capacity is 1.5MB for optimized portal sync.');
      return;
    }
    
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read visual data stream. Try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Initial dummy logs representing actual browser events
  const activityLogs: PortalActivity[] = [
    { id: 'act-1', timestamp: 'Joined at 15:02 UTC', activity: 'Logged in successfully from Davao Office 10', icon: 'Fingerprint' },
    { id: 'act-2', timestamp: 'Today at 11:24 UTC', activity: 'Launched Callbox CRM Portal link from Smart Hub', icon: 'Award' },
    { id: 'act-3', timestamp: 'Yesterday at 09:12 UTC', activity: 'Pulled PDF: "Callbox Davao Employee Handbook 2026"', icon: 'Clock' },
    { id: 'act-4', timestamp: 'May 24, 08:00 UTC', activity: 'Updated medical coverage parameters in HMO Registration form', icon: 'User' },
  ];

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContactInfo(phone, email, avatarUrl, name, position, department, gender);
    setContactSuccess(true);
    setTimeout(() => setContactSuccess(false), 2000);
  };

  return (
    <div className="space-y-6" id="profile-management-module">
      {/* Overview header */}
      <div>
        <div className="flex items-center gap-1.5 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
          <User className="h-4 w-4" /> Personal Operations Badge
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Employee Profile Center</h2>
        <p className="text-sm text-gray-400">Configure personal alerts, coordinate profile changes, and review secure session activity telemetry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Left */}
        <div className="glass-panel rounded-3xl p-6 border-t-4 border-brand-primary h-fit">
          <div className="text-center relative">
            <div className="relative inline-block">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="h-24 w-24 rounded-3xl object-cover border-2 border-brand-primary gold-glow shadow-md mx-auto bg-[#111827]"
                  referrerPolicy="no-referrer"
                  id="profile-avatar-image"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="h-24 w-24 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/30 flex items-center justify-center text-brand-primary gold-glow shadow-md mx-auto overflow-hidden p-1.5"
                  id="profile-avatar-badge"
                >
                  <DefaultAvatar gender={gender} name={currentUser.name} className="h-full w-full object-contain" />
                </div>
              )}
              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-brand-dark animate-pulse" title="Active on shift" />
            </div>

            <h3 className="font-display font-bold text-lg text-white mt-3.5 tracking-snug">{currentUser.name}</h3>
            <p className="text-xs font-mono text-brand-primary font-medium">{currentUser.position}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mt-1">{currentUser.department} Section</p>
          </div>

          {/* Quick specs lists */}
          <div className="border-t border-b border-white/5 py-4 my-6 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Security Clearance:</span>
              <span className="inline-flex px-1.5 py-0.2 rounded bg-yellow-500/10 text-brand-primary border border-brand-primary/10 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Committed Shift:</span>
              <span className="text-gray-300 font-semibold">APAC Evening</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Joined Date:</span>
              <span className="text-gray-300">
                {currentUser.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Configurations middle column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Form details updates */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-brand-primary/20 transition-all duration-300 shadow-xl shadow-black/40 relative overflow-hidden" id="profile-edit-form-panel">
            {/* Premium background decorative ambient pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
              <Users className="h-5 w-5 text-brand-primary" />
              <div>
                <h3 className="font-display font-semibold text-sm text-white">Employee Workspace Hub</h3>
                <p className="text-[10px] text-gray-500 font-mono">Davao Node Operations Index</p>
              </div>
            </div>

            {contactSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-lg flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Professional profile settings and portrait updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleUpdateContact} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              
              {/* Profile image picker sub-panel */}
              <div className="col-span-1 md:col-span-2 bg-brand-dark/40 rounded-2xl p-4 border border-white/5">
                <span className="block text-gray-400 font-semibold mb-2.5 font-mono uppercase tracking-wider text-[10px]">Profile Portrait Configuration</span>
                <div className="flex flex-col md:flex-row items-center gap-5">
                  {/* Active preview sphere */}
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 rounded-3xl overflow-hidden bg-brand-dark border-2 border-brand-primary flex items-center justify-center p-1 font-sans shadow-lg select-none">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Preview" 
                          className="h-full w-full object-cover rounded-2xl" 
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setUploadError('Failed to render the provided preview URL structure.');
                          }}
                        />
                      ) : (
                        <div className="h-full w-full object-contain p-1">
                          <DefaultAvatar gender={gender} name={name || currentUser.name} className="h-full w-full object-contain" />
                        </div>
                      )}
                    </div>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow cursor-pointer transition-colors z-20"
                        title="Remove custom profile photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Interactive Drag Zone */}
                  <div className="flex-1 w-full">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                        isDragging 
                          ? 'border-brand-primary bg-brand-primary/5' 
                          : 'border-white/10 hover:border-brand-primary/40 bg-brand-dark/20'
                      }`}
                    >
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Drag or click here to upload photo"
                      />
                      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                        <div className="h-8 w-8 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                          <Camera className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">Drag & drop profile snapshot here</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">Or click to select a local file (JPG, PNG or WEBP up to 1.5MB)</p>
                        </div>
                      </div>
                    </div>

                    {/* Fallback Direct URL paste integration */}
                    <div className="mt-3">
                      <div className="relative">
                        <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => {
                            setUploadError('');
                            setAvatarUrl(e.target.value);
                          }}
                          placeholder="Alternatively, paste direct web URL to profile photo..."
                          className="w-full bg-brand-dark border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-white focus:outline-none focus:border-brand-primary font-mono text-[10px]"
                          title="Direct image url input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/15 text-red-400 text-[10px] font-mono rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Full Professional Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-xs"
                    placeholder="Enter full name"
                    title="Employee name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Corporate Mail Endpoint</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-xs"
                    title="Email input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Team Designation</label>
                <div className="relative">
                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                    title="Team selection"
                  >
                    {[
                      'Dvo CS APAC _DB Support',
                      'Team Targaryen',
                      'House Arryn',
                      'IT',
                      'Admin GS',
                      'Admin Finance',
                      'Dvo CS APAC ETC',
                      'Dracarys',
                      'Gnarly',
                      'Sparta/Gnarly',
                      'PM',
                      'Demigods',
                      'Demigods/Artemis',
                      'CSM',
                      'CSM/OM',
                      'QA',
                      '(Paradigm)',
                      'Dvo CS-NorthAM Support',
                      'OJT'
                    ].map(teamOpt => (
                      <option key={teamOpt} value={teamOpt}>{teamOpt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Shift Schedule</label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                    title="Shift schedule selection"
                  >
                    {['APAC', 'NAM', 'HR'].map(shiftOpt => (
                      <option key={shiftOpt} value={shiftOpt}>{shiftOpt} Schedule</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold font-mono text-xs uppercase tracking-wide rounded-xl hover:gold-glow transition-all cursor-pointer shadow-md"
                >
                  Save profile settings
                </button>
              </div>
            </form>
          </div>



          {/* Activity Logs stream */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-display font-semibold text-xs tracking-wider uppercase text-gray-400 mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-primary" /> Portal Session Activity History
            </h3>

            <div className="space-y-4">
              {activityLogs.map((act) => (
                <div key={act.id} className="flex justify-between items-start text-xs border-b border-white/2 pb-3 mb-3 last:border-0 last:pb-0">
                  <div className="flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 animate-pulse shrink-0" />
                    <div>
                      <p className="text-gray-300 font-medium">{act.activity}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{act.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Colleague Digital Badge Overlay modal removed */}

    </div>
  );
}

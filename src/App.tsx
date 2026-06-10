/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, LogOut, Bell, User, Clock, ShieldAlert, Sparkles, Cpu, 
  Mail, MessageSquare, Video, Database, PhoneCall, Users, Wrench, 
  DollarSign, GraduationCap, BookOpen, BarChart3, AlertCircle, Bookmark, CheckCircle, Flame, X
} from 'lucide-react';

// Types and Seed Data
import { Employee, ResourceLink, Announcement, ResourceDocument, AuditLog, SystemNotification, UserRole, ApprovalRequest } from './types';
import { mockAnnouncements, mockDocuments, mockAuditLogs, mockNotifications } from './mockData';

const defaultAdmin: Employee = {
  id: 'emp-01',
  name: 'Werzkie Tim',
  email: 'werzkie.tim@callboxinc.com',
  position: 'Chief Operations Officer',
  department: 'Executive',
  role: 'Super Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  phone: '+63 917 123 4567',
  empId: 'CB-2021-001F',
  joinedDate: '2021-04-12',
  gender: 'Female',
  password: 'callbox2026'
};

const restrictedAdmin: Employee = {
  id: 'emp-superadmin-restricted',
  name: 'admin',
  email: 'admin@callboxinc.com',
  position: 'Systems Super Admin',
  department: 'Executive',
  role: 'Super Admin',
  avatarUrl: '',
  phone: '+63 920 000 0000',
  empId: 'admin',
  joinedDate: '2026-06-01',
  gender: 'Male',
  password: 'callboxdavaoadmin'
};

const defaultEmployee1: Employee = {
  id: 'emp-02',
  name: 'Jane Doe',
  email: 'jane.doe@callboxinc.com',
  position: 'Operations Specialist',
  department: 'APAC',
  role: 'Employee',
  avatarUrl: '',
  phone: '+63 920 111 2222',
  empId: 'CB-2023-014F',
  joinedDate: '2023-11-04',
  gender: 'Female',
  password: 'callbox2026'
};

const defaultEmployee2: Employee = {
  id: 'emp-03',
  name: 'John Smith',
  email: 'john.smith@callboxinc.com',
  position: 'Lead Campaign Executive',
  department: 'Operations',
  role: 'Employee',
  avatarUrl: '',
  phone: '+63 918 333 4444',
  empId: 'CB-2024-023M',
  joinedDate: '2024-02-18',
  gender: 'Male',
  password: 'callbox2026'
};

// Supabase Integration Services
import { 
  isSupabaseConfigured, 
  fetchRemoteLinks, 
  upsertRemoteLink, 
  deleteRemoteLink, 
  logRemoteAudit, 
  fetchRemoteAuditLogs,
  fetchRemoteEmployees,
  upsertRemoteEmployee,
  deleteRemoteEmployee,
  supabase
} from './lib/supabase';

// Modular Workspace Components
import SitemapOverlay from './components/SitemapOverlay';
import LandingHero from './components/LandingHero';
import LoginScreen from './components/LoginScreen';
import LinkHub from './components/LinkHub';
import AdminPanel from './components/AdminPanel';
import ProfilePage from './components/ProfilePage';
import DefaultAvatar from './components/DefaultAvatar';
import Announcements from './components/Announcements';
import ResourceLibrary from './components/ResourceLibrary';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NetworkBackground from './components/NetworkBackground';

const getInitials = (fullName: string) => {
  const parts = fullName.trim().replaceAll(/[^a-zA-Z\s]/g, '').split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'CB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

export default function App() {
  // Supabase Database States for cloud connectivity sync checks
  const [supabaseMode, setSupabaseMode] = useState<'connected' | 'not_configured' | 'error'>(
    isSupabaseConfigured ? 'connected' : 'not_configured'
  );
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [dbDiagnosticMsg, setDbDiagnosticMsg] = useState(
    isSupabaseConfigured ? 'Integrating remote records...' : 'Supabase is not configured yet. Fallback mode is active.'
  );

  // Navigation Flow State
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'workspace'>(() => {
    try {
      const savedUser = localStorage.getItem('cb_currentUser_v2');
      const hasUser = savedUser ? JSON.parse(savedUser) : null;
      if (!hasUser) {
        const savedView = localStorage.getItem('cb_viewMode_v2');
        if (savedView === 'login') return 'login';
        return 'landing';
      }
      const savedView = localStorage.getItem('cb_viewMode_v2');
      return (savedView as 'landing' | 'login' | 'workspace') || 'workspace';
    } catch {
      return 'landing';
    }
  });
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'bulletins' | 'resources' | 'profile' | 'analytics' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('cb_activeTab_v2');
      return (saved as 'links' | 'bulletins' | 'resources' | 'profile' | 'analytics' | 'admin') || 'links';
    } catch {
      return 'links';
    }
  });
  
  // Authenticated Profile State
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem('cb_currentUser_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Core Data Lists with State Management to support interactive creates/deletes
  const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('cb_allEmployees_v2');
      const emps: Employee[] = saved ? JSON.parse(saved) : [defaultAdmin, restrictedAdmin, defaultEmployee1, defaultEmployee2];
      
      const seenIds = new Set<string>();
      let changed = false;
      const cleanEmps = emps.map((emp, index) => {
        const password = emp.password || 'callbox2026';
        if (!emp.id || seenIds.has(emp.id)) {
          const uniqueId = `emp-${Date.now()}-${index}-${Math.floor(100000 + Math.random() * 900000)}`;
          seenIds.add(uniqueId);
          changed = true;
          return { ...emp, id: uniqueId, password };
        }
        seenIds.add(emp.id);
        if (emp.password !== password) {
          changed = true;
          return { ...emp, password };
        }
        return emp;
      });
      
      // Ensure the fixed 'admin' account is correctly registered and updated in the system
      const adminIndex = cleanEmps.findIndex(e => e.id === 'emp-superadmin-restricted' || e.empId === 'SuperAdmin' || e.empId === 'admin');
      if (adminIndex === -1) {
        cleanEmps.push(restrictedAdmin);
        changed = true;
      } else {
        const existing = cleanEmps[adminIndex];
        if (existing.empId !== 'admin' || existing.name !== 'admin' || existing.password !== 'callboxdavaoadmin') {
          cleanEmps[adminIndex] = {
            ...existing,
            name: 'admin',
            email: 'admin@callboxinc.com',
            empId: 'admin',
            password: 'callboxdavaoadmin',
            role: 'Super Admin'
          };
          changed = true;
        }
      }
      
      if (changed) {
        localStorage.setItem('cb_allEmployees_v2', JSON.stringify(cleanEmps));
      }
      return cleanEmps;
    } catch {
      return [defaultAdmin, restrictedAdmin];
    }
  });
  const [allLinks, setAllLinks] = useState<ResourceLink[]>(() => {
    try {
      const saved = localStorage.getItem('cb_allLinks_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          localStorage.removeItem('cb_allLinks_v3');
          return [];
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('cb_allAnnouncements_v2');
      return saved ? JSON.parse(saved) : mockAnnouncements;
    } catch {
      return mockAnnouncements;
    }
  });
  const [allDocuments, setAllDocuments] = useState<ResourceDocument[]>(() => {
    try {
      const saved = localStorage.getItem('cb_allDocuments_v2');
      return saved ? JSON.parse(saved) : mockDocuments;
    } catch {
      return mockDocuments;
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('cb_auditLogs_v2');
      return saved ? JSON.parse(saved) : mockAuditLogs;
    } catch {
      return mockAuditLogs;
    }
  });
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Simple Synthesizer audio beep helper for interactive user notifications and security responses
  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context fallbacks
    }
  };

  // State tracker for acknowledged critical announcement identifiers
  const [acknowledgedCriticalIds, setAcknowledgedCriticalIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cb_acknowledged_critical_ids_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cb_acknowledged_critical_ids_v1', JSON.stringify(acknowledgedCriticalIds));
  }, [acknowledgedCriticalIds]);

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => {
    try {
      const saved = localStorage.getItem('cb_approvalRequests_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local Storage Synchronization Effects
  useEffect(() => {
    localStorage.setItem('cb_viewMode_v2', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('cb_activeTab_v2', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('cb_approvalRequests_v2', JSON.stringify(approvalRequests));
  }, [approvalRequests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cb_currentUser_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cb_currentUser_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cb_allEmployees_v2', JSON.stringify(allEmployees));
  }, [allEmployees]);

  useEffect(() => {
    localStorage.setItem('cb_allLinks_v3', JSON.stringify(allLinks));
  }, [allLinks]);

  useEffect(() => {
    localStorage.setItem('cb_allAnnouncements_v2', JSON.stringify(allAnnouncements));
  }, [allAnnouncements]);

  useEffect(() => {
    localStorage.setItem('cb_allDocuments_v2', JSON.stringify(allDocuments));
  }, [allDocuments]);

  useEffect(() => {
    localStorage.setItem('cb_auditLogs_v2', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Synchronize user-scoped notifications
  useEffect(() => {
    if (currentUser) {
      const userKey = `cb_notifications_v2_${currentUser.id}`;
      const saved = localStorage.getItem(userKey);
      try {
        const loaded = saved ? JSON.parse(saved) : mockNotifications;
        const seen = new Set();
        const cleaned = loaded.filter((n: any) => {
          if (!n || !n.id) return false;
          if (seen.has(n.id)) return false;
          seen.add(n.id);
          return true;
        });
        setNotifications(cleaned);
      } catch {
        setNotifications(mockNotifications);
      }
    } else {
      setNotifications([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      const userKey = `cb_notifications_v2_${currentUser.id}`;
      localStorage.setItem(userKey, JSON.stringify(notifications));
    }
  }, [notifications, currentUser?.id]);

  // Personalized Favorite Bookmarks State per User
  const [favorites, setFavorites] = useState<string[]>([]);

  // Synchronize user-scoped favorites (personalized toolbar)
  useEffect(() => {
    if (currentUser) {
      const userKey = `cb_favorites_v2_${currentUser.id}`;
      const saved = localStorage.getItem(userKey);
      setFavorites(saved ? JSON.parse(saved) : []);
    } else {
      setFavorites([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      const userKey = `cb_favorites_v2_${currentUser.id}`;
      localStorage.setItem(userKey, JSON.stringify(favorites));
    }
  }, [favorites, currentUser?.id]);

  // Hook to handle redirecting to the login screen after a page refresh
  useEffect(() => {
    const directToLogin = localStorage.getItem('cb_directToLogin');
    if (directToLogin === 'true') {
      localStorage.removeItem('cb_directToLogin');
      setViewMode('login');
    }
  }, []);

  // Load initial data from Supabase if configured in Vercel or local env
  useEffect(() => {
    async function loadSupabaseData() {
      if (!isSupabaseConfigured) return;
      setSupabaseLoading(true);
      try {
        const remoteLinks = await fetchRemoteLinks();
        if (remoteLinks) {
          setAllLinks(remoteLinks);
          setSupabaseMode('connected');
          setDbDiagnosticMsg('Successfully compiled with your live Supabase database! Syncing CRM logs & links.');
        } else {
          setSupabaseMode('error');
          setDbDiagnosticMsg('Credentials matched, tables missing in your database. Run supabase_schema.sql first.');
        }

        const remoteEmployees = await fetchRemoteEmployees();
        if (remoteEmployees && remoteEmployees.length > 0) {
          let localEmps: Employee[] = [];
          try {
            const saved = localStorage.getItem('cb_allEmployees_v2');
            if (saved) localEmps = JSON.parse(saved);
          } catch (e) {
            console.error('Failed to parse local employees state', e);
          }

          const hasAdmin = remoteEmployees.some(e => e.empId === 'admin' || e.id === 'emp-superadmin-restricted');
          if (!hasAdmin) {
            const oldSuperAdmin = remoteEmployees.find(e => e.empId === 'SuperAdmin');
            if (oldSuperAdmin) {
              await deleteRemoteEmployee(oldSuperAdmin.id);
            }
            if (isSupabaseConfigured) {
              await upsertRemoteEmployee(restrictedAdmin);
            }

            const processedRemote = remoteEmployees
              .filter(e => e.empId !== 'SuperAdmin')
              .map(e => {
                const localMatch = localEmps.find(le => le.id === e.id || (le.empId && le.empId.toLowerCase() === e.empId.toLowerCase()) || (le.email && le.email.toLowerCase() === e.email.toLowerCase()));
                let checkPass = e.password || 'callbox2026';
                const isDefaultOrMasked = /^\*+$/.test(checkPass) || checkPass === 'callbox2026';
                if (isDefaultOrMasked && localMatch && localMatch.password && !/^\*+$/.test(localMatch.password) && localMatch.password !== 'callbox2026') {
                  checkPass = localMatch.password;
                }
                return { ...e, password: checkPass };
              });

            setAllEmployees([...processedRemote, restrictedAdmin]);
          } else {
            const updatedEmployees = remoteEmployees.map(e => {
              if (e.id === 'emp-superadmin-restricted' || e.empId === 'admin') {
                return {
                  ...e,
                  name: 'admin',
                  empId: 'admin',
                  password: 'callboxdavaoadmin',
                  role: 'Super Admin' as UserRole
                };
              }
              const localMatch = localEmps.find(le => le.id === e.id || (le.empId && le.empId.toLowerCase() === e.empId.toLowerCase()) || (le.email && le.email.toLowerCase() === e.email.toLowerCase()));
              let checkPass = e.password || 'callbox2026';
              const isDefaultOrMasked = /^\*+$/.test(checkPass) || checkPass === 'callbox2026';
              if (isDefaultOrMasked && localMatch && localMatch.password && !/^\*+$/.test(localMatch.password) && localMatch.password !== 'callbox2026') {
                checkPass = localMatch.password;
              }
              return { ...e, password: checkPass };
            });
            setAllEmployees(updatedEmployees);
          }
        }

        const remoteAudit = await fetchRemoteAuditLogs();
        if (remoteAudit && remoteAudit.length > 0) {
          setAuditLogs(remoteAudit);
        }
      } catch (err: any) {
        setSupabaseMode('error');
        setDbDiagnosticMsg(`Supabase query rejected: ${err.message || err}`);
      } finally {
        setSupabaseLoading(false);
      }
    }
    loadSupabaseData();
  }, []);
  
  // Real-time UTC timezone digital clock for Davao Branch
  const [davaoTime, setDavaoTime] = useState('');
  const [timeGreeting, setTimeGreeting] = useState('Good Day');

  // Control state for alerts slide-over
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Interactive Employee features state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [callsTarget] = useState(40);
  const [callsDone, setCallsDone] = useState(24);
  const [employeeStatus, setEmployeeStatus] = useState<'Active Dialing' | 'System Break' | 'Campaign Meeting'>('Active Dialing');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Dynamic User Session Visits / Login Loggers
  const [sessionVisits, setSessionVisits] = useState<{
    id: string;
    time: string;
    user: string;
    role: string;
    portalType: string;
    action: string;
  }[]>([]);

  const recordVisitEvent = (actionName: string, targetUser?: Employee | null) => {
    const userObj = targetUser !== undefined ? targetUser : currentUser;
    if (!userObj) return;
    const now = new Date();
    const dvoTimeString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);
    
    const portalType = userObj.role === 'Super Admin' ? 'Governance Panel' 
                     : userObj.role === 'HR' ? 'HR Dashboard' 
                     : userObj.role === 'Inactive' ? 'Restricted Shell' 
                     : 'Agent Dialer Console';

    const newRecord = {
      id: `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: dvoTimeString,
      user: userObj.name,
      role: userObj.role,
      portalType,
      action: actionName
    };

    setSessionVisits(prev => [newRecord, ...prev]);
  };

  // Track login and profile access visits
  useEffect(() => {
    if (currentUser) {
      recordVisitEvent('Established Gateway Session', currentUser);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Real-time clock update hook
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Philippines / Davao Time (PST: UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
      setDavaoTime(timeString);

      const hour = now.getUTCHours() + 8; // Davao offset
      const localHour = hour % 24;

      if (localHour < 12) setTimeGreeting('Good Morning');
      else if (localHour < 17) setTimeGreeting('Good Afternoon');
      else setTimeGreeting('Good Evening');
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-clear feedback toast message
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => {
        setFeedbackToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Update employee stats upon any link launch
  const handleIncrementLinkCount = (linkId: string) => {
    setAllLinks(prev => {
      const updated = prev.map(link => 
        link.id === linkId 
          ? { ...link, clickCount: link.clickCount + 1 }
          : link
      );
      
      // Upsert back to Supabase if configured (background fire-and-forget sync)
      const clickedLink = updated.find(l => l.id === linkId);
      if (clickedLink && isSupabaseConfigured) {
        upsertRemoteLink(clickedLink).catch(err => {
          console.warn('Silent Supabase sync failure on click count increment:', err);
        });
      }
      return updated;
    });
  };

  // Toggle customized favorites dock
  const handleToggleFavorite = (linkId: string) => {
    setFavorites(prev => {
      if (prev.includes(linkId)) {
        return prev.filter(id => id !== linkId);
      } else {
        return [...prev, linkId];
      }
    });
  };

  // Dispatch brand new announcement (HR / Admin)
  const handleAddAnnouncement = (item: Omit<Announcement, 'id' | 'publishedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `ann-${allAnnouncements.length + 1}`;
    
    const newAnnouncement: Announcement = {
      ...item,
      id: newId,
      publishedDate: today
    };

    setAllAnnouncements(prev => [newAnnouncement, ...prev]);

    // Append security audit log immediately
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'System Operator',
      role: currentUser?.role || 'Employee',
      action: item.isCritical ? 'DISPATCHED CRITICAL NODE BULLETIN' : 'Published Broadcast Alert',
      target: item.title,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append system notification alert immediately for other clients
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: item.isCritical ? '⚠️ CRITICAL BROADCAST ALERT' : 'New Broadcast alert',
      message: `${currentUser?.name} dispatched: "${item.title}"`,
      type: 'announcement',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Disapprove/archive news post
  const handleRemoveAnnouncement = (id: string) => {
    const targetItem = allAnnouncements.find(ann => ann.id === id);
    setAllAnnouncements(prev => prev.filter(ann => ann.id !== id));

    // Append log
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'System Operator',
      role: currentUser?.role || 'Employee',
      action: 'Archived Broadcast Notice',
      target: targetItem?.title || 'Unknown post',
      status: 'WARNING'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append system notification alert immediately
    const delNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Broadcast Notice Deleted',
      message: `${currentUser?.name || 'Administrator'} archived the announcement: "${targetItem?.title || 'Unknown'}"`,
      type: 'announcement',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [delNotif, ...prev]);
  };

  // Upload/dispatch new resource doc (HR / Admin)
  const handleAddDocument = (item: Omit<ResourceDocument, 'id' | 'downloadCount' | 'uploadedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `doc-${allDocuments.length + 1}`;

    const newDoc: ResourceDocument = {
      ...item,
      id: newId,
      downloadCount: 0,
      uploadedDate: today
    };

    setAllDocuments(prev => [newDoc, ...prev]);

    // Audit logs entry
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'System Operator',
      role: currentUser?.role || 'Employee',
      action: 'Registered Resource PDF',
      target: item.title,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append system notification alert immediately
    const uploadNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'New Resource Document Uploaded',
      message: `${currentUser?.name || 'Authorized User'} uploaded SOP/document: "${item.title}" [${item.fileType.toUpperCase()}]`,
      type: 'resource',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [uploadNotif, ...prev]);
  };

  // Log resource download metric index inside layout counters
  const handleDownloadDoc = (docId: string) => {
    setAllDocuments(prev => 
      prev.map(doc => 
        doc.id === docId 
          ? { ...doc, downloadCount: doc.downloadCount + 1 }
          : doc
      )
    );
  };

  // Delete/remove resource document
  const handleRemoveDocument = (docId: string) => {
    const targetDoc = allDocuments.find(d => d.id === docId);
    setAllDocuments(prev => prev.filter(doc => doc.id !== docId));

    if (targetDoc) {
      // Audit logs entry
      const today = new Date().toISOString().split('T')[0];
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
        actor: currentUser?.name || 'System Operator',
        role: currentUser?.role || 'Employee',
        action: 'Deleted Resource Document',
        target: targetDoc.title,
        status: 'SUCCESS'
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // Append system notification alert immediately
      const delDocNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Resource Document Deleted',
        message: `${currentUser?.name || 'Administrator'} deleted the SOP/document: "${targetDoc.title}"`,
        type: 'resource',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [delDocNotif, ...prev]);
      setFeedbackToast(`"${targetDoc.title}" deleted from resource library.`);
    }
  };

  // Update employee password during first-time login
  const handleSetEmployeePassword = (empId: string, passcode: string) => {
    const alteredEmp = allEmployees.find(e => e.id === empId);
    if (alteredEmp) {
      const updated = { ...alteredEmp, password: passcode, isPasscodeSetupComplete: true };
      if (isSupabaseConfigured) {
        upsertRemoteEmployee(updated);
      }
    }
    setAllEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, password: passcode, isPasscodeSetupComplete: true } : emp));
  };

  // Submit password reset request to the Super Admin's queue
  const handleRequestPasscodeReset = (empId: string, empName: string, requestedPasscode: string) => {
    const newRequest: ApprovalRequest = {
      id: `req-${Date.now()}`,
      type: 'reset_passcode',
      hrId: 'self-service',
      hrName: 'Self-Service Request',
      employeeId: empId,
      employeeName: empName,
      details: {
        customPassword: requestedPasscode
      },
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };
    setApprovalRequests(prev => [newRequest, ...prev]);
    setFeedbackToast("Request Sent: Submitted passcode reset request to Super Admin.");
  };

  // Elevate specific employee role (Super Admin switches roles internally)
  const handleUpdateEmployeeRole = async (empId: string, newRole: UserRole, customPassword?: string) => {
    const alteredEmp = allEmployees.find(e => e.id === empId);
    if (!alteredEmp) return;

    if (currentUser?.role === 'HR') {
      const newRequest: ApprovalRequest = {
        id: `req-${Date.now()}`,
        type: 'change_role',
        hrId: currentUser.id,
        hrName: currentUser.name,
        employeeId: empId,
        employeeName: alteredEmp.name,
        details: {
          oldRole: alteredEmp.role,
          newRole: newRole,
          customPassword: customPassword
        },
        status: 'pending',
        timestamp: new Date().toLocaleString()
      };
      setApprovalRequests(prev => [newRequest, ...prev]);

      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Authorization Update Requested',
        message: `HR Manager "${currentUser.name}" requested role elevation of "${alteredEmp.name}" to [${newRole}].`,
        type: 'hr',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      setFeedbackToast("Approval requested: Sent authorization update to Super Admin.");
      return;
    }

    // Modify database list
    setAllEmployees(prev => 
      prev.map(emp => 
        emp.id === empId 
          ? { 
              ...emp, 
              role: newRole, 
              ...(customPassword !== undefined ? { password: customPassword } : {})
            }
          : emp
      )
    );

    if (alteredEmp) {
      const updatedEmp: Employee = {
        ...alteredEmp,
        role: newRole,
        ...(customPassword !== undefined ? { password: customPassword } : {})
      };
      if (isSupabaseConfigured) {
        await upsertRemoteEmployee(updatedEmp);
      }
    }

    // Logging RLS changes
    const today = new Date().toISOString().split('T')[0];

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator System',
      role: currentUser?.role || 'Super Admin',
      action: 'Elevated Directory Role',
      target: `${alteredEmp?.name || 'Unknown'} to [${newRole}]`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append system notification for direct assignment
    const assignNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Security Role Assigned',
      message: `${currentUser?.name || 'Administrator'} updated the security role of "${alteredEmp?.name}" to [${newRole}].`,
      type: 'hr',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [assignNotif, ...prev]);

    // After assignment, update active session if it's the currently logged-in user, show a confirmation toast without force-logging out other sessions
    if (currentUser?.id === empId) {
      setCurrentUser(prev => prev ? { 
        ...prev, 
        role: newRole,
        ...(customPassword !== undefined ? { password: customPassword } : {})
      } : null);
      setFeedbackToast(`Roster updated! Your role clearance has been updated to [${newRole}].`);
    } else {
      setFeedbackToast(`Roster updated! "${alteredEmp?.name}" designation changed to [${newRole}] successfully. Registry refreshed.`);
    }
  };

  // Add a brand new employee user to the database
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    // Avoid registration of duplicate email, corporate ID, or name
    const hasDuplicate = allEmployees.some(emp => 
      emp.email.trim().toLowerCase() === newEmp.email.trim().toLowerCase() ||
      emp.name.trim().toLowerCase() === newEmp.name.trim().toLowerCase() ||
      emp.empId.trim().toLowerCase() === newEmp.empId.trim().toLowerCase()
    );
    if (hasDuplicate) {
      console.warn(`Duplicate employee registration blocked for ${newEmp.name} (${newEmp.email})`);
      return;
    }

    const id = (newEmp as any).id || `emp-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const employee: Employee = {
      ...newEmp,
      password: (newEmp as any).password || 'callbox2026',
      id
    };
    if (isSupabaseConfigured) {
      upsertRemoteEmployee(employee);
    }
    setAllEmployees(prev => {
      const updated = [...prev, employee];
      // Push notification broadcast
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'New Employee Registered',
        message: `${employee.name} added as ${employee.position} (${employee.department}). Current roster: ${updated.length} active employees.`,
        type: 'hr',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(notifs => [newNotif, ...notifs]);
      return updated;
    });

    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator System',
      role: currentUser?.role || 'Super Admin',
      action: 'Registered New Employee',
      target: `${employee.name} as [${employee.role}]`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Remove an employee from the roster (Super Admin or HR)
  const handleRemoveEmployee = (empId: string) => {
    const targetEmp = allEmployees.find(e => e.id === empId);
    if (!targetEmp) return;

    // Prevent deletion of the fixed admin accounts or any root Super Admin to lock stability
    if (targetEmp.empId === 'admin' || targetEmp.id === 'emp-superadmin-restricted' || targetEmp.name === 'admin') {
      setFeedbackToast("Operation Denied: The primary Super Admin account ('admin') is fixed and cannot be deleted.");
      return;
    }

    if (currentUser?.role === 'HR') {
      const newRequest: ApprovalRequest = {
        id: `req-${Date.now()}`,
        type: 'delete_account',
        hrId: currentUser.id,
        hrName: currentUser.name,
        employeeId: empId,
        employeeName: targetEmp.name,
        details: {},
        status: 'pending',
        timestamp: new Date().toLocaleString()
      };
      setApprovalRequests(prev => [newRequest, ...prev]);

      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Directory Deletion Requested',
        message: `HR Manager "${currentUser.name}" requested deletion of employee profile: "${targetEmp.name}".`,
        type: 'hr',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      setFeedbackToast("Approval requested: Sent profile deletion request to Super Admin.");
      return;
    }

    if (isSupabaseConfigured) {
      deleteRemoteEmployee(empId);
    }

    // Remove from employee list
    setAllEmployees(prev => prev.filter(e => e.id !== empId));

    // Append system notification for direct employee deletion
    const deleteNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Employee Profile Deleted',
      message: `${currentUser?.name || 'Administrator'} deleted the employee profile of "${targetEmp.name}".`,
      type: 'hr',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [deleteNotif, ...prev]);

    // Audit logs entry
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator System',
      role: currentUser?.role || 'Super Admin',
      action: 'Decompiled Employee Record',
      target: `${targetEmp.name} [ID: ${targetEmp.empId}]`,
      status: 'WARNING'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // If the Admin deleted themselves, log them out gracefully
    if (currentUser?.id === empId) {
      setCurrentUser(null);
      setViewMode('login');
    }
  };

  const handleAcceptApprovalRequest = async (requestId: string) => {
    const req = approvalRequests.find(r => r.id === requestId);
    if (!req) return;

    if (req.type === 'change_role') {
      const empId = req.employeeId;
      const newRole = req.details.newRole!;
      const customPassword = req.details.customPassword;

      setAllEmployees(prev => 
        prev.map(emp => 
          emp.id === empId 
            ? { 
                ...emp, 
                role: newRole, 
                ...(customPassword !== undefined ? { password: customPassword } : {})
              }
            : emp
        )
      );

      const alteredEmp = allEmployees.find(e => e.id === empId);
      if (alteredEmp) {
        const updatedEmp: Employee = {
          ...alteredEmp,
          role: newRole,
          ...(customPassword !== undefined ? { password: customPassword } : {})
        };
        if (isSupabaseConfigured) {
          await upsertRemoteEmployee(updatedEmp);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
        actor: currentUser?.name || 'Administrator System',
        role: currentUser?.role || 'Super Admin',
        action: 'Elevated Directory Role (Approved HR Request)',
        target: `${req.employeeName} to [${newRole}]`,
        status: 'SUCCESS'
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // If we altered the currently logged-in user profile, propagate immediately
      if (currentUser?.id === empId) {
        setCurrentUser(prev => prev ? { 
          ...prev, 
          role: newRole,
          ...(customPassword !== undefined ? { password: customPassword } : {})
        } : null);
      }
    } else if (req.type === 'delete_account') {
      const empId = req.employeeId;
      const targetEmp = allEmployees.find(e => e.id === empId);
      if (targetEmp) {
        if (isSupabaseConfigured) {
          await deleteRemoteEmployee(empId);
        }

        setAllEmployees(prev => prev.filter(e => e.id !== empId));

        const today = new Date().toISOString().split('T')[0];
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
          actor: currentUser?.name || 'Administrator System',
          role: currentUser?.role || 'Super Admin',
          action: 'Decompiled Employee Record (Approved HR Request)',
          target: `${req.employeeName} [ID: ${targetEmp.empId}]`,
          status: 'WARNING'
        };
        setAuditLogs(prev => [newLog, ...prev]);

        // If the Admin deleted themselves, log them out gracefully
        if (currentUser?.id === empId) {
          setCurrentUser(null);
          setViewMode('login');
        }
      }
    } else if (req.type === 'reset_passcode') {
      const empId = req.employeeId;
      const customPassword = 'callbox2026';

      setAllEmployees(prev => 
        prev.map(emp => 
          emp.id === empId 
            ? { 
                ...emp, 
                password: customPassword,
                isPasscodeSetupComplete: false
              }
            : emp
        )
      );

      const alteredEmp = allEmployees.find(e => e.id === empId);
      if (alteredEmp) {
        const updatedEmp: Employee = {
          ...alteredEmp,
          password: customPassword,
          isPasscodeSetupComplete: false
        };
        if (isSupabaseConfigured) {
          await upsertRemoteEmployee(updatedEmp);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
        actor: currentUser?.name || 'Administrator System',
        role: currentUser?.role || 'Super Admin',
        action: 'Authorized Passcode Reset (Approved)',
        target: `${req.employeeName}`,
        status: 'SUCCESS'
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // If we altered currently logged-in user password, update them
      if (currentUser?.id === empId) {
        setCurrentUser(prev => prev ? { 
          ...prev, 
          password: customPassword,
          isPasscodeSetupComplete: false
        } : null);
      }
    }

    setApprovalRequests(prev => 
      prev.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r)
    );
    setFeedbackToast("Operation approved and executed successfully!");

    // Append approved request notification
    const approveNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Approval Request Approved',
      message: `Super Admin approved the ${req.type === 'change_role' ? 'role designation update' : 'account deletion'} request for "${req.employeeName}".`,
      type: 'hr',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [approveNotif, ...prev]);
  };

  const handleDenyApprovalRequest = (requestId: string) => {
    const req = approvalRequests.find(r => r.id === requestId);
    setApprovalRequests(prev => 
      prev.map(r => r.id === requestId ? { ...r, status: 'denied' as const } : r)
    );
    setFeedbackToast("Operation request denied.");

    if (req) {
      const denyNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Approval Request Denied/Rejected',
        message: `Super Admin rejected the ${req.type === 'change_role' ? 'role designation update' : 'account deletion'} request for "${req.employeeName}".`,
        type: 'hr',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [denyNotif, ...prev]);
    }
  };

  const handleDeleteApprovalRequest = (requestId: string) => {
    const req = approvalRequests.find(r => r.id === requestId);
    setApprovalRequests(prev => prev.filter(r => r.id !== requestId));
    setFeedbackToast("Approval record removed from logs view.");

    if (req) {
      const delReqNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Approval Request Profile Dismissed',
        message: `Approval request registry for "${req.employeeName}" removed from ledger by "${currentUser?.name}".`,
        type: 'hr',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [delReqNotif, ...prev]);
    }
  };

  // Add system utilities from link editor (Admin / HR)
  const handleAddLink = (item: Omit<ResourceLink, 'id' | 'clickCount'>) => {
    // Avoid double creation of similar URLs or titles to optimize DB/state footprints
    const hasDuplicate = allLinks.some(link => 
      link.title.trim().toLowerCase() === item.title.trim().toLowerCase() ||
      link.url.trim().toLowerCase().replace(/\/+$/, '') === item.url.trim().toLowerCase().replace(/\/+$/, '')
    );
    if (hasDuplicate) {
      console.warn(`Duplicate link integration blocked for "${item.title}"`);
      return;
    }

    const newId = `link-${allLinks.length + 1}`;
    const newLink: ResourceLink = {
      ...item,
      id: newId,
      clickCount: 0,
      postedBy: currentUser?.name || 'Werzkie Tim',
      postedByRole: currentUser?.role || 'Super Admin'
    };

    setAllLinks(prev => {
      const updated = [...prev, newLink];
      // Push notification broadcast
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'New Resource Integrated',
        message: `"${newLink.title}" posted to [${newLink.category}]. Active system links: ${updated.length} resources.`,
        type: 'announcement',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(notifs => [newNotif, ...notifs]);
      return updated;
    });

    // Upsert to Supabase if active
    if (isSupabaseConfigured) {
      upsertRemoteLink(newLink).catch(err => {
        console.warn('Silent Supabase sync failure on link insert:', err);
      });
    }

    // Logging creation
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'Super Admin',
      action: 'Integrated Central Link',
      target: item.title,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      logRemoteAudit(newLog).catch(err => {
        console.warn('Silent Supabase sync failure on audit logging:', err);
      });
    }
  };

  // Delete system utilities from catalog list
  const handleRemoveLink = (linkId: string) => {
    const matchingLink = allLinks.find(l => l.id === linkId);
    setAllLinks(prev => prev.filter(l => l.id !== linkId));

    if (isSupabaseConfigured) {
      deleteRemoteLink(linkId).catch(err => {
        console.warn('Silent Supabase sync failure on link delete:', err);
      });
    }

    // Append system notification alert immediately
    const delLinkNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Resource Link Removed',
      message: `"${matchingLink?.title || 'Legacy resources'}" was removed from the general index list by "${currentUser?.name}".`,
      type: 'announcement',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [delLinkNotif, ...prev]);

    // Logging removal
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'Super Admin',
      action: 'Decompiled Link integration',
      target: matchingLink?.title || 'Legacy link',
      status: 'WARNING'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      logRemoteAudit(newLog).catch(err => {
        console.warn('Silent Supabase sync failure on audit logging:', err);
      });
    }
  };

  // Personal account parameters edits inside Profile dashboard page
  const handleUpdateContactInfo = (
    phone: string, 
    email: string, 
    avatarUrl: string,
    name: string,
    position: string,
    department: string,
    gender?: 'Male' | 'Female'
  ) => {
    if (!currentUser) return;
    
    if (isSupabaseConfigured) {
      const updatedUser: Employee = {
        ...currentUser,
        phone,
        email,
        avatarUrl,
        name,
        position,
        department,
        gender
      };
      upsertRemoteEmployee(updatedUser);
    }
    
    // Propagate profile state globally
    setCurrentUser(prev => prev ? { ...prev, phone, email, avatarUrl, name, position, department, gender } : null);
    
    // Save to employees lists
    setAllEmployees(prev => 
      prev.map(emp => 
        emp.id === currentUser.id 
          ? { ...emp, phone, email, avatarUrl, name, position, department, gender }
          : emp
      )
    );

    // Record custom trace stream log
    recordVisitEvent(`Vault Profile Refactored [${name}]`);

    // Audit log records
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: name,
      role: currentUser.role,
      action: 'Updated Profile Parameters',
      target: `Self [Job: ${position} / Dep: ${department}]`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Login event hookup
  const handleLoginSuccess = (user: Employee) => {
    setCurrentUser(user);
    setViewMode('workspace');
    setActiveTab('links');

    // Register login event
    const today = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: user.name,
      role: user.role,
      action: 'Established Session SSL',
      target: 'VPN Node Davao Gateway_10',
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append dynamic/auto-registered employee to center list if not existing
    if (user.role !== 'Inactive') {
      setAllEmployees(prev => {
        const hasUser = prev.some(emp => emp.id === user.id || emp.email.toLowerCase() === user.email.toLowerCase());
        if (!hasUser) {
          if (isSupabaseConfigured) {
            upsertRemoteEmployee(user);
          }
          return [...prev, user];
        }
        return prev;
      });
    }
  };

  // Log outs
  const handleSignOut = () => {
    setCurrentUser(null);
    setViewMode('landing');
  };

  // Computed counters to share within modules
  const linksClicksTotal = allLinks.reduce((sum, link) => sum + link.clickCount, 0);
  const documentsDownloadTotal = allDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Check if active user has any pending unacknowledged critical physical node update
  const activeCriticalAnnouncement = (currentUser && currentUser.role !== 'Inactive') 
    ? allAnnouncements.find(ann => ann.isCritical && !acknowledgedCriticalIds.includes(ann.id))
    : undefined;

  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden text-brand-light font-sans selection:bg-brand-primary/20 relative">
      
      {/* Dynamic Network Node Particle canvas background */}
      <NetworkBackground />

      {/* Ambient background glowing mesh elements */}
      <div className="absolute top-[-10%] right-[-14%] w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-brand-surface-light/30 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[20%] w-[550px] h-[550px] bg-brand-primary/2 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-brand-accent/3 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 1. Landing Hero Spheres view */}
      {viewMode === 'landing' && (
        <LandingHero 
          onEnterPortal={() => setViewMode('login')} 
          onOpenSitemap={() => setIsSitemapOpen(true)} 
        />
      )}

      {/* 2. Authentication viewport Screen */}
      {viewMode === 'login' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          employees={allEmployees} 
          onBackToLanding={() => setViewMode('landing')} 
          onSetEmployeePassword={handleSetEmployeePassword}
          onRequestPasscodeReset={handleRequestPasscodeReset}
        />
      )}

      {/* 3. Authorized Main Office shell */}
      {viewMode === 'workspace' && currentUser && (
        <div className="flex flex-col min-h-screen relative">
          
          {/* Header Dashboard section */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-[#111827]/85 backdrop-blur-xl border-b border-white/10 shadow-lg">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex flex-wrap sm:flex-nowrap gap-3 items-center justify-between">
              
              {/* Branch Logo brandings */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('landing')}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/25 text-brand-primary flex items-center justify-center">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-display font-bold text-white tracking-snug uppercase text-xs sm:text-sm">
                    CALLBOX <span className="text-brand-primary">DAVAO</span>
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">Node Davao_10</span>
                  </div>
                </div>
              </div>

              {/* Connected Supabase Database Connectivity Indicator */}
              <div 
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[9px] tracking-wider uppercase font-bold transition-all relative group cursor-pointer bg-brand-surface/30 ${
                  supabaseMode === 'connected' 
                    ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5' 
                    : supabaseMode === 'error'
                      ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/5'
                      : 'border-white/5 text-gray-400 hover:bg-white/5'
                }`}
                title="View Database Sync Diagnostics"
              >
                <Database className={`h-3 w-3 ${supabaseMode === 'connected' ? 'text-emerald-400' : supabaseMode === 'error' ? 'text-amber-400' : 'text-gray-400'}`} />
                <span>
                  {supabaseMode === 'connected' ? 'SUPABASE: LIVE' : supabaseMode === 'error' ? 'DATABASE ERR' : 'DB: LOCAL MOCK'}
                </span>
                
                {/* Floating tooltip/overlay diagnostic popup */}
                <div className="absolute top-full left-0 mt-2 w-72 p-3 bg-brand-dark border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-[10px] normal-case tracking-normal leading-relaxed text-gray-300 font-sans backdrop-blur-md">
                  <div className="font-mono font-bold text-[#f59e0b] uppercase text-[9px] tracking-wider flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/5">
                    <Sparkles className="h-3 w-3 text-brand-primary animate-pulse" /> Database Integration Hub
                  </div>
                  {supabaseMode === 'connected' ? (
                    <p className="text-emerald-300 font-mono text-[9.5px]">
                      ✔️ Live synchronized channel active. All adding, removal, and incremental click analytics write back to Supabase tables.
                    </p>
                  ) : supabaseMode === 'error' ? (
                    <div className="space-y-1">
                      <p className="text-amber-300 font-bold">⚠️ Connection online, but query rejected.</p>
                      <p className="text-gray-400 text-[9px] font-mono leading-tight">{dbDiagnosticMsg}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-400">⚡ Running using localized client storage.</p>
                      <p className="text-gray-500 text-[9px] font-mono leading-tight">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on Vercel to launch PostgreSQL tables.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time branch clocks */}
              <div className="bg-brand-surface/40 hover:bg-brand-surface/70 px-4 py-1.5 rounded-xl border border-white/5 hover:border-brand-primary/20 flex items-center gap-2 font-mono text-xs text-gray-400 select-none group transition-all duration-300">
                <Clock className="h-4.5 w-4.5 text-brand-primary group-hover:rotate-12 transition-transform" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mr-1 sm:inline block leading-none">DVO TIME:</span>
                  <span className="text-white font-semibold text-xs tracking-tight">{davaoTime}</span>
                </div>
              </div>

              {/* Action bells & accounts */}
              <div className="flex items-center gap-3">
                
                {/* Notification Bell alert sliders */}
                {currentUser.role !== 'Inactive' && (
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/25 transition-all cursor-pointer group"
                    title="Alert Feed"
                    id="notifications-bell"
                  >
                    <Bell className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-brand-primary text-brand-dark font-mono text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg border border-brand-dark animate-bounce">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Main sign out action */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  title={currentUser.role === 'Inactive' ? "Exit Guest Hub" : "Seal Davao Portal session"}
                >
                  <LogOut className="h-4 w-4" /> 
                  <span className="hidden md:inline">{currentUser.role === 'Inactive' ? 'Exit Guest Hub' : 'Sign Out'}</span>
                </button>

              </div>

            </div>
          </header>

          {/* Header spacer to prevent layout overlap under fixed header */}
          <div className="h-[120px] sm:h-[84px] w-full shrink-0" />

          {/* Core Shell bodies */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
            
            {/* 1. Personal Welcome Workspace Alert Header with Custom Themes by Access Level */}
            {(() => {
              const getThemeConfig = () => {
                switch (currentUser.role) {
                  case 'Super Admin':
                    return {
                      title: 'Secure Governance Console',
                      subtitle: 'Administrative Root Gateway',
                      themeBorder: 'border-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,0.1)]',
                      badgeText: 'Level 4 Clearance - Root',
                      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                      gradientBg: 'from-rose-950/15 via-brand-dark/30 to-brand-dark',
                      accentColor: 'text-rose-400',
                      iconBg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
                      desc: 'All system switches, credential directories, and database vaults are fully unlocked.'
                    };
                  case 'HR':
                    return {
                      title: 'Personnel Matrix Hub',
                      subtitle: 'HR Management & Broadcast Deck',
                      themeBorder: 'border-violet-500/30 shadow-[0_0_24px_rgba(139,92,246,0.1)]',
                      badgeText: 'Level 3 Clearance - HR',
                      badgeStyle: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
                      gradientBg: 'from-violet-950/15 via-brand-dark/30 to-brand-dark',
                      accentColor: 'text-violet-400',
                      iconBg: 'bg-violet-500/10 border-violet-500/25 text-violet-400',
                      desc: 'Maintain active personnel rosters, configure resource repositories, and broadcast news feed alerts.'
                    };
                  case 'Employee':
                    return {
                      title: 'Operations & Dialing Desk',
                      subtitle: 'Active Outbound Campaign Agent Environment',
                      themeBorder: 'border-brand-primary/30 shadow-[0_0_24px_rgba(232,192,54,0.1)]',
                      badgeText: 'Level 2 Clearance - Agent',
                      badgeStyle: 'bg-brand-primary/10 text-brand-primary border-brand-primary/25',
                      gradientBg: 'from-brand-primary/5 via-brand-dark/30 to-brand-dark',
                      accentColor: 'text-brand-primary',
                      iconBg: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
                      desc: 'Instantly access active dialer portals, coordinate daily shifts pipelines, and reference workspace utilities.'
                    };
                  case 'Inactive':
                  default:
                    return {
                      title: 'Suspended Archive Node',
                      subtitle: 'Offline Directory & Locked Index Shell',
                      themeBorder: 'border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.1)]',
                      badgeText: 'Level 1 Clearance - Guest',
                      badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse',
                      gradientBg: 'from-amber-500/5 via-brand-dark/30 to-brand-dark',
                      accentColor: 'text-amber-400',
                      iconBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
                      desc: 'Your profile role is set to inactive. Only vital public communication and basic profile hubs are accessible.'
                    };
                }
              };

              const portalTheme = getThemeConfig();

              if (currentUser.role === 'Inactive') {
                return (
                  <div 
                    className="glass-panel rounded-2xl p-4 sm:p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-brand-dark/30 to-brand-dark shadow-[0_0_24px_rgba(245,158,11,0.1)] relative overflow-hidden shadow-xl"
                    id="portal-welcome-grid"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="h-14 w-14 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400 flex items-center justify-center shadow-md shrink-0">
                          <Database className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                              Davao Intranet Portal Gateway
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse">
                              Public Guest Hub
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 font-sans">
                            Operating Mode: <span className="font-semibold text-amber-400">Restricted Link Index Viewer State</span>
                          </p>
                          <p className="text-[11px] text-gray-500 max-w-xl">
                            No credentials or user account active. You are viewing designated quick-access links securely registered by administrative staff.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  className={`glass-panel rounded-2xl p-4 sm:p-6 border relative overflow-hidden shadow-xl transition-all duration-300 bg-gradient-to-br ${portalTheme.gradientBg} ${portalTheme.themeBorder}`}
                  id="portal-welcome-grid"
                >
                  {/* Left panel info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div 
                      className={`h-14 w-14 rounded-2xl border flex items-center justify-center shadow-md shrink-0 transition-all duration-300 overflow-hidden ${portalTheme.iconBg}`}
                      id="welcome-profile-badge"
                    >
                      {currentUser.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name} 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <DefaultAvatar gender={currentUser.gender} name={currentUser.name} className="h-full w-full object-contain p-1" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                          {timeGreeting}, {currentUser.name.split(' ')[0]} 👋
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${portalTheme.badgeStyle}`}>
                          {portalTheme.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-sans flex flex-wrap items-center gap-1">
                        Connected: <span className={`font-semibold ${portalTheme.accentColor}`}>{portalTheme.title}</span> 
                        <span className="text-gray-500">•</span> 
                        <span className="text-[11px] text-gray-400">{portalTheme.subtitle}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 max-w-xl">
                        {portalTheme.desc} Authorized access audit logging is active.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Shell Navigation System */}
            {currentUser.role !== 'Inactive' && (
              <nav className="flex gap-1.5 border-b border-white/10 pb-2.5 overflow-x-auto scrollbar-none whitespace-nowrap -mx-3 px-3 sm:mx-0 sm:px-0" id="portal-tab-dock">
                {[
                  { id: 'links', label: 'Systems Hub', roleReq: ['Employee', 'HR', 'Super Admin'] },
                  { id: 'bulletins', label: 'Bulletin Board', roleReq: ['Employee', 'HR', 'Super Admin'] },
                  { id: 'resources', label: 'SOP & Documents', roleReq: ['Employee', 'HR', 'Super Admin'] },
                  { id: 'analytics', label: 'Branch Analytics', roleReq: ['Employee', 'HR', 'Super Admin'] },
                  { id: 'admin', label: 'Governance Panel', roleReq: ['Super Admin', 'HR'] },
                  { id: 'profile', label: 'My Profile', roleReq: ['Employee', 'HR', 'Super Admin'] },
                ].map((tab) => {
                  // Ensure permission levels checks out
                  const isPermitted = tab.roleReq.includes(currentUser.role);
                  if (!isPermitted) return null;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        recordVisitEvent(`Visited [${tab.label}]`);
                      }}
                      className={`px-3.5 sm:px-4 py-2.5 sm:py-3.5 min-h-[44px] flex items-center justify-center rounded-xl font-display text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                        activeTab === tab.id 
                          ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/35 font-bold gold-glow shadow-[0_0_20px_-3px_rgba(255,199,44,0.45)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {tab.label}
                        {tab.id === 'admin' && currentUser.role === 'Super Admin' && approvalRequests.filter(r => r.status === 'pending').length > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-rose-500 text-white font-mono font-bold leading-none animate-pulse">
                            {approvalRequests.filter(r => r.status === 'pending').length}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Feedback alert toast system */}
            <AnimatePresence>
              {feedbackToast && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="p-3.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 text-brand-primary font-mono text-[11px] flex items-center justify-between shadow-lg gold-glow w-full"
                  id="workspace-feedback-toast"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse shrink-0" />
                    <span>{feedbackToast}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFeedbackToast(null)} 
                    className="text-gray-400 hover:text-white ml-3 select-none text-xs font-bold leading-none"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Render Viewports conditionally with full scope state */}
            <div className="min-h-56">
              
              {activeTab === 'links' && (
                <LinkHub 
                  links={
                    currentUser.role === 'Inactive' 
                      ? allLinks.filter(l => l.isForInactive) 
                      : currentUser.role === 'Employee'
                        ? allLinks.filter(l => l.postedByRole === 'Super Admin' || l.postedByRole === 'HR')
                        : allLinks
                  } 
                  onIncrementClick={handleIncrementLinkCount} 
                  favorites={favorites} 
                  onToggleFavorite={handleToggleFavorite}
                  userRole={currentUser.role}
                  employeeName={currentUser.name}
                  currentUserId={currentUser.id}
                />
              )}

              {activeTab === 'bulletins' && (
                <Announcements
                  announcements={allAnnouncements}
                  onAddAnnouncement={handleAddAnnouncement}
                  onRemoveAnnouncement={handleRemoveAnnouncement}
                  userRole={currentUser.role}
                  employeeName={currentUser.name}
                />
              )}

              {activeTab === 'resources' && (
                <ResourceLibrary
                  documents={allDocuments}
                  onDownloadDoc={handleDownloadDoc}
                  onAddDocument={handleAddDocument}
                  onDeleteDocument={handleRemoveDocument}
                  userRole={currentUser.role}
                  employeeName={currentUser.name}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  auditLogs={auditLogs}
                  linksClicksTotal={linksClicksTotal}
                  documentsDownloadTotal={documentsDownloadTotal}
                />
              )}

              {activeTab === 'admin' && (currentUser.role === 'Super Admin' || currentUser.role === 'HR') && (
                <AdminPanel 
                  employees={allEmployees} 
                  links={allLinks} 
                  onUpdateEmployeeRole={handleUpdateEmployeeRole} 
                  onAddEmployee={handleAddEmployee}
                  onRemoveEmployee={handleRemoveEmployee}
                  onAddLink={handleAddLink} 
                  onRemoveLink={handleRemoveLink}
                  currentUserRole={currentUser.role}
                  currentUserId={currentUser.id}
                  approvalRequests={approvalRequests}
                  onAcceptApprovalRequest={handleAcceptApprovalRequest}
                  onDenyApprovalRequest={handleDenyApprovalRequest}
                  onDeleteApprovalRequest={handleDeleteApprovalRequest}
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePage 
                  currentUser={currentUser} 
                  onUpdateContactInfo={handleUpdateContactInfo}
                  favoritesCount={favorites.length}
                  employees={allEmployees}
                  onRequestPasswordReset={handleRequestPasscodeReset}
                />
              )}

            </div>

          </main>

          {/* 4. Secure Slide-over Notification panel drawer */}
          <AnimatePresence>
            {isNotifOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="max-w-sm w-full bg-brand-surface border-l border-white/10 p-6 shadow-2xl relative flex flex-col justify-between"
                  id="notif-feed-overlay"
                >
                  <div>
                    {/* Header bar alerts */}
                    <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-4.5 w-4.5 text-brand-primary animate-bounce" />
                        <h3 className="font-display font-semibold text-white">System Broadcast Feed</h3>
                      </div>
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1 px-2.5 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-mono cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Dynamic database stats widget showing total links and employees added */}
                    <div className="mb-6 p-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 select-none shadow-inner shadow-black/20">
                      <p className="text-[10px] text-brand-primary font-mono font-bold uppercase tracking-wider mb-2.5">Portal Integrity Metrics</p>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-3 rounded-xl bg-brand-dark/60 border border-white/5 transition-all hover:border-brand-primary/20">
                          <p className="text-xl font-display font-extrabold text-white tracking-tight">{allLinks.length}</p>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase tracking-wide">Total Links</p>
                        </div>
                        <div className="p-3 rounded-xl bg-brand-dark/60 border border-white/5 transition-all hover:border-brand-primary/20">
                          <p className="text-xl font-display font-extrabold text-white tracking-tight">{allEmployees.length}</p>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase tracking-wide">Total Employees</p>
                        </div>
                      </div>
                      
                      {/* Dynamic status section on what was recently added to the workspace */}
                      <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-col gap-2 text-[10px] text-gray-400 font-mono">
                        <div className="flex justify-between items-center bg-brand-dark/20 p-1.5 rounded-lg border border-white/5">
                          <span className="text-gray-500">Latest Link added:</span>
                          <span className="text-brand-primary font-semibold truncate max-w-[140px]" title={allLinks[allLinks.length - 1]?.title || 'None'}>
                            {allLinks[allLinks.length - 1]?.title || 'None Registered'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-brand-dark/20 p-1.5 rounded-lg border border-white/5">
                          <span className="text-gray-500">Latest Employee added:</span>
                          <span className="text-brand-primary font-semibold truncate max-w-[140px]" title={allEmployees[allEmployees.length - 1]?.name || 'None'}>
                            {allEmployees[allEmployees.length - 1]?.name || 'None Registered'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-brand-dark/20 flex flex-col items-center justify-center gap-2 select-none">
                        <Bell className="h-6 w-6 text-gray-600 animate-pulse" />
                        <span>No Broadcast Records Active</span>
                      </div>
                    ) : (
                      <ul className="space-y-3.5 font-sans text-xs max-h-[380px] overflow-y-auto pr-1">
                        {notifications.map((notif, idx) => (
                          <li 
                            key={`${notif.id}-${idx}`} 
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden group/item ${
                              notif.isRead 
                                ? 'bg-brand-dark/30 border-white/5 opacity-60' 
                                : 'bg-brand-dark/70 border-brand-primary/10 hover:border-brand-primary/25'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Circle style alerts */}
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 transition-colors duration-300 ${notif.isRead ? 'bg-white/10' : 'bg-brand-primary'}`} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{notif.title}</p>
                                  <p className="text-gray-400 mt-0.5 whitespace-normal break-words leading-relaxed">{notif.message}</p>
                                  <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">{notif.timestamp}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-gray-500 transition-all cursor-pointer shrink-0 opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                                title="Dismiss notification"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      setIsNotifOpen(false);
                    }}
                    className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                  >
                    Assess all Read
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Davao Footer Credits */}
          <footer className="border-t border-white/5 py-4 mt-auto text-center font-mono text-[10px] text-gray-600 bg-brand-dark">
            <p>© 2026 Callbox Inc. Davao Node Hub. Designed securely relative to Philippines SEC code directives.</p>
          </footer>

        </div>
      )}

      {/* 4. Global Interactive Core Sitemaps & Diagrams Drawer */}
      <SitemapOverlay isOpen={isSitemapOpen} onClose={() => setIsSitemapOpen(false)} />

      {/* 5. MANDATORY CRITICAL BROADCAST ACKNOWLEDGEMENT OVERLAY */}
      <AnimatePresence>
        {activeCriticalAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 min-h-screen"
            id="critical-acknowledgement-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-xl w-full border-2 border-rose-500/30 bg-brand-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Critical Alert Ribbon */}
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-4 flex items-center gap-3 shrink-0">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
                <div className="flex-1">
                  <p className="text-[10px] text-rose-400 font-mono font-bold tracking-widest uppercase">Node Compliance Directive</p>
                  <h4 className="text-sm font-semibold text-white tracking-snug">CRITICAL SYSTEM BROADCAST EXECUTED</h4>
                </div>
                <div className="px-2.5 py-1 rounded bg-rose-500/20 text-[9px] font-mono font-bold text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                  MANDATORY READING
                </div>
              </div>

              {/* Scrollable Document Details Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
                <div>
                  <span className="text-[10px] font-mono font-bold py-0.5 px-2.5 rounded bg-brand-primary/10 border border-brand-primary/25 text-brand-primary uppercase">
                    {activeCriticalAnnouncement.category}
                  </span>
                  
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-3 tracking-snug leading-tight border-b border-white/5 pb-3">
                    {activeCriticalAnnouncement.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-gray-400 bg-brand-dark/40 py-2 px-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-gray-500">ISSUED BY:</span> <strong className="text-white font-medium">{activeCriticalAnnouncement.publishedBy}</strong>
                  </div>
                  <div className="hidden sm:block text-gray-600">|</div>
                  <div>
                    <span className="text-gray-500">TIMESTAMP:</span> <strong className="text-white font-medium">{activeCriticalAnnouncement.publishedDate}</strong>
                  </div>
                </div>

                <div className="text-sm text-gray-300 space-y-4 max-h-[250px] overflow-y-auto bg-brand-dark/40 border border-white/5 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-rose-500/20">
                  {activeCriticalAnnouncement.content}
                </div>

                <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-mono text-gray-400 leading-relaxed">
                  <span className="text-rose-400 font-bold block mb-1">⚠️ ACKNOWLEDGEMENT COMPLIANCE CONTRACT</span>
                  By clicking the confirmation action below, you declare that you have fully received, read, and registered this operational physical node directive. This action is authenticated and recorded in the permanent security ledger.
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-brand-dark/40 border-t border-white/5 p-6 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    // Play confirmation auditory feedback beeps
                    playBeep(520, 0.1);
                    setTimeout(() => playBeep(780, 0.15), 60);

                    // Update acknowledged list
                    setAcknowledgedCriticalIds(prev => [...prev, activeCriticalAnnouncement.id]);

                    // Append audit log compliance indexing
                    const today = new Date().toISOString().split('T')[0];
                    const newLog: AuditLog = {
                      id: `log-${Date.now()}`,
                      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
                      actor: currentUser?.name || 'Unknown Employee',
                      role: currentUser?.role || 'Employee',
                      action: 'ACKNOWLEDGED CRITICAL NODE BULLETIN',
                      target: activeCriticalAnnouncement.title,
                      status: 'SUCCESS'
                    };
                    setAuditLogs(prev => [newLog, ...prev]);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-600 text-brand-dark hover:shadow-lg hover:shadow-rose-500/20 font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                >
                  <CheckCircle className="h-4 w-4" /> Heard & Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

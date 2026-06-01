/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, LogOut, Bell, User, Clock, ShieldAlert, Sparkles, Cpu, 
  Mail, MessageSquare, Video, Database, PhoneCall, Users, Wrench, 
  DollarSign, GraduationCap, BookOpen, BarChart3, AlertCircle, Bookmark, CheckCircle, Flame
} from 'lucide-react';

// Types and Seed Data
import { Employee, ResourceLink, Announcement, ResourceDocument, AuditLog, SystemNotification, UserRole } from './types';
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
  gender: 'Female'
};

// Supabase Integration Services
import { 
  isSupabaseConfigured, 
  fetchRemoteLinks, 
  upsertRemoteLink, 
  deleteRemoteLink, 
  logRemoteAudit, 
  fetchRemoteAuditLogs,
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
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'workspace'>('landing');
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'bulletins' | 'resources' | 'profile' | 'analytics' | 'admin'>('links');
  
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
      const emps: Employee[] = saved ? JSON.parse(saved) : [defaultAdmin];
      
      const seenIds = new Set<string>();
      let changed = false;
      const cleanEmps = emps.map((emp, index) => {
        if (!emp.id || seenIds.has(emp.id)) {
          const uniqueId = `emp-${Date.now()}-${index}-${Math.floor(100000 + Math.random() * 900000)}`;
          seenIds.add(uniqueId);
          changed = true;
          return { ...emp, id: uniqueId };
        }
        seenIds.add(emp.id);
        return emp;
      });
      
      if (changed) {
        localStorage.setItem('cb_allEmployees_v2', JSON.stringify(cleanEmps));
      }
      return cleanEmps;
    } catch {
      return [defaultAdmin];
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
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('cb_notifications_v2');
      const loaded = saved ? JSON.parse(saved) : mockNotifications;
      const seen = new Set();
      return loaded.filter((n: any) => {
        if (!n || !n.id) return false;
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    } catch {
      return mockNotifications;
    }
  });

  // Local Storage Synchronization Effects
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

  useEffect(() => {
    localStorage.setItem('cb_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  // Personalized Favorite Bookmarks State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cb_favorites_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cb_favorites_v2', JSON.stringify(favorites));
  }, [favorites]);

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
      action: 'Published Broadcast Alert',
      target: item.title,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Append system notification alert immediately for other clients
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'New Broadcast alert',
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

  // Elevate specific employee role (Super Admin switches roles internally)
  const handleUpdateEmployeeRole = (empId: string, newRole: UserRole, customPassword?: string) => {
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

    const alteredEmp = allEmployees.find(e => e.id === empId);

    // Auto login if assigned to Super Admin or HR!
    if (alteredEmp && (newRole === 'Super Admin' || newRole === 'HR')) {
      const updatedEmp: Employee = {
        ...alteredEmp,
        role: newRole,
        ...(customPassword !== undefined ? { password: customPassword } : {})
      };
      setCurrentUser(updatedEmp);
      setViewMode('workspace');
      setActiveTab('links');
      setFeedbackToast(`Auto-logged in as ${updatedEmp.name} (${newRole}) with the new passcode! 🔐`);
    } else if (currentUser?.id === empId) {
      // If we altered the currently logged-in user profile, propagate immediately
      setCurrentUser(prev => prev ? { 
        ...prev, 
        role: newRole,
        ...(customPassword !== undefined ? { password: customPassword } : {})
      } : null);
    }

    // Logging RLS changes
    const today = new Date().toISOString().split('T')[0];

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
      actor: currentUser?.name || 'Administrator System',
      role: currentUser?.role || 'Super Admin',
      action: 'Elevated Directory Role',
      target: `${alteredEmp?.name} to [${newRole}]`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add a brand new employee user to the database
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const employee: Employee = {
      ...newEmp,
      id
    };
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

    // Remove from employee list
    setAllEmployees(prev => prev.filter(e => e.id !== empId));

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

  // Add system utilities from link editor (Admin / HR)
  const handleAddLink = (item: Omit<ResourceLink, 'id' | 'clickCount'>) => {
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

  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden text-brand-light font-sans selection:bg-brand-primary/20 relative">
      
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
        />
      )}

      {/* 3. Authorized Main Office shell */}
      {viewMode === 'workspace' && currentUser && (
        <div className="flex flex-col min-h-screen relative">
          
          {/* Header Dashboard section */}
          <header className="sticky top-0 z-40 bg-[#111827]/85 backdrop-blur-xl border-b border-white/10 shadow-lg">
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
                      className={`px-3.5 sm:px-4 py-2.5 sm:py-3.5 min-h-[44px] flex items-center justify-center rounded-xl font-display text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        activeTab === tab.id 
                          ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {tab.label}
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
                        ? allLinks.filter(l => l.postedByRole === 'Super Admin')
                        : allLinks
                  } 
                  onIncrementClick={handleIncrementLinkCount} 
                  favorites={favorites} 
                  onToggleFavorite={handleToggleFavorite}
                  userRole={currentUser.role}
                  employeeName={currentUser.name}
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
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePage 
                  currentUser={currentUser} 
                  onUpdateContactInfo={handleUpdateContactInfo}
                  favoritesCount={favorites.length}
                  employees={allEmployees}
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

                    <ul className="space-y-4 font-sans text-xs max-h-[380px] overflow-y-auto pr-1">
                      {notifications.map((notif, idx) => (
                        <li key={`${notif.id}-${idx}`} className="p-3.5 rounded-xl border border-white/5 bg-brand-dark/50 relative overflow-hidden group">
                          {/* Circle style alerts */}
                          <div className="flex items-start gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-white">{notif.title}</p>
                              <p className="text-gray-400 mt-0.5">{notif.message}</p>
                              <span className="text-[10px] text-gray-500 font-mono mt-1 block">{notif.timestamp}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
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

    </div>
  );
}

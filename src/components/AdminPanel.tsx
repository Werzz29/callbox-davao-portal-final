/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Link, FileKey, Shield, ShieldCheck, Heart, Trash2, 
  Settings, CheckCircle, RefreshCw, UserPlus, FileWarning, KeyRound, BookmarkMinus, User, Upload, Sparkles,
  Scan, Camera, Search
} from 'lucide-react';
import { Employee, ResourceLink, UserRole } from '../types';
import DefaultAvatar from './DefaultAvatar';

interface AdminPanelProps {
  employees: Employee[];
  links: ResourceLink[];
  onUpdateEmployeeRole: (empId: string, newRole: UserRole, customPassword?: string) => void;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (empId: string) => void;
  onAddLink: (link: Omit<ResourceLink, 'id' | 'clickCount'>) => void;
  onRemoveLink: (linkId: string) => void;
  currentUserRole: UserRole;
  currentUserId?: string;
}

const getInitials = (fullName: string) => {
  const parts = fullName.trim().replaceAll(/[^a-zA-Z\s]/g, '').split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'CB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

export default function AdminPanel({
  employees,
  links,
  onUpdateEmployeeRole,
  onAddEmployee,
  onRemoveEmployee,
  onAddLink,
  onRemoveLink,
  currentUserRole,
  currentUserId
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'linkManager'>('roster');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter employees or default fallback
  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.empId.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query)
    );
  });

  // New Link states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<ResourceLink['category']>('Operations');
  const [newIcon, setNewIcon] = useState('ExternalLink');
  const [newIsForInactive, setNewIsForInactive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // New Employee lists states
  const [empName, setEmpName] = useState('');
  const [empMail, setEmpMail] = useState('');
  const [empMailPrefix, setEmpMailPrefix] = useState('');
  const [empCorpId, setEmpCorpId] = useState(() => `CB-DVO-${Math.floor(100 + Math.random() * 900)}`);
  const [empDepartment, setEmpDepartment] = useState<string>('APAC');
  const [empPosition, setEmpPosition] = useState('Dvo CS APAC _DB Support');
  const [empRole, setEmpRole] = useState<UserRole>('Employee');
  const [empAvatar, setEmpAvatar] = useState('');
  const [empGender, setEmpGender] = useState<'Male' | 'Female'>('Male');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDraggingCSV, setIsDraggingCSV] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null);

  // Password setup states for Super Admin or HR assignments
  const [passwordPromptUser, setPasswordPromptUser] = useState<{ empId: string; empName: string; role: UserRole } | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRoleChangeSelect = (empId: string, empName: string, newRole: UserRole) => {
    if (newRole === 'Super Admin' || newRole === 'HR') {
      setPasswordPromptUser({ empId, empName, role: newRole });
      setCustomPasswordInput('');
      setPasswordError('');
    } else {
      onUpdateEmployeeRole(empId, newRole);
    }
  };

  // Corporate ID scanner simulation
  const [isScanningID, setIsScanningID] = useState(false);
  const [isScanningIDProcess, setIsScanningIDProcess] = useState(false);
  const [scanStatusLog, setScanStatusLog] = useState<string[]>([]);
  const [activeScanBadgeId, setActiveScanBadgeId] = useState<string | null>(null);

  // Link scanner simulation states
  const [isScanningLink, setIsScanningLink] = useState(false);
  const [isScanningLinkProcess, setIsScanningLinkProcess] = useState(false);
  const [linkScanStatusLog, setLinkScanStatusLog] = useState<string[]>([]);
  const [activeLinkTemplateId, setActiveLinkTemplateId] = useState<string | null>(null);
  const [isAnalyzerActive, setIsAnalyzerActive] = useState(false);
  const [scanReport, setScanReport] = useState<{
    url: string;
    protocol: string;
    isSecure: boolean;
    domain: string;
    latency: number;
    extractedKeywords: string[];
    confidence: number;
    tlsVersion: string;
    ipMock: string;
    status: number;
  } | null>(null);

  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch (e) {
      // Ignored
    }
  };

  const executeBarcodeScan = (
    badgeId: string, 
    badgeName: string, 
    corpId: string, 
    dept: Employee['department'], 
    pos: string, 
    role: UserRole, 
    gen: 'Male' | 'Female'
  ) => {
    if (isScanningIDProcess) return;
    setIsScanningIDProcess(true);
    setActiveScanBadgeId(badgeId);
    setScanStatusLog(['Initializing optical lens proxy...', 'Grid lock achieved. Waiting for badge emission.']);
    
    playBeep(440, 0.08);

    const logSteps = [
      { delay: 300, text: 'Laser focus: ACTIVE' },
      { delay: 600, text: `Decoding high-density PDF417 matrix: ${corpId}` },
      { delay: 1000, text: 'Searching global active index directories...' },
      { delay: 1300, text: `Verification: COMPLETE [Identity: ${badgeName}]` }
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setScanStatusLog(prev => [...prev, step.text]);
        playBeep(650, 0.04);
      }, step.delay);
    });

    setTimeout(() => {
      // populate the entire form automatically!
      setEmpCorpId(corpId);
      setEmpName(badgeName);
      setEmpDepartment(dept);
      setEmpPosition(pos);
      setEmpRole(role);
      setEmpGender(gen);

      // Generate office email
      const parts = badgeName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      if (firstName) {
        setEmpMail(`${firstName.toLowerCase()}.${lastName.toLowerCase().replaceAll(/[^a-z]/g, '')}@callboxinc.com`);
      }

      // Populate random high quality avatar match
      const maleAvatars = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop'
      ];
      const femaleAvatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop'
      ];
      const selectedList = gen === 'Female' ? femaleAvatars : maleAvatars;
      setEmpAvatar(selectedList[Math.floor(Math.random() * selectedList.length)]);

      // Audio beeps for complete success
      playBeep(1000, 0.22);
      setTimeout(() => playBeep(1350, 0.18), 90);

      setIsScanningIDProcess(false);
      setIsScanningID(false);
      setActiveScanBadgeId(null);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    }, 1700);
  };

  const executeLinkScan = (
    templateId: string, 
    title: string, 
    url: string, 
    desc: string, 
    category: ResourceLink['category'], 
    icon: string, 
    isForInactive: boolean
  ) => {
    if (isScanningLinkProcess) return;
    setIsScanningLinkProcess(true);
    setActiveLinkTemplateId(templateId);
    setLinkScanStatusLog(['Opening connection handshake...', 'Inspecting corporate endpoint security header SLA...']);
    
    playBeep(520, 0.08);

    const logSteps = [
      { delay: 300, text: 'Resolving DNS & routing latency parameters...' },
      { delay: 600, text: `Ping response: SUCCESS [Status code: 200 OK]` },
      { delay: 900, text: 'Extracting metadata & semantic JSON markup tags...' },
      { delay: 1250, text: `Mapping icon configuration to schema target: ${icon}` },
      { delay: 1500, text: 'Integrity scan status validation: COMPLETE' }
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setLinkScanStatusLog(prev => [...prev, step.text]);
        playBeep(600 + Math.random() * 200, 0.04);
      }, step.delay);
    });

    setTimeout(() => {
      // populate the entire form automatically!
      setNewUrl(url);
      setNewTitle(title);
      setNewDesc(desc);
      setNewCategory(category);
      setNewIcon(icon);
      setNewIsForInactive(isForInactive);

      playBeep(1100, 0.25);
      setTimeout(() => playBeep(1400, 0.2), 90);

      setIsScanningLinkProcess(false);
      setIsScanningLink(false);
      setActiveLinkTemplateId(null);
      setSuccessMsg(`Endpoint URL mapped: ${title}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1800);
  };

  const handleAutoAnalyzeCustomUrl = () => {
    let targetUrl = newUrl.trim();
    if (!targetUrl) return;
    
    // Auto-normalize protocol if missing
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      setNewUrl(targetUrl);
    }

    setIsAnalyzerActive(true);
    setScanReport(null);
    playBeep(450, 0.08);
    
    setTimeout(() => {
      let title = 'Custom Intranet Node';
      let desc = 'Automated endpoint registration via proxy analysis.';
      let category: ResourceLink['category'] = 'Operations';
      let icon = 'Database';
      let isForInactive = false;
      let confidence = 75;
      
      const domain = targetUrl.toLowerCase();
      let parsedUrl: URL | null = null;
      let hostStr = 'unknown-host';
      const extractedWords: string[] = [];

      try {
        parsedUrl = new URL(targetUrl);
        hostStr = parsedUrl.hostname;
        
        // Extract heuristic keywords
        const cleanStr = `${parsedUrl.hostname} ${parsedUrl.pathname}`.replace(/[^a-zA-Z0-9]/g, ' ');
        const rawWords = cleanStr.toLowerCase().split(/\s+/);
        const stopWords = ['www', 'com', 'org', 'net', 'callboxinc', 'http', 'https', 'html', 'aspx', 'php', 'index', 'app'];
        
        rawWords.forEach(w => {
          if (w.length > 2 && !stopWords.includes(w)) {
            const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
            if (!extractedWords.includes(capitalized)) {
              extractedWords.push(capitalized);
            }
          }
        });
      } catch (e) {
        // ignore malformed URL parsing errors
      }

      if (domain.includes('gmail') || domain.includes('mail') || domain.includes('outlook') || domain.includes('comms') || domain.includes('email')) {
        title = 'Corporate Comms Mailbox';
        desc = 'Central communication client for Davao regional SDR email correspondences.';
        category = 'Communication';
        icon = 'Mail';
        confidence = 98;
      } else if (domain.includes('leaderboard') || domain.includes('scoreboard') || domain.includes('performance') || domain.includes('stats')) {
        title = 'Davao Real-Time Analytics';
        desc = 'Live agent scoreboard, conversion stats, and hourly target indexes.';
        category = 'Operations';
        icon = 'BarChart3';
        confidence = 97;
      } else if (domain.includes('dial') || domain.includes('phone') || domain.includes('ring') || domain.includes('voip') || domain.includes('connector')) {
        title = 'Global Team SIP Dialer';
        desc = 'High-throughput SIP VoIP dialer connector routing campaign calls.';
        category = 'Communication';
        icon = 'PhoneCall';
        confidence = 96;
      } else if (domain.includes('pay') || domain.includes('salary') || domain.includes('payroll') || domain.includes('appraisal') || domain.includes('incentive') || domain.includes('leave')) {
        title = 'HR Payroll & Appraisal Portal';
        desc = 'Vault access to monthly timesheets, key metrics, and leave request trackers.';
        category = 'Human Resources';
        icon = 'DollarSign';
        isForInactive = true;
        confidence = 99;
      } else if (domain.includes('support') || domain.includes('help') || domain.includes('ticket') || domain.includes('admin') || domain.includes('wrench')) {
        title = 'IT Support & Hardware Ticketing';
        desc = 'Submit high-priority helpdesk queries, equipment request clearances, or diagnostics.';
        category = 'IT Support';
        icon = 'Wrench';
        isForInactive = true;
        confidence = 95;
      } else if (domain.includes('learn') || domain.includes('academy') || domain.includes('course') || domain.includes('training') || domain.includes('upskill') || domain.includes('guide')) {
        title = 'Davao Learning Academy Portal';
        desc = 'Interactive digital portal hosting courses and certification materials for agent upskilling.';
        category = 'Learning';
        icon = 'BookOpen';
        confidence = 94;
      } else if (domain.includes('sheet') || domain.includes('excel') || domain.includes('drive') || domain.includes('docs')) {
        title = 'Operational Tracking Spreadsheet';
        desc = 'Central spreadsheet repository used for general data tracking and audit pipelines.';
        category = 'Operations';
        icon = 'Database';
        confidence = 88;
      } else if (domain.includes('slack') || domain.includes('teams') || domain.includes('chat') || domain.includes('discord')) {
        title = 'Real-Time Team Liaison Chat';
        desc = 'Instant messenger channel for cross-department coordination and system announcements.';
        category = 'Communication';
        icon = 'MessageSquare';
        confidence = 93;
      } else if (domain.includes('zoom') || domain.includes('meet') || domain.includes('video')) {
        title = 'Davao Conference Meeting Hub';
        desc = 'Virtual video conferencing terminal for daily operational debriefs and training syncs.';
        category = 'Communication';
        icon = 'Video';
        confidence = 92;
      } else if (extractedWords.length > 0) {
        // Build customized dynamic title
        const hostNameClean = hostStr.split('.')[0] || 'Node';
        const formattedHost = hostNameClean.charAt(0).toUpperCase() + hostNameClean.slice(1);
        
        if (formattedHost.toLowerCase() === 'callboxinc' || formattedHost.toLowerCase() === 'dvo') {
          title = `${extractedWords.slice(0, 3).join(' ')} Node`;
        } else {
          title = `${formattedHost} ${extractedWords[0] || 'Operations'} Hub`;
        }
        
        desc = `Dynamic connection portal mapped to ${hostStr} resources for active user navigation catalogs.`;
        
        const joinedWords = extractedWords.join(' ').toLowerCase();
        if (joinedWords.includes('class') || joinedWords.includes('book') || joinedWords.includes('kb') || joinedWords.includes('study') || joinedWords.includes('doc')) {
          category = 'Learning';
          icon = 'BookOpen';
          confidence = 85;
        } else if (joinedWords.includes('issue') || joinedWords.includes('ticket') || joinedWords.includes('hardware') || joinedWords.includes('network') || joinedWords.includes('server')) {
          category = 'IT Support';
          icon = 'Wrench';
          confidence = 82;
        } else if (joinedWords.includes('human') || joinedWords.includes('staff') || joinedWords.includes('benefit') || joinedWords.includes('career')) {
          category = 'Human Resources';
          icon = 'DollarSign';
          confidence = 84;
        } else {
          category = 'Operations';
          icon = 'Database';
          confidence = 79;
        }
      }

      setNewTitle(title);
      setNewDesc(desc);
      setNewCategory(category);
      setNewIcon(icon);
      setNewIsForInactive(isForInactive);

      // Save a highly precise Scan Diagnostic Report
      setScanReport({
        url: targetUrl,
        protocol: targetUrl.startsWith('https://') ? 'HTTPS' : 'HTTP',
        isSecure: targetUrl.startsWith('https://'),
        domain: hostStr,
        latency: Math.floor(15 + Math.random() * 45), // 15ms to 60ms latency
        extractedKeywords: extractedWords.slice(0, 5),
        confidence: confidence,
        tlsVersion: 'TLS v1.3 (ChaCha20-Poly1305)',
        ipMock: `172.24.${Math.floor(10 + Math.random() * 240)}.${Math.floor(2 + Math.random() * 254)}`,
        status: 200
      });

      playBeep(900, 0.12);
      setTimeout(() => playBeep(1200, 0.15), 80);

      setIsAnalyzerActive(false);
      setSuccessMsg('URL successfully scanned & attributes mapped to system catalog!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    onAddLink({
      title: newTitle,
      description: newDesc || 'No desc provided.',
      url: newUrl,
      category: newCategory,
      icon: newIcon,
      isPopular: false,
      isForInactive: newIsForInactive
    });

    setSuccessMsg('Utility integrated successfully into index!');
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setNewIsForInactive(false);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empMailPrefix) return;

    const today = new Date().toISOString().split('T')[0];
    const generatedCorpId = empCorpId || `CB-DVO-${Math.floor(100 + Math.random() * 900)}`;
    const finalEmail = `${empMailPrefix.trim().toLowerCase().replace(/@.*$/, '')}@callboxinc.com`;

    onAddEmployee({
      name: empName.trim(),
      email: finalEmail,
      empId: generatedCorpId,
      department: empDepartment,
      position: empPosition,
      role: 'Employee',
      avatarUrl: empAvatar || '',
      phone: '+63 917 555 ' + Math.floor(1000 + Math.random() * 9000),
      joinedDate: today,
      gender: empGender
    });

    setSuccessMsg('New employee added securely to global rosters!');
    setEmpName('');
    setEmpMailPrefix('');
    setEmpAvatar('');
    setEmpCorpId(`CB-DVO-${Math.floor(100 + Math.random() * 900)}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDocumentImport = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv' || extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) return;
          const csvLines = text.split(/\r?\n/).filter(line => line.trim());
          if (csvLines.length <= 1) {
            setUploadError('File appears empty or contains header only.');
            return;
          }
          
          let importedCount = 0;
          const delimiter = csvLines[0].includes(';') ? ';' : csvLines[0].includes('\t') ? '\t' : ',';
          const headers = csvLines[0].split(delimiter).map(h => h.trim().toLowerCase());
          
          for (let i = 1; i < csvLines.length; i++) {
            const columns = csvLines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (columns.length < 2) continue;
            
            let name = columns[0] || 'Imported Employee';
            let team = 'OJT';
            let shift = 'APAC';
            let email = '';
            
            headers.forEach((h, idx) => {
              const val = columns[idx];
              if (!val) return;
              if (h.includes('name')) name = val;
              else if (h.includes('team') || h.includes('position')) team = val;
              else if (h.includes('shift') || h.includes('dept') || h.includes('department')) shift = val;
              else if (h.includes('mail') || h.includes('address')) email = val;
            });
            
            if (!name) name = columns[0] || 'Agent';
            if (columns[1] && !headers.some(h => h.includes('team'))) team = columns[1];
            if (columns[2] && !headers.some(h => h.includes('shift'))) shift = columns[2];
            if (columns[3] && !headers.some(h => h.includes('mail'))) email = columns[3];

            const mailPrefix = email ? email.split('@')[0] : name.toLowerCase().replace(/[^a-z0-9]/g, '.');
            const finalEmail = `${mailPrefix}@callboxinc.com`;
            const randomCorpId = `CB-DVO-${Math.floor(100 + Math.random() * 900)}`;

            onAddEmployee({
              name,
              email: finalEmail,
              empId: randomCorpId,
              department: shift,
              position: team,
              role: 'Employee',
              avatarUrl: '',
              phone: '+63 917 555 ' + Math.floor(1000 + Math.random() * 9000),
              joinedDate: new Date().toISOString().split('T')[0],
              gender: 'Male'
            });
            importedCount++;
          }
          
          playBeep(880, 0.12);
          setTimeout(() => playBeep(1100, 0.15), 80);
          setSuccessMsg(`Imported ${importedCount} employees from CSV dataset!`);
          setUploadError('');
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch {
          setUploadError('Failed to parse employee CSV structure.');
        }
      };
      reader.readAsText(file);
    } else {
      playBeep(700, 0.1);
      setTimeout(() => playBeep(1000, 0.15), 60);
      setDocUploadSuccess(`Successfully cataloged "${file.name}" into directory files storage index!`);
      setTimeout(() => setDocUploadSuccess(null), 4000);
    }
  };

  const handleAutoScanName = () => {
    if (!empName.trim()) return;
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      const nameClean = empName.trim();
      const parts = nameClean.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';

      const nameLower = nameClean.toLowerCase();
      let detectedGender: 'Male' | 'Female' = 'Male';

      const femaleHeuristics = [
        'maria', 'mary', 'ma.', 'marian', 'macy', 'mae', 'jane', 'sara', 'sarah', 
        'elena', 'kristina', 'kris', 'michelle', 'ana', 'anna', 'angel', 'angela', 
        'grace', 'rose', 'jessica', 'joan', 'joanna', 'joy', 'christine', 'patricia', 
        'rachelle', 'rachel', 'princess', 'divina', 'cherry', 'april', 'june', 'july',
        'clarisse', 'charlene', 'rebecca', 'hazel', 'nicole', 'janice', 'jenny', 'karen',
        'katarina', 'sofia', 'clara', 'elizabeth', 'elisa', 'irene', 'beatrice', 'bianca'
      ];

      const isFemale = femaleHeuristics.some(fh => nameLower.includes(fh));
      if (isFemale) {
        detectedGender = 'Female';
      }
      setEmpGender(detectedGender);

      if (firstName) {
        const formattedEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase().replaceAll(/[^a-z]/g, '')}@callboxinc.com`;
        setEmpMail(formattedEmail);
      }

      if (nameLower.includes('recruit') || nameLower.includes('hr') || nameLower.includes('talent') || nameLower.includes('people') || nameLower.includes('training')) {
        setEmpDepartment('Human Resources');
        setEmpPosition('HR Talent Specialist');
      } else if (nameLower.includes('tech') || nameLower.includes('system') || nameLower.includes('admin') || nameLower.includes('it') || nameLower.includes('support') || nameLower.includes('network') || nameLower.includes('dev')) {
        setEmpDepartment('IT Support');
        setEmpPosition('Helpdesk Systems Engineer');
      } else if (nameLower.includes('market') || nameLower.includes('growth') || nameLower.includes('sales') || nameLower.includes('lead') || nameLower.includes('brand') || nameLower.includes('seo')) {
        setEmpDepartment('Marketing');
        setEmpPosition('Digital Campaign Specialist');
      } else if (nameLower.includes('chief') || nameLower.includes('director') || nameLower.includes('exec') || nameLower.includes('manager') || nameLower.includes('vp')) {
        setEmpDepartment('Executive');
        setEmpPosition('Operations Director');
      } else {
        setEmpDepartment('Operations');
        setEmpPosition('Outbound SDR Agent');
      }

      // Populate random avatar index matching gender selection
      const maleAvatars = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop'
      ];
      const femaleAvatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop'
      ];
      const selectedList = detectedGender === 'Female' ? femaleAvatars : maleAvatars;
      const pickedImg = selectedList[Math.floor(Math.random() * selectedList.length)];
      setEmpAvatar(pickedImg);

      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="admin-management-module">
      {/* Panel Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Shield className="h-4 w-4" /> System Governance Unit
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Central Admin Panel</h2>
          <p className="text-sm text-gray-400">Manage Davao directory lists, elevate employee permissions, register users, and add external CRM interfaces.</p>
        </div>

        {/* Admin only badge indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-[11px] font-mono leading-none">
          <ShieldCheck className="h-3.5 w-3.5" /> ROLE AUTHORIZED: {currentUserRole}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'roster' 
              ? 'bg-brand-primary text-brand-dark font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="h-4 w-4 shrink-0" /> Employee Directory & Users
        </button>

        <button
          onClick={() => setActiveTab('linkManager')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'linkManager' 
              ? 'bg-brand-primary text-brand-dark font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Link className="h-4 w-4 shrink-0" /> CRM Link Catalog Editor
        </button>
      </div>

      {successMsg && activeTab === 'roster' && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-pulse">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Roster elevated controls */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* USER REGISTRATION FORM CONTAINER */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-5 border border-brand-primary/10 h-fit space-y-4 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-brand-primary" />
                  <h3 className="font-display font-semibold text-sm text-white">Register Client SDR / Agent</h3>
                </div>
              </div>
              
              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs font-sans relative">
                {/* NAME INPUT */}
                <div>
                  <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    title="Full Name"
                  />
                </div>

                {/* TEAM SELECT DROPDOWN */}
                <div>
                  <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Team Designation</label>
                  <select
                    value={empPosition}
                    onChange={(e) => setEmpPosition(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary cursor-pointer font-sans"
                    title="Team Designation"
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
                    ].map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                {/* SHIFT DESIGNATION */}
                <div>
                  <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Shift Schedule</label>
                  <select
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary cursor-pointer font-sans uppercase font-bold"
                    title="Shift Schedule"
                  >
                    {['APAC', 'NAM', 'HR'].map(shiftOption => (
                      <option key={shiftOption} value={shiftOption}>{shiftOption} Schedule</option>
                    ))}
                  </select>
                </div>

                {/* EMAIL ADDRESS WITH DOMAIN ENFORCEMENT */}
                <div>
                  <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">Email Address</label>
                  <div className="flex rounded-lg overflow-hidden border border-white/10 focus-within:border-brand-primary">
                    <input
                      type="text"
                      required
                      value={empMailPrefix}
                      onChange={(e) => setEmpMailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      placeholder="e.g. j.doe"
                      className="flex-1 min-w-0 bg-brand-dark px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none font-mono"
                      title="Email prefix"
                    />
                    <span className="bg-white/5 border-l border-white/10 px-3 py-2.5 text-gray-400 font-mono text-[11px] flex items-center shrink-0">
                      @callboxinc.com
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-mono mt-1">Domain restricted to official corporate @callboxinc.com addresses.</p>
                </div>

                {/* REGISTER BUTTON */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold hover:gold-glow font-mono uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" /> REGISTER NEW USER
                </button>
              </form>
            </div>

            {/* BATCH CSV IMPORT & FILE UPLOAD ZONE */}
            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-brand-primary" />
                  <h3 className="font-display font-semibold text-sm text-white">Batch Import & Document Hub</h3>
                </div>
              </div>

              {/* UPLOAD ERROR DISPLAY */}
              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono flex items-start gap-1.5 animate-pulse">
                  <FileWarning className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* DOCUMENT SUCCESS DISPLAY */}
              {docUploadSuccess && (
                <div className="p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[11px] font-mono flex items-start gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{docUploadSuccess}</span>
                </div>
              )}

              {/* DRAG & DROP ZONE */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCSV(true);
                }}
                onDragLeave={() => setIsDraggingCSV(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCSV(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleDocumentImport(file);
                  }
                }}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-6 px-4 bg-brand-dark hover:bg-brand-dark/60 transition-all cursor-pointer text-center group ${
                  isDraggingCSV ? 'border-brand-primary bg-brand-primary/5' : 'border-white/15 hover:border-brand-primary/30'
                }`}
              >
                <input 
                  type="file" 
                  accept=".csv,.txt,.docx,.pdf,.xlsx,.xls" 
                  className="hidden" 
                  id="csv-file-uploader"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleDocumentImport(file);
                    }
                  }}
                />
                <label htmlFor="csv-file-uploader" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-6 w-6 text-brand-primary group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-semibold text-white group-hover:text-brand-primary transition-colors block">Import Dataset or Doc</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">Drag & Drop CSV, TXT, DOCX, or PDF files</span>
                </label>
              </div>

              {/* HELPER GUIDE */}
              <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[9px] text-gray-400 space-y-1">
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider block mb-1">CSV Template Layout Example:</span>
                <p className="text-gray-300">Name, Team, Shift, Email</p>
                <p className="text-gray-500">Juan Cruz, Team Targaryen, NAM, j.cruz@callboxinc.com</p>
                <p className="text-gray-500">Ana Santos, House Arryn, APAC, a.santos@callboxinc.com</p>
                <div className="pt-2 border-t border-white/5 text-gray-500">
                  <p>* Non-CSV files (PDFs, DOCX, Excel) are instantly archived to the employee document index logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE ROSTER DIRECTORY GRID */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-white">Interactive Roster Directory</h3>
                  <p className="text-xs text-gray-400">Add users, manage records index, or alter authorized security clearance tags instantly.</p>
                </div>
                <button 
                  title="Refresh lists"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-transform duration-300 hover:rotate-180"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* SEARCH FILTER BAR */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, shift, position, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-10 pr-14 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary font-mono"
                  title="Search employees"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-[10px] font-mono hover:underline cursor-pointer border-none bg-transparent"
                    title="Clear search"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="overflow-auto max-h-[500px] pr-1">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono text-xs border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2">
                    <Search className="h-5 w-5 text-gray-600 animate-pulse" />
                    <span>No matching accounts found for "{searchQuery}"</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-brand-primary pb-2 font-mono uppercase text-[10px]">
                        <th className="py-2.5 sticky top-0 bg-brand-dark/95 backdrop-blur z-10">Employee Name</th>
                        <th className="py-2.5 sticky top-0 bg-brand-dark/95 backdrop-blur z-10">Shift</th>
                        <th className="py-2.5 sticky top-0 bg-brand-dark/95 backdrop-blur z-10">Team</th>
                        <th className="py-2.5 sticky top-0 bg-brand-dark/95 backdrop-blur z-10">Scope</th>
                        <th className="py-2.5 text-right sticky top-0 bg-brand-dark/95 backdrop-blur z-10">Authorize Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/25 flex items-center justify-center text-brand-primary shrink-0 shadow-sm overflow-hidden"
                              title={emp.name}
                            >
                              {emp.avatarUrl ? (
                                <img 
                                  src={emp.avatarUrl} 
                                  alt={emp.name} 
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <DefaultAvatar gender={emp.gender} name={emp.name} className="h-full w-full object-contain p-0.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{emp.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-gray-400">{emp.department}</td>
                        <td className="py-3 text-gray-300">{emp.position}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono tracking-tight ${
                            emp.role === 'Super Admin' ? 'bg-red-500/15 text-red-400 border border-red-500/10' :
                            emp.role === 'HR' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/10' :
                            emp.role === 'Inactive' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10' :
                            'bg-gray-500/10 text-gray-400 border border-white/5'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        {/* Select tool to change roles */}
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2 pr-2">
                            {deletingId === emp.id ? (
                              <div className="flex items-center gap-1.5 min-w-[140px]">
                                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-tight mr-1">Are you sure?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRemoveEmployee(emp.id);
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-[9px] uppercase cursor-pointer border-none"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-mono font-bold text-[9px] uppercase cursor-pointer border border-white/10"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <select
                                  value={emp.role}
                                  onChange={(e) => handleRoleChangeSelect(emp.id, emp.name, e.target.value as UserRole)}
                                  className="bg-brand-dark border border-white/10 rounded p-1.5 text-[10px] text-white uppercase font-mono font-bold focus:outline-none focus:border-brand-primary cursor-pointer h-8"
                                  title="Update employee role"
                                >
                                  <option value="Employee">Employee</option>
                                  <option value="HR">HR Manager</option>
                                  <option value="Inactive">Inactive</option>
                                  <option value="Super Admin">Super Admin</option>
                                </select>
                                
                                {emp.id !== currentUserId && (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingId(emp.id)}
                                    className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer h-8 w-8 flex items-center justify-center shrink-0"
                                    title={`Remove ${emp.name} from roster`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Links active database editor */}
      {activeTab === 'linkManager' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Create Catalog Entry Form */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-5 border border-brand-primary/10 h-fit relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes scanline {
                0% { top: 0%; opacity: 0.1; }
                10% { opacity: 0.95; }
                90% { opacity: 0.95; }
                100% { top: 100%; opacity: 0.1; }
              }
              .scanner-laser-line {
                animation: scanline 1.4s ease-in-out infinite;
              }
            `}} />

            {isScanningLink && (
              <div className="absolute inset-0 bg-brand-dark/95 z-30 p-5 flex flex-col justify-between border border-cyan-500/30 rounded-3xl overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-cyan-400 animate-pulse" />
                      <span className="font-display font-bold text-xs text-white uppercase tracking-wider">System Endpoint Link Registry</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanningLink(false);
                        setIsScanningLinkProcess(false);
                      }}
                      className="text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold bg-white/5 px-2.5 py-1 rounded border border-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Mock live feed area */}
                  <div className="relative aspect-video rounded-xl bg-black border border-cyan-500/20 overflow-hidden flex flex-col items-center justify-center p-3">
                    <div className="absolute inset-x-0 h-[2px] bg-cyan-500/80 shadow-[0_0_10px_#06b6d4] scanner-laser-line z-10" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none opacity-40" />
                    
                    {isScanningLinkProcess ? (
                      <div className="text-center space-y-1.5 z-20">
                        <Camera className="h-6 w-6 text-cyan-400 animate-spin mx-auto opacity-75" />
                        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">Analyzing Endpoint Handshake...</span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 z-20">
                        <Scan className="h-6 w-6 text-gray-500 mx-auto animate-pulse" />
                        <span className="text-[9px] text-gray-400 font-mono max-w-[180px] block text-center">Select an active Davao protocol template below to scan & extract mapping fields:</span>
                      </div>
                    )}
                  </div>

                  {/* Scanner terminal output screen */}
                  <div className="mt-4 bg-black/60 rounded-lg p-2.5 border border-white/5 font-mono text-[9px] text-cyan-400 h-24 overflow-y-auto space-y-1">
                    <p className="text-gray-500">[{new Date().toTimeString().split(' ')[0]}] LIVE_GATEWAY_SCAN v3.2 Active</p>
                    {linkScanStatusLog.map((log, idx) => (
                      <p key={idx} className="text-cyan-300">
                        &gt; {log}
                      </p>
                    ))}
                    {isScanningLinkProcess && (
                      <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-ping ml-1" />
                    )}
                  </div>
                </div>

                {/* Simulated Portal Nodes templates */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">Select System Node to Scan:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 't1', title: 'Davao Real-Time Analytics', url: 'https://davao-performance.callboxinc.com/leaderboard', desc: 'Live agent scoreboard, conversion stats, and hourly target indexes.', category: 'Operations', icon: 'BarChart3', inactive: false },
                      { id: 't2', title: 'Global Team SIP Dialer', url: 'https://dvo-comms.callboxinc.com/voip-dialer', desc: 'High-throughput SIP VoIP dialer connector routing campaign calls.', category: 'Communication', icon: 'PhoneCall', inactive: false },
                      { id: 't3', title: 'HR Pay & Appraisal Gateway', url: 'https://appraisals-dvo.callboxinc.com/my-pay', desc: 'Vault access to monthly timesheets, key metrics, and allowances.', category: 'Human Resources', icon: 'DollarSign', inactive: true },
                      { id: 't4', title: 'IT Helpdesk Support Vault', url: 'https://it-support.callboxinc.com/ticketing-system', desc: 'Hardware, softphone, and account troubleshooting request tickets.', category: 'IT Support', icon: 'Wrench', inactive: true }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        disabled={isScanningLinkProcess}
                        onClick={() => executeLinkScan(tpl.id, tpl.title, tpl.url, tpl.desc, tpl.category as any, tpl.icon, tpl.inactive)}
                        className={`p-2 rounded-xl text-left border text-xs transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                          activeLinkTemplateId === tpl.id 
                            ? 'bg-cyan-500/20 border-cyan-400 text-white' 
                            : 'bg-white/5 border-white/5 hover:border-cyan-500/30 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          <span className="font-semibold text-[10px] truncate">{tpl.title}</span>
                        </div>
                        <span className="font-mono text-[8px] text-cyan-400/80 mt-1 truncate">{tpl.url}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <h3 className="font-display font-semibold text-sm text-white mb-4">Register Central System Link</h3>
            
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateLink} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">TITLE *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Davao Lead Tracker"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  title="New title"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">DESCRIPTION</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outbound operations profiling tool..."
                  className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  title="New description"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-400 font-medium font-mono uppercase tracking-wider text-[10px]">URL *</label>
                  {newUrl.trim() && (
                    <button
                      type="button"
                      disabled={isAnalyzerActive}
                      onClick={handleAutoAnalyzeCustomUrl}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-primary/10 border border-brand-primary/20 hover:border-brand-primary/50 text-brand-primary hover:bg-brand-primary/25 disabled:opacity-40 disabled:pointer-events-none rounded font-mono font-bold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer"
                      title="Trigger automated endpoint scanning"
                    >
                      <Scan className={`h-2.5 w-2.5 ${isAnalyzerActive ? 'animate-spin' : ''}`} /> Scan &amp; Auto-detect Specs
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value);
                      if (scanReport) setScanReport(null);
                    }}
                    placeholder="https://client-portal.callboxinc.com/"
                    className="w-full bg-brand-dark border border-white/10 rounded-lg pl-3 pr-24 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary font-mono text-[11px]"
                    title="New URL"
                  />
                  <button
                    type="button"
                    disabled={!newUrl.trim() || isAnalyzerActive}
                    onClick={handleAutoAnalyzeCustomUrl}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-brand-primary text-brand-dark hover:bg-brand-secondary disabled:bg-white/5 disabled:text-gray-500 font-mono font-bold text-[9px] uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center gap-1 border-none"
                    title="Automated crawler scanner"
                  >
                    {isAnalyzerActive ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-dark animate-ping" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        CRAWL LINK
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated Crawler / Link Scanner Console Activity Feed */}
                {isAnalyzerActive && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-black/85 border border-brand-primary/20 font-mono text-[9px] leading-relaxed text-brand-primary overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-1.5 flex items-center gap-1 text-[8px] text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                      <span>CRAWLER ONLINE</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Scan className="h-3 w-3 text-brand-primary animate-pulse animate-spin" />
                        <span>Initializing Agent Metadata Extractor...</span>
                      </p>
                      <p className="text-gray-400 truncate">&gt; GET {newUrl}</p>
                      <p className="text-gray-500">
                        &gt; Target site: {(() => {
                          try {
                            return new URL(newUrl).hostname || 'extracting...';
                          } catch (e) {
                            return 'resolving...';
                          }
                        })()}
                      </p>
                      <p className="text-brand-primary/80 animate-pulse">&gt; Crawling og:title, og:description, and page shortcuts icon markup...</p>
                    </div>
                  </div>
                )}

                {/* Semantic Scanner Diagnostics & Verification Report Card */}
                {scanReport && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-[10px] font-mono leading-relaxed space-y-2 text-gray-300"
                  >
                    <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                      <span className="text-cyan-400 font-bold tracking-widest uppercase text-[9px] flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Scan Diagnostic Report
                      </span>
                      <span className="text-[9.5px] font-bold text-gray-400">
                        Confidence: <span className="text-emerald-400 font-bold">{scanReport.confidence}%</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9.5px] border-b border-cyan-500/10 pb-2">
                      <div>
                        <span className="text-gray-500">RESOLVED DOMAIN: </span>
                        <span className="text-white font-medium">{scanReport.domain}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">MAPPED IP: </span>
                        <span className="text-cyan-300">{scanReport.ipMock}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">PROTOCOL/PORT: </span>
                        <span className={scanReport.isSecure ? 'text-emerald-400 font-bold' : 'text-yellow-400 font-bold'}>
                          {scanReport.protocol} / SECURE SSL
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">PING LATENCY: </span>
                        <span className="text-cyan-300">{scanReport.latency}ms (Intranet)</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">TLS HANDSHAKE: </span>
                        <span className="text-gray-400 text-[9px]">{scanReport.tlsVersion}</span>
                      </div>
                    </div>

                    {scanReport.extractedKeywords.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-gray-500 text-[9px]">EXTRACTED KEYWORDS:</span>
                        {scanReport.extractedKeywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300 text-[8.5px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                    title="New category"
                  >
                    <option value="Communication">Communication</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Learning">Learning</option>
                    <option value="IT Support">IT Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">ICON *</label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                    title="New icon"
                  >
                    <option value="Mail">Mail Icon</option>
                    <option value="MessageSquare">Chat Box Icon</option>
                    <option value="Video">Video Camera Icon</option>
                    <option value="Database">Database Server Icon</option>
                    <option value="PhoneCall">SIP Dialer Icon</option>
                    <option value="Users">Multi-User Icon</option>
                    <option value="Fingerprint">Shift Fingerprint Icon</option>
                    <option value="Wrench">Wrench Tool Icon</option>
                    <option value="DollarSign">Payslip Cash Icon</option>
                    <option value="GraduationCap font-mono">Graduation Cap Icon</option>
                    <option value="BookOpen">Compliance Book Icon</option>
                    <option value="BarChart3">Analytical Chart Icon</option>
                  </select>
                </div>
              </div>

              {/* INACTIVE ACCESS CONTROL TOGGLE (STYLISH CHECKBOX FLAGGING) */}
              <div className="bg-brand-dark/50 border border-white/5 p-3 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => setNewIsForInactive(!newIsForInactive)}>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white text-[11px] font-sans">Authorize for Inactive Agents</p>
                  <p className="text-[10px] text-gray-400 font-sans">Allows de-provisioned users to see this specific link automatically.</p>
                </div>
                <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-colors ${
                  newIsForInactive ? 'bg-brand-primary border-brand-primary text-brand-dark' : 'border-white/20'
                        }`}>
                  {newIsForInactive && <span className="text-[10px] font-bold">✓</span>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold hover:gold-glow font-mono uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
              >
                Assemble & Commit entry
              </button>
            </form>
          </div>

          {/* Catalog Entries deletion lists */}
          <div className="lg:col-span-3 glass-panel rounded-3xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-white">Active Link Directory Catalog</h3>
            <p className="text-xs text-gray-400">Review integrated applications and safely delete legacy gateways.</p>

            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {links.map((link) => (
                <li key={link.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/20 transition-all">
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="font-mono text-[9px] text-gray-500 uppercase shrink-0">{link.category}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white text-xs truncate max-w-[150px]">{link.title}</p>
                        {link.isForInactive && (
                          <span className="text-[8px] uppercase px-1 font-bold bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/10 shrink-0">
                            INACTIVE OK
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate font-mono">{link.url}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveLink(link.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/15 transition-all cursor-pointer"
                    title={`Decompile ${link.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* Password elevation setup modal */}
      {passwordPromptUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" id="password-elevation-modal">
          <div className="bg-brand-dark border border-brand-primary/20 rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <KeyRound className="h-5 w-5 text-brand-primary" />
              <div>
                <h3 className="font-display font-semibold text-sm text-white">Create Administrative Password</h3>
                <p className="text-[10px] text-gray-400">Security Clearance Level Elevation Required</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                You are assigning <strong className="text-white">{passwordPromptUser.empName}</strong> as a <strong className="text-brand-primary">{passwordPromptUser.role === 'Super Admin' ? 'Super Admin' : 'HR Manager'}</strong>.
              </p>
              <p className="text-[11px] text-gray-400 font-sans">
                A secure password is required for this personnel configuration to authorize entries through the office admin access portal.
              </p>

              <div className="space-y-1.5 pt-1">
                <label className="block text-gray-400 font-mono uppercase tracking-wider text-[9px]">
                  New Password Passphrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MaeSantos789"
                  value={customPasswordInput}
                  onChange={(e) => {
                    setCustomPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full bg-brand-dark/90 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary font-mono"
                  title="New password passphrase"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-[10px] font-mono text-rose-400 animate-pulse">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setPasswordPromptUser(null);
                  setCustomPasswordInput('');
                  setPasswordError('');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono uppercase cursor-pointer transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!customPasswordInput.trim()) {
                    setPasswordError('Password passphrase cannot be empty.');
                    return;
                  }
                  if (customPasswordInput.trim().length < 4) {
                    setPasswordError('Password must meet length criteria (at least 4 characters).');
                    return;
                  }
                  
                  // Complete elevation
                  onUpdateEmployeeRole(passwordPromptUser.empId, passwordPromptUser.role, customPasswordInput.trim());
                  
                  // Reset state
                  setPasswordPromptUser(null);
                  setCustomPasswordInput('');
                  setPasswordError('');
                }}
                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-xs font-mono uppercase cursor-pointer hover:gold-glow transition-all"
              >
                Confirm Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

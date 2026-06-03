/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, AlertCircle, Fingerprint, Sparkles, UserCheck, KeyRound, User, ArrowLeft, Eye, EyeOff, Search 
} from 'lucide-react';
import { Employee } from '../types';
import DefaultAvatar from './DefaultAvatar';

interface LoginScreenProps {
  onLoginSuccess: (user: Employee) => void;
  employees: Employee[];
  onBackToLanding?: () => void;
}

export default function LoginScreen({ onLoginSuccess, employees, onBackToLanding }: LoginScreenProps) {
  const [selectedProfile, setSelectedProfile] = useState<'Employee' | 'Admin' | 'Inactive'>('Employee');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Default fallback values if no matching employee is typed/found yet
  const modePresets = {
    Employee: {
      name: 'OJT Trainee',
      email: 'ojt@callboxinc.com',
      desc: 'Standard employee workspace. Bypasses lock passcode checks—sign in via email or username only.'
    },
    Admin: {
      name: 'Werzkie Tim',
      email: 'admin',
      desc: 'Chief Admin credential. Allows link manager catalog changes and onboarding new users.'
    },
    Inactive: {
      name: 'Jane Dela Cruz',
      email: 'jane.delacruz@callboxinc.com',
      desc: 'Temporarily inactive status. Demonstrates how sandboxed offline users view Designated Links Only.'
    }
  };

  const currentPreset = modePresets[selectedProfile];

  // Sync inputs dynamically on tab changes for rapid testing
  React.useEffect(() => {
    setUsernameOrEmail('');
    setSelectedEmployee(null);
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
    setEmployeeSearch('');
  }, [selectedProfile]);

  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  };

  // Dynamic matched user lookup from state
  const inputClean = usernameOrEmail.trim().toLowerCase();
  
  // Find matched employee from the roster list (prioritizing exact matches, starts-with on prefix/ID, then fuzzy name)
  const matchedUser = (() => {
    if (selectedEmployee) return selectedEmployee;
    if (!inputClean) return null;

    // Prevent live identification/sneak-peek preview when typing/submitting a fully qualified or domain-containing email address
    if (inputClean.includes('@') || inputClean.includes('callbox') || inputClean.endsWith('.com')) {
      return null;
    }

    // 1. Exact match on employee identity ID, or full name
    const exact = employees.find(emp => {
      const emailLower = emp.email.toLowerCase();
      const empIdLower = emp.empId.toLowerCase();
      const nameLower = emp.name.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      return emailPrefix === inputClean || 
             empIdLower === inputClean || 
             nameLower === inputClean;
    });
    if (exact) return exact;

    // 2. StartsWith match on email prefix, or ID code
    const starts = employees.find(emp => {
      const emailLower = emp.email.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      const empIdLower = emp.empId.toLowerCase();
      return emailPrefix.startsWith(inputClean) ||
             empIdLower.startsWith(inputClean);
    });
    if (starts) return starts;

    // 3. Includes match on name
    const partialName = employees.find(emp => {
      const nameLower = emp.name.toLowerCase();
      return nameLower.includes(inputClean);
    });
    return partialName || null;
  })();

  // True if the active user or selected view is highly-privileged (requires passcode configuration)
  const isPrivilegedUser = selectedProfile === 'Admin' || 
                           (matchedUser && (matchedUser.role === 'Super Admin' || matchedUser.role === 'HR'));

  // Find multiple potential matching suggestions as they type the email/name
  const matches = (() => {
    if (!inputClean || inputClean.length < 2 || inputClean.includes('@') || inputClean.endsWith('.com')) return [];
    
    return employees.filter(emp => {
      const emailLower = emp.email.toLowerCase();
      const nameLower = emp.name.toLowerCase();
      const empIdLower = emp.empId.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      
      return emailLower.includes(inputClean) ||
             emailPrefix.startsWith(inputClean) ||
             nameLower.includes(inputClean) ||
             empIdLower.startsWith(inputClean);
    }).slice(0, 4);
  })();

  // Calculate fields to display on the left card
  let displayRole = ''; 
  let displayName = '';
  let displayDesc = '';
  let displayAvatarUrl = '';
  let displayGender: 'Male' | 'Female' | undefined = undefined;

  if (matchedUser) {
    displayRole = matchedUser.role === 'Super Admin' ? 'Admin' : (matchedUser.role as any);
    displayName = matchedUser.name;
    displayDesc = `${matchedUser.position} • ${matchedUser.department}`;
    displayAvatarUrl = matchedUser.avatarUrl || '';
    displayGender = matchedUser.gender;
  } else if (selectedProfile === 'Inactive') {
    displayRole = 'Inactive';
    displayName = 'Anonymous Guest';
    displayDesc = 'Sandboxed Viewer State';
    displayAvatarUrl = '';
  } else if (usernameOrEmail.trim() !== '') {
    // Input contains text but does not match any single user (e.g. typing a full email)
    displayRole = selectedProfile;
    displayName = 'Credentials Loaded';
    displayDesc = 'Click "Access Portal" to submit authentication.';
    displayAvatarUrl = '';
  } else {
    // Entirely blank when there is no email input
    displayRole = '';
    displayName = '';
    displayDesc = '';
    displayAvatarUrl = '';
  }

  // Generate initials for the textual avatar profile badge (strictly removing the camera photo URLs)
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().replaceAll(/[^a-zA-Z\s]/g, '').split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'CB';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const input = usernameOrEmail.trim().toLowerCase();

    if (!input && selectedProfile !== 'Inactive') {
      setErrorMessage('Please provide an Office Email address or Username.');
      return;
    }

    setIsAuthorizing(true);

    setTimeout(() => {
      // 1. Direct inactive view access simulation
      if (selectedProfile === 'Inactive') {
        const anonymousInactiveUser: Employee = {
          id: 'inactive-anonymous-node',
          name: 'Anonymous Guest',
          email: 'guest@callboxinc.com',
          position: 'Inactive Viewer',
          department: 'Public Area',
          role: 'Inactive',
          avatarUrl: '', // no photo, pure anonymous symbol
          empId: 'INACTIVE-VIEW',
          joinedDate: new Date().toISOString().split('T')[0],
          gender: 'Male'
        };
        onLoginSuccess(anonymousInactiveUser);
        setIsAuthorizing(false);
        return;
      }

      // 2. High privilege verification (Super Admin or HR) with passcode check
      const lookupUser = matchedUser || employees.find(emp => {
        const emailLower = emp.email.toLowerCase();
        const empIdLower = emp.empId.toLowerCase();
        const nameLower = emp.name.toLowerCase();
        return emailLower === input || 
               emailLower.split('@')[0] === input || 
               empIdLower === input || 
               nameLower === input ||
               nameLower.includes(input);
      });

      if (lookupUser && (lookupUser.role === 'Super Admin' || lookupUser.role === 'HR')) {
        const expectedPassword = lookupUser.password || 'admin123';
        if (password.trim() !== expectedPassword) {
          setErrorMessage(`Clearance mismatch. Passcode for ${lookupUser.role} of ${lookupUser.name} is invalid.`);
          setIsAuthorizing(false);
          return;
        }
        onLoginSuccess(lookupUser);
        setIsAuthorizing(false);
        return;
      }

      // 3. Generic/Default Admin fallback
      if (input === 'admin' || input === 'admin@callboxinc.com' || selectedProfile === 'Admin') {
        if (password.trim() !== 'admin123') {
          setErrorMessage('Credential mismatch. Secure admin passcode rejected.');
          setIsAuthorizing(false);
          return;
        }
        const adminUser = employees.find(emp => emp.role === 'Super Admin') || employees[0];
        onLoginSuccess(adminUser);
        setIsAuthorizing(false);
        return;
      }

      // 4. Standard lookups on email or username (or starting with username)
      if (lookupUser) {
        onLoginSuccess(lookupUser);
      } else {
        // Only registered employee accounts are allowed to enter
        setErrorMessage('Access Denied: Your email or username is not registered in the system roster. Only accounts pre-configured by an Admin or HR can access this portal.');
        setIsAuthorizing(false);
        return;
      }
      setIsAuthorizing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in" id="portal-login-screen">
      
      {/* Absolute floating ambient backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/15 rounded-full blur-[160px] pointer-events-none" />

      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-4 sm:left-8 z-20 flex items-center gap-2 text-[11px] font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-md group"
          title="Back to Landing Page"
          id="login-back-to-landing-btn"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-brand-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Core Branding Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/25 text-brand-primary mb-4 gold-glow">
            <Fingerprint className="h-7 w-7 animate-pulse" />
          </div>
          
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mb-1">
            CALLBOX <span className="text-brand-primary">DAVAO</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" /> SecOps Authorized Portal Gateway
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 border border-white/5">
          
          <div className="border-b border-white/5 pb-4">
            <h2 className="font-display font-bold text-lg text-white">Office Access Portals</h2>
            <p className="text-xs text-gray-400 mt-1">Select one of the channels below to easily simulate standard user clearance states:</p>
          </div>

          {/* Three Channel Tabs Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="portal-channel-tabs">
            {[
              { key: 'Employee', label: 'Employee Portal', sub: 'Standard Workspaces' },
              { key: 'Admin', label: 'Admin Access', sub: 'Systems Governance' },
              { key: 'Inactive', label: 'Inactive View', sub: 'Limited Links sandbox' }
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedProfile(opt.key as any)}
                className={`p-3.5 rounded-2xl text-left border relative transition-all duration-300 cursor-pointer ${
                  selectedProfile === opt.key 
                    ? 'bg-brand-primary/10 border-brand-primary gold-glow scale-[1.02]' 
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
                title={`Switch to ${opt.label}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase font-display">{opt.label}</span>
                  {selectedProfile === opt.key && (
                    <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-sans leading-snug">{opt.sub}</p>
              </button>
            ))}
          </div>

          {/* Form Error popovers */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Core Login and Preview layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-2">
            
            {selectedProfile === 'Employee' ? (
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch animate-fade-in" id="employee-login-portal-section">
                
                {/* Left Preview card - Shows dynamic identifying card based on currently typed email */}
                <div className="md:col-span-5 p-5 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[180px]">
                  {displayName ? (
                    <>
                      <div 
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/30 flex items-center justify-center text-brand-primary gold-glow shadow-md overflow-hidden animate-fade-in"
                        id="login-profile-badge"
                      >
                        {displayAvatarUrl ? (
                          <img 
                            src={displayAvatarUrl} 
                            alt={displayName} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <DefaultAvatar gender={displayGender} name={displayName} className="h-full w-full object-contain p-1" />
                        )}
                      </div>
                      
                      <div className="animate-fade-in">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/20">
                          Employee
                        </span>
                        <p className="font-display font-bold text-sm text-white mt-1.5">{displayName}</p>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-sans">{displayDesc}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2.5 py-6 animate-fade-in">
                      <div className="h-14 w-14 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-600">
                        <User className="h-6 w-6 stroke-1 animate-pulse" />
                      </div>
                      <p className="text-[11px] font-mono text-gray-500 max-w-[140px] leading-relaxed">
                        Please enter your corporate email to authenticate
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Form Inputs */}
                <form className="md:col-span-7 space-y-5 text-xs font-sans flex flex-col justify-center" onSubmit={handleLoginSubmit}>
                  <div>
                    <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                      Office Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ojt@callboxinc.com or 'ojt'"
                        value={usernameOrEmail}
                        onChange={(e) => {
                          setUsernameOrEmail(e.target.value);
                          setSelectedEmployee(null);
                        }}
                        disabled={isAuthorizing}
                        className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary disabled:opacity-50 font-mono text-[11px]"
                        title="User identity parameter"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>Required Domain: <strong className="text-brand-primary">@callboxinc.com</strong></span>
                      <span>No password needed for employees</span>
                    </div>

                    {/* Dynamic Auto-suggestions of matching employees under typing */}
                    {matches.length > 0 && (
                      <div className="mt-3 p-2.5 bg-[#111827]/60 border border-brand-primary/10 rounded-xl space-y-1.5 animate-fade-in text-[10px]">
                        <p className="text-gray-500 font-mono uppercase tracking-wider text-[9px]">Matched Active Profiles:</p>
                        <div className="flex flex-wrap gap-2">
                          {matches.map(emp => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => {
                                playBeep(1100, 0.08);
                                setUsernameOrEmail(emp.email);
                                setSelectedEmployee(emp);
                              }}
                              className="px-2 py-1 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span className="w-1 h-1 rounded-full bg-brand-primary animate-pulse"></span>
                              <span>{emp.name} ({emp.email.split('@')[0]})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 border-none cursor-pointer mt-2"
                  >
                    {isAuthorizing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                        <span>Configuring Shell Environment...</span>
                      </>
                    ) : (
                      'Access Portal as Employee'
                    )}
                  </button>
                </form>

              </div>
            ) : selectedProfile === 'Admin' ? (
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in" id="admin-login-portal-section">
                
                {/* Available Admins list selection */}
                <div className="md:col-span-5 space-y-3 flex flex-col justify-center">
                  <label className="block text-gray-400 font-medium font-mono uppercase tracking-wider text-[10px]">
                    Step 1: Select Admin Account
                  </label>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {employees.filter(emp => emp.role === 'Super Admin' || emp.role === 'HR').map(emp => {
                      const isSelected = selectedEmployee?.id === emp.id || 
                                         (!selectedEmployee && emp.role === 'Super Admin' && usernameOrEmail === '');
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            playBeep(1100, 0.08);
                            setSelectedEmployee(emp);
                            setUsernameOrEmail(emp.email);
                          }}
                          onMouseEnter={() => {
                            if (!isSelected) {
                              playBeep(1100, 0.05);
                              setSelectedEmployee(emp);
                              setUsernameOrEmail(emp.email);
                            }
                          }}
                          onFocus={() => {
                            if (!isSelected) {
                              playBeep(1100, 0.05);
                              setSelectedEmployee(emp);
                              setUsernameOrEmail(emp.email);
                            }
                          }}
                          className={`w-full p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                            isSelected 
                              ? 'bg-brand-primary/10 border-brand-primary/40' 
                              : 'bg-[#111827]/40 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-[9px] uppercase shrink-0 overflow-hidden">
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
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-white truncate">
                              {emp.name}
                            </p>
                            <span className="inline-block px-1.5 py-0.2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[8px] font-mono rounded mt-0.5 uppercase tracking-wide">
                              {emp.role}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Password/Verification Form */}
                <form className="md:col-span-7 space-y-4 text-xs font-sans flex flex-col justify-center" onSubmit={handleLoginSubmit}>
                  <div>
                    <span className="block text-gray-400 font-medium mb-1 font-mono uppercase tracking-wider text-[10px]">Activated Identity</span>
                    <p className="text-white text-xs font-semibold mb-3">
                      {selectedEmployee ? selectedEmployee.name : employees.filter(emp => emp.role === 'Super Admin')[0]?.name || 'Werzkie Tim'}
                    </p>
                    
                    <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                      Step 2: Enter Authorization Passcode
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter passcode"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isAuthorizing}
                        className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary disabled:opacity-50 font-mono text-[11px]"
                        title="Administrative Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors cursor-pointer mr-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 border-none cursor-pointer mt-2"
                  >
                    {isAuthorizing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                        <span>Configuring Shell Environment...</span>
                      </>
                    ) : (
                      'Verify Clearance Passcode'
                    )}
                  </button>
                </form>

              </div>
            ) : (
              <div className="md:col-span-12 space-y-4 animate-fade-in text-center py-6 flex flex-col items-center">
                <div className="p-5 max-w-lg rounded-2xl border border-yellow-500/15 bg-yellow-500/5 text-yellow-500 font-sans space-y-2 leading-relaxed text-left">
                  <p className="font-semibold text-white font-display text-sm">Sandboxed Inactive Portal</p>
                  <p className="text-xs text-gray-300">
                    Simulates a deactivated or offline employee account clearance state. In this mode, users are restricted to viewing <strong className="text-brand-accent">Designated Links Only</strong>.
                  </p>
                  <p className="text-[11px] text-gray-400 italic">
                    No usernames, passwords, or credentials required—simply click beneath to check active link views.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  disabled={isAuthorizing}
                  className="w-full max-w-sm py-3.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 border-none cursor-pointer mt-2"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                      <span>Configuring Shell Environment...</span>
                    </>
                  ) : (
                    'Access Portal as Inactive Guest'
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Interactive hints */}
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center gap-2.5 text-[10px] text-gray-400">
            <UserCheck className="h-4 w-4 text-brand-primary shrink-0" />
            <span>
              {selectedProfile === 'Employee' 
                ? 'Try entering your custom username or email. Central roster credentials authorize instantly without passphrase prompts.'
                : selectedProfile === 'Admin'
                ? 'Access chief systems hub management tools by keying in "admin" or register standard profiles inside the administration panel.'
                : 'Simulate temporarily deactivated employees to test isolated workspace clearances.'
              }
            </span>
          </div>

        </div>
      </div>

      <div className="mt-8 text-center text-[10px] font-mono text-gray-600">
        <span>Protected by Callbox Davao Enterprise Security Firewall. Authorized Personnel Only.</span>
      </div>
    </div>
  );
}

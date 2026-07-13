/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, AlertCircle, Fingerprint, Sparkles, UserCheck, KeyRound, User, ArrowLeft, Eye, EyeOff, Search, ShieldCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Employee } from '../types';
import CallboxLogo from './CallboxLogo';
import DefaultAvatar from './DefaultAvatar';

interface LoginScreenProps {
  onLoginSuccess: (user: Employee) => void;
  employees: Employee[];
  onBackToLanding?: () => void;
  onSetEmployeePassword?: (empId: string, passcode: string) => void;
  onRequestPasscodeReset?: (empId: string, empName: string, requestedPasscode: string) => void;
  initialErrorMessage?: string;
}

export default function LoginScreen({ 
  onLoginSuccess, 
  employees, 
  onBackToLanding, 
  onSetEmployeePassword,
  onRequestPasscodeReset,
  initialErrorMessage
}: LoginScreenProps) {
  const [selectedProfile, setSelectedProfile] = useState<'Employee' | 'Admin' | 'Inactive'>('Employee');
  const [direction, setDirection] = useState<number>(0);

  const handleSwitchProfile = (profile: 'Employee' | 'Admin' | 'Inactive') => {
    const profileOrder = ['Employee', 'Admin', 'Inactive'];
    const prevIdx = profileOrder.indexOf(selectedProfile);
    const nextIdx = profileOrder.indexOf(profile);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setSelectedProfile(profile);
  };

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage || '');

  React.useEffect(() => {
    if (initialErrorMessage) {
      setErrorMessage(initialErrorMessage);
    }
  }, [initialErrorMessage]);
  const [setupSuccessMessage, setSetupSuccessMessage] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // States for first-time login passcode generation
  const [setupPasscodeUser, setSetupPasscodeUser] = useState<Employee | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);

  // Caps Lock detection state and check handlers
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const checkCapsLockFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent && typeof nativeEvent.getModifierState === 'function') {
      setIsCapsLockOn(nativeEvent.getModifierState('CapsLock'));
    }
  };

  // States for resetting forgotten passcode
  const [isResettingPasscode, setIsResettingPasscode] = useState(false);
  const [resetVerificationId, setResetVerificationId] = useState('');
  const [resetNewPasscode, setResetNewPasscode] = useState('');
  const [resetConfirmPasscode, setResetConfirmPasscode] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetPasscodeToggle, setShowResetPasscodeToggle] = useState(false);

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
    if (selectedProfile === 'Admin') {
      // Find the primary/first admin (Super Admin preferred, then HR)
      const defaultAdmin = employees.find(emp => emp.role === 'Super Admin') || 
                           employees.find(emp => emp.role === 'HR');
      if (defaultAdmin) {
        setSelectedEmployee(defaultAdmin);
        setUsernameOrEmail(defaultAdmin.email);
      } else {
        setSelectedEmployee(null);
        setUsernameOrEmail('');
      }
    } else {
      setSelectedEmployee(null);
      setUsernameOrEmail('');
    }
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
    setEmployeeSearch('');
    setSetupSuccessMessage('');
  }, [selectedProfile, employees]);

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
    if (exact) {
      if (selectedProfile === 'Employee' && (exact.role === 'Super Admin' || exact.role === 'HR')) {
        return null; // Exclude from standard employee matched layout
      }
      return exact;
    }

    // 2. StartsWith match on email prefix, or ID code
    const starts = employees.find(emp => {
      const emailLower = emp.email.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      const empIdLower = emp.empId.toLowerCase();
      return emailPrefix.startsWith(inputClean) ||
             empIdLower.startsWith(inputClean);
    });
    if (starts) {
      if (selectedProfile === 'Employee' && (starts.role === 'Super Admin' || starts.role === 'HR')) {
        return null;
      }
      return starts;
    }

    // 3. Includes match on name
    const partialName = employees.find(emp => {
      const nameLower = emp.name.toLowerCase();
      return nameLower.includes(inputClean);
    });
    if (partialName) {
      if (selectedProfile === 'Employee' && (partialName.role === 'Super Admin' || partialName.role === 'HR')) {
        return null;
      }
      return partialName;
    }
    return null;
  })();

  // Check if they entered/selected an admin or HR account in the Employee Portal to guide them
  const matchedPromotedUser = (() => {
    if (!inputClean) return null;
    return employees.find(emp => {
      const emailLower = emp.email.toLowerCase();
      const splittedEmail = emailLower.split('@')[0];
      const nameLower = emp.name.toLowerCase();
      const empIdLower = emp.empId.toLowerCase();
      
      const isMatch = emailLower === inputClean || 
                      splittedEmail === inputClean ||
                      empIdLower === inputClean ||
                      nameLower === inputClean;
                      
      return isMatch && (emp.role === 'Super Admin' || emp.role === 'HR');
    });
  })();

  // Robust check to see if we have ANY registered employee matched for passcode field display
  const matchedEmployeeForPasscode = (() => {
    if (selectedEmployee) {
      if (selectedEmployee.role === 'Super Admin' || selectedEmployee.role === 'HR') return null;
      return selectedEmployee;
    }
    if (!inputClean) return null;
    return employees.find(emp => {
      if (emp.role === 'Super Admin' || emp.role === 'HR') return false;
      const emailLower = emp.email.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      const empIdLower = emp.empId.toLowerCase();
      const nameLower = emp.name.toLowerCase();
      return emailLower === inputClean || 
             emailPrefix === inputClean || 
             empIdLower === inputClean || 
             nameLower === inputClean;
    });
  })();

  // Clean state reset if matched identity becomes invalid
  const isMatched = !!matchedEmployeeForPasscode;
  React.useEffect(() => {
    if (!isMatched) {
      setPassword('');
    }
  }, [isMatched]);

  // True if the active user or selected view is highly-privileged (requires passcode configuration)
  const isPrivilegedUser = selectedProfile === 'Admin' || 
                           (matchedUser && (matchedUser.role === 'Super Admin' || matchedUser.role === 'HR'));

  // Find multiple potential matching suggestions as they type the email/name
  const matches = (() => {
    if (!inputClean || inputClean.length < 2 || inputClean.includes('@') || inputClean.endsWith('.com')) return [];
    
    return employees.filter(emp => {
      // Exclude promoted roles/governance admins if the employee tab is active
      if (selectedProfile === 'Employee' && (emp.role === 'Super Admin' || emp.role === 'HR')) {
        return false;
      }
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

  const handleCreatePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!newPasscode.trim()) {
      setErrorMessage('Passcode cannot be empty.');
      return;
    }
    if (newPasscode.trim().length < 4) {
      setErrorMessage('Passcode must be at least 4 characters long.');
      return;
    }
    if (newPasscode.trim() === 'callbox2026') {
      setErrorMessage('Passcode cannot be the default "callbox2026". Please specify a secure unique custom passcode.');
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setErrorMessage('Passcodes do not match. Please verify your entries.');
      return;
    }

    if (setupPasscodeUser) {
      setIsAuthorizing(true);
      setTimeout(() => {
        const passwordValue = newPasscode.trim();
        // Save passcode
        if (onSetEmployeePassword) {
          onSetEmployeePassword(setupPasscodeUser.id, passwordValue);
        }
        
        // Reset state
        setSetupPasscodeUser(null);
        setNewPasscode('');
        setConfirmPasscode('');
        setIsAuthorizing(false);
        setPassword(''); // Clear default or reset passcode from password field
        setSetupSuccessMessage(`Passcode set successfully for ${setupPasscodeUser.name}. Please enter your new passcode below to login.`);
      }, 1200);
    }
  };

  const handleResetPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    if (!matchedEmployeeForPasscode) {
      setResetError('No active matched employee profile found.');
      return;
    }

    setIsAuthorizing(true);
    setTimeout(() => {
      if (onRequestPasscodeReset) {
        onRequestPasscodeReset(matchedEmployeeForPasscode.id, matchedEmployeeForPasscode.name, 'callbox2026');
      }
      
      setResetSuccess(true);
      setIsAuthorizing(false);
      
      // Return to login after 3.5 seconds
      setTimeout(() => {
        setIsResettingPasscode(false);
        setResetSuccess(false);
        setResetVerificationId('');
        setResetNewPasscode('');
        setResetConfirmPasscode('');
        setResetError('');
      }, 3500);
    }, 1200);
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
        if (selectedProfile === 'Employee') {
          setErrorMessage(`Clearance Level Elevated: ${lookupUser.name} has been promoted to ${lookupUser.role} access level. You do not have to login in standard employee portal—instead select "Admin Access" portal in the security panel above.`);
          setIsAuthorizing(false);
          return;
        }
        const expectedPassword = lookupUser.password || 'admin123';
        const isMaskedRemotePassword = /^\*+$/.test(expectedPassword);

        let isMatch = password.trim() === expectedPassword.trim();
        if (!isMatch && isMaskedRemotePassword) {
          isMatch = password.trim() === 'admin123' || password.trim() === 'callboxdavaoadmin';
        }

        // Support 'callbox2026' default reset password
        if (!isMatch && expectedPassword === 'callbox2026') {
          isMatch = password.trim() === 'callbox2026';
        }

        if (!isMatch) {
          setErrorMessage(`Clearance mismatch. Passcode for ${lookupUser.role} of ${lookupUser.name} is invalid.`);
          setIsAuthorizing(false);
          return;
        }

        // If the HR/Admin's passcode setup is not complete, or they used the default/reset 'callbox2026' passcode, force setup
        if (lookupUser.isPasscodeSetupComplete === false || expectedPassword === 'callbox2026' || password.trim() === 'callbox2026') {
          setSetupPasscodeUser(lookupUser);
          setNewPasscode('');
          setConfirmPasscode('');
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
        // If they don't have a passcode set (newly imported or empty string), prompt for first-time creation
        if (!lookupUser.password || lookupUser.password.trim() === '') {
          setSetupPasscodeUser(lookupUser);
          setNewPasscode('');
          setConfirmPasscode('');
          setIsAuthorizing(false);
          return;
        }

        const expectedPassword = lookupUser.password || 'callbox2026';
        const isMaskedRemotePassword = /^\*+$/.test(expectedPassword);

        let isMatch = password.trim() === expectedPassword.trim();
        if (!isMatch && isMaskedRemotePassword) {
          isMatch = password.trim() === 'callbox2026';
        }

        if (!isMatch) {
          setErrorMessage(`Credential mismatch. The validation passcode for Employee ${lookupUser.name} fails authentication.`);
          setIsAuthorizing(false);
          return;
        }

        // If the user's passcode setup is not complete (newly created CSV or admin passcode reset),
        // or they used the default / reset passcode 'callbox2026', they must configure their own customized passcode first.
        if (lookupUser.isPasscodeSetupComplete === false || expectedPassword === 'callbox2026' || password.trim() === 'callbox2026') {
          setSetupPasscodeUser(lookupUser);
          setNewPasscode('');
          setConfirmPasscode('');
          setIsAuthorizing(false);
          return;
        }

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
    <div className="flex-1 bg-transparent flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in" id="portal-login-screen">
      
      {/* Absolute floating ambient backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/15 rounded-full blur-[160px] pointer-events-none" />

      {onBackToLanding && (
        <motion.button
          onClick={onBackToLanding}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
          className="fixed top-6 left-4 sm:left-8 z-30 flex items-center gap-2 text-[11px] font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-md group"
          title="Back to Landing Page"
          id="login-back-to-landing-btn"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-brand-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </motion.button>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Core Branding Header */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-4">
            <CallboxLogo className="h-12 w-auto text-white filter drop-shadow-[0_0_15px_rgba(255,184,0,0.15)]" caretColor="#FFB800" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/15 rounded-xl text-xs font-mono font-bold text-brand-primary uppercase tracking-widest mb-2 shadow-sm">
            DAVAO NODE GATEWAY
          </div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary animate-pulse" /> SecOps Authorized Portal Gateway
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <motion.div 
          layout="position"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 border border-white/5"
        >
          
          {setupPasscodeUser ? (
            <div className="space-y-6 animate-fade-in p-2">
              <div className="border-b border-white/5 pb-5 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary mb-3 gold-glow">
                  <KeyRound className="h-5 w-5 animate-pulse" />
                </div>
                <h2 className="font-display font-bold text-lg text-white">Setup Login Passcode</h2>
                <p className="text-xs text-gray-300 mt-1">
                  Hi <strong className="text-brand-primary">{setupPasscodeUser.name}</strong>, since your profile was recently registered or imported via CSV, you must configure a secure login passcode first.
                </p>
              </div>

              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleCreatePasscodeSubmit} className="space-y-4 max-w-sm mx-auto text-xs font-sans">
                <div>
                  <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                    Create Account Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                      type={showNewPasscode ? 'text' : 'password'}
                      required
                      placeholder="At least 4 characters"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      onKeyDown={checkCapsLock}
                      onKeyUp={checkCapsLock}
                      onFocus={checkCapsLockFocus}
                      onBlur={() => setIsCapsLockOn(false)}
                      disabled={isAuthorizing}
                      className="w-full bg-brand-dark/95 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary disabled:opacity-50 font-mono text-[11px]"
                      title="New passcode input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                    Confirm New Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                      type={showNewPasscode ? 'text' : 'password'}
                      required
                      placeholder="Verify passcode"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      onKeyDown={checkCapsLock}
                      onKeyUp={checkCapsLock}
                      onFocus={checkCapsLockFocus}
                      onBlur={() => setIsCapsLockOn(false)}
                      disabled={isAuthorizing}
                      className="w-full bg-brand-dark/95 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary disabled:opacity-50 font-mono text-[11px]"
                      title="Confirm passcode input"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isCapsLockOn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-amber-400 flex items-center gap-1.5 font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      <span>Warning: CAPS LOCK is active</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between text-[10px] font-mono select-none">
                  <button
                    type="button"
                    onClick={() => setShowNewPasscode(!showNewPasscode)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                    title={showNewPasscode ? 'Hide characters' : 'Show characters'}
                  >
                    {showNewPasscode ? 'Hide' : 'Show'} Password
                  </button>
                  <span className="text-gray-500">Identity Sync Active</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSetupPasscodeUser(null);
                      setNewPasscode('');
                      setConfirmPasscode('');
                      setErrorMessage('');
                    }}
                    className="py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold font-mono uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer border border-white/5 animate-fade-in"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isAuthorizing}
                    whileHover={!isAuthorizing ? { scale: 1.02 } : undefined}
                    whileTap={!isAuthorizing ? { scale: 0.95 } : undefined}
                    className="py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer font-extrabold"
                  >
                    {isAuthorizing ? (
                      <div className="h-3 w-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save & Log In'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <>
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
              <motion.button
                key={opt.key}
                type="button"
                onClick={() => handleSwitchProfile(opt.key as any)}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 450, damping: 24 }}
                className={`p-3.5 rounded-2xl text-left border relative cursor-pointer overflow-hidden transition-colors duration-300 ${
                  selectedProfile === opt.key 
                    ? 'border-brand-primary/60 shadow-[0_0_12px_rgba(255,215,0,0.06)]' 
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
                title={`Switch to ${opt.label}`}
              >
                {selectedProfile === opt.key && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-brand-primary/10 z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase font-display">{opt.label}</span>
                  {selectedProfile === opt.key && (
                    <motion.span 
                      layoutId="activeTabDot"
                      className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" 
                    />
                  )}
                </div>
                <p className="relative z-10 text-[10px] text-gray-400 font-sans leading-snug">{opt.sub}</p>
              </motion.button>
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

          {/* Passcode setup success notifications */}
          {setupSuccessMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 text-xs font-sans bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start gap-2.5 w-full"
            >
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-300 font-display block">Passcode Saved Successfully!</span>
                <span className="font-mono text-[10px] text-gray-300 leading-normal">{setupSuccessMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Core Login and Preview layout */}
          <div className="relative overflow-hidden w-full pt-2 min-h-[270px]" id="portal-sliding-container">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {selectedProfile === 'Employee' ? (
                <motion.div
                  key="Employee"
                  custom={direction}
                  initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction < 0 ? 120 : -120, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="w-full flex justify-center py-2"
                  id="employee-login-portal-section"
                >
                  {isResettingPasscode && matchedEmployeeForPasscode ? (
                    <form onSubmit={handleResetPasscodeSubmit} className="w-full max-w-sm space-y-4 text-xs font-sans flex flex-col justify-center animate-fade-in">
                      <div className="border-b border-white/5 pb-4 text-center">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary mb-2 gold-glow">
                          <RefreshCw className="h-4.5 w-4.5 animate-spin-slow text-brand-primary" />
                        </div>
                        <h3 className="font-display font-bold text-sm text-white">Reset Secure Passcode</h3>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Verifying identity for <strong className="text-brand-primary">{matchedEmployeeForPasscode.name}</strong>
                        </p>
                      </div>

                      {resetError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 text-[10px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
                          <span>{resetError}</span>
                        </motion.div>
                      )}
                      {resetSuccess ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-center space-y-3 w-full"
                        >
                          <CheckCircle2 className="h-9 w-9 text-amber-400 mx-auto animate-bounce" />
                          <h4 className="font-display font-bold text-sm text-amber-300 uppercase tracking-wide">Reset Request Dispatched!</h4>
                          <p className="text-[10px] text-gray-300 leading-relaxed font-mono">
                            Your request has been filed in the secure governance ledger. Once the Super Admin authorizes it, your passcode will restore to the default <strong className="text-brand-primary">callbox2026</strong>.
                          </p>
                        </motion.div>
                      ) : (
                        <>
                          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 text-center w-full">
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              For security purposes, you can immediately request the Super Admin to reset your workspace passcode.
                            </p>
                            <div className="p-3 bg-brand-dark/50 border border-white/5 rounded-xl font-mono text-[10px] text-left text-gray-400 space-y-1">
                              <div>• Target: <span className="text-white font-semibold">{matchedEmployeeForPasscode.name}</span></div>
                              <div>• Request Type: <span className="text-amber-400 font-semibold font-mono uppercase text-[9px] tracking-wider">Passcode Reset</span></div>
                              <div>• Action Outcome: <span className="text-brand-primary font-semibold">Revert to default (callbox2026)</span></div>
                            </div>
                            <p className="text-[9px] text-[#fbbf24]/95 font-mono italic leading-relaxed">
                              *Upon approval, you will be required to configure a secure custom passcode on your next login attempt.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 w-full">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setIsResettingPasscode(false);
                                setResetError('');
                                setResetVerificationId('');
                                setResetNewPasscode('');
                                setResetConfirmPasscode('');
                              }}
                              className="py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold font-mono uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer border border-white/5"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              type="submit"
                              disabled={isAuthorizing}
                              whileHover={!isAuthorizing ? { scale: 1.02 } : undefined}
                              whileTap={!isAuthorizing ? { scale: 0.95 } : undefined}
                              className="py-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer"
                            >
                              {isAuthorizing ? (
                                <div className="h-3 w-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'Send Request'
                              )}
                            </motion.button>
                          </div>
                        </>
                      )}
                    </form>
                  ) : (
                    <form className="w-full max-w-sm space-y-4 text-xs font-sans flex flex-col justify-center animate-fade-in" onSubmit={handleLoginSubmit}>
                      <div>
                        <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                          Office Email or Username
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 translate-x-2" />
                          <input
                            type="text"
                            required
                            placeholder="Your Company Email"
                            value={usernameOrEmail}
                            onChange={(e) => {
                              setUsernameOrEmail(e.target.value);
                              setSelectedEmployee(null);
                              setSetupSuccessMessage('');
                            }}
                            onKeyDown={checkCapsLock}
                            onKeyUp={checkCapsLock}
                            onFocus={checkCapsLockFocus}
                            onBlur={() => setIsCapsLockOn(false)}
                            disabled={isAuthorizing}
                            className="w-full bg-brand-dark/90 border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary disabled:opacity-50 font-mono text-[11px]"
                            title="User identity parameter"
                          />
                        </div>
                        <AnimatePresence>
                          {isCapsLockOn && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-amber-400 mt-1.5 flex items-center gap-1.5 font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animate-pulse"
                            >
                              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                              <span>Warning: CAPS LOCK is active</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>Required Domain: <strong className="text-brand-primary">@callboxinc.com</strong></span>
                          <span>Identity Sync Active</span>
                        </div>
                      </div>

                      {/* Notice for Promoted Admin/HR accounts trying to use standard employee portal */}
                      {selectedProfile === 'Employee' && matchedPromotedUser && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl text-center space-y-3 w-full"
                        >
                          <ShieldCheck className="h-7 w-7 text-brand-primary mx-auto animate-pulse" />
                          <h4 className="font-display font-bold text-[11px] text-brand-primary uppercase tracking-wider">
                            Elevated Clearance Detected
                          </h4>
                          <p className="text-[10px] text-gray-300 leading-relaxed font-mono">
                            Account <strong className="text-white">{matchedPromotedUser.name}</strong> is promoted to <span className="text-brand-primary font-bold uppercase">[{matchedPromotedUser.role}]</span> clearance.
                          </p>
                          <p className="text-[9px] text-gray-400 font-sans leading-relaxed">
                            You do not need to log in via the Employee Portal. Please use the secure administrative panel instead.
                          </p>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              handleSwitchProfile('Admin');
                              setSelectedEmployee(matchedPromotedUser);
                              setUsernameOrEmail(matchedPromotedUser.email);
                            }}
                            className="w-full py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-mono font-bold uppercase tracking-wider text-[9px] rounded-xl transition-all cursor-pointer border-none"
                          >
                            Switch to Admin Access
                          </motion.button>
                        </motion.div>
                      )}

                      {/* Password Input for Employees (Hidden until email/identity matches a user in the roster) */}
                      {matchedEmployeeForPasscode ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4 pt-1 overflow-hidden"
                        >
                          <div>
                            <label className="block text-gray-400 font-medium mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                              Access Passcode / Password
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
                                title="Employee password field"
                                onKeyDown={checkCapsLock}
                                onKeyUp={checkCapsLock}
                                onFocus={checkCapsLockFocus}
                                onBlur={() => setIsCapsLockOn(false)}
                              />
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors cursor-pointer mr-1"
                                title={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </motion.button>
                            </div>
                            <AnimatePresence>
                              {isCapsLockOn && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-amber-400 mt-1.5 flex items-center gap-1.5 font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animated animate-pulse"
                                >
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                                  <span>Warning: CAPS LOCK is active</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                              <span>Secure validation enabled</span>
                              <span>Default Passcode: <strong className="text-brand-primary">callbox2026</strong></span>
                            </div>
                            
                            {/* Forgot Passcode Button Trigger */}
                            <div className="mt-2 text-right">
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setIsResettingPasscode(true);
                                  setResetError('');
                                  setResetVerificationId('');
                                  setResetNewPasscode('');
                                  setResetConfirmPasscode('');
                                }}
                                className="text-brand-accent hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1 text-[10px] font-mono leading-none font-semibold hover:underline"
                                title="Recover forgotten passcode"
                              >
                                Forgot Passcode?
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      <motion.button
                        type="submit"
                        disabled={isAuthorizing || !matchedEmployeeForPasscode}
                        whileTap={(!isAuthorizing && matchedEmployeeForPasscode) ? { scale: 0.97 } : undefined}
                        className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary disabled:bg-white/5 disabled:hover:bg-white/5 disabled:text-gray-500 text-brand-dark hover:gold-glow font-bold font-mono uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none border-none cursor-pointer mt-2"
                      >
                        {isAuthorizing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                            <span>Configuring Shell Environment...</span>
                          </>
                        ) : !matchedEmployeeForPasscode ? (
                          'Identify Office Profile...'
                        ) : (
                          'Access Portal as Employee'
                        )}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              ) : selectedProfile === 'Admin' ? (
                <motion.div
                  key="Admin"
                  custom={direction}
                  initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction < 0 ? 120 : -120, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 py-2"
                  id="admin-login-portal-section"
                >
                  {/* Available Admins list selection */}
                  <div className="md:col-span-5 space-y-3 flex flex-col justify-center">
                    <label className="block text-gray-400 font-medium font-mono uppercase tracking-wider text-[10px]">
                      Step 1: Select Admin Account
                    </label>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {employees.filter(emp => emp.role === 'Super Admin' || emp.role === 'HR').map(emp => {
                        const isSelected = selectedEmployee?.id === emp.id;
                        return (
                          <motion.button
                            key={emp.id}
                            type="button"
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              playBeep(1100, 0.08);
                              setSelectedEmployee(emp);
                              setUsernameOrEmail(emp.email);
                            }}
                            onMouseEnter={() => {
                              if (!isSelected) {
                                playBeep(1100, 0.05);
                              }
                            }}
                            onFocus={() => {
                              if (!isSelected) {
                                playBeep(1100, 0.05);
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
                          </motion.button>
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
                          onKeyDown={checkCapsLock}
                          onKeyUp={checkCapsLock}
                          onFocus={checkCapsLockFocus}
                          onBlur={() => setIsCapsLockOn(false)}
                        />
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors cursor-pointer mr-1"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {isCapsLockOn && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-amber-400 mt-2 flex items-center gap-1.5 font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animate-pulse"
                          >
                            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                            <span>Warning: CAPS LOCK is active</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isAuthorizing}
                      whileHover={!isAuthorizing ? { scale: 1.02 } : undefined}
                      whileTap={!isAuthorizing ? { scale: 0.95 } : undefined}
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
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="Inactive"
                  custom={direction}
                  initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction < 0 ? 120 : -120, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="w-full space-y-4 text-center py-2 flex flex-col items-center"
                >
                  <div className="p-5 max-w-lg rounded-2xl border border-yellow-500/15 bg-yellow-500/5 text-yellow-500 font-sans space-y-2 leading-relaxed text-left">
                    <p className="font-semibold text-white font-display text-sm">Sandboxed Inactive Portal</p>
                    <p className="text-xs text-gray-300">
                      Simulates a deactivated or offline employee account clearance state. In this mode, users are restricted to viewing <strong className="text-brand-accent">Designated Links Only</strong>.
                    </p>
                    <p className="text-[11px] text-gray-400 italic">
                      No usernames, passwords, or credentials required—simply click beneath to check active link views.
                    </p>
                  </div>
                  
                  <motion.button
                    type="button"
                    onClick={() => handleLoginSubmit()}
                    disabled={isAuthorizing}
                    whileHover={!isAuthorizing ? { scale: 1.02 } : undefined}
                    whileTap={!isAuthorizing ? { scale: 0.95 } : undefined}
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
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
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
          </>
          )}

        </motion.div>
      </div>

      <div className="mt-8 text-center text-[10px] font-mono text-gray-600">
        <span>Protected by Callbox Davao Enterprise Security Firewall. Authorized Personnel Only.</span>
      </div>
    </div>
  );
}

import React from 'react';

interface DefaultAvatarProps {
  gender?: 'Male' | 'Female';
  className?: string;
  name?: string;
}

export default function DefaultAvatar({ gender, className = "h-[85%] w-[85%]", name }: DefaultAvatarProps) {
  // Simple heuristic if gender is not specified
  let userGender: 'Male' | 'Female' = gender || 'Male';
  if (!gender && name) {
    const lowercaseName = name.toLowerCase();
    if (
      lowercaseName.includes('mae') || 
      lowercaseName.includes('jane') || 
      lowercaseName.includes('santos') || 
      lowercaseName.includes('delacruz') || 
      lowercaseName.includes('tim')
    ) {
      userGender = 'Female';
    }
  }

  if (userGender === 'Female') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${className} text-brand-primary`}
      >
        {/* Hair back */}
        <path d="M26 40C26 23 37 12 50 12C63 12 74 23 74 40C74 53 71 61 71 61L66 58C66 58 67 47 67 40C67 29 59 22 50 22C41 22 33 29 33 40C33 47 34 58 34 58L29 61C29 61 26 53 26 40Z" fill="#1C1B1F" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Ears */}
        <path d="M31 43C28 43 28 49 31 49" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M69 43C72 43 72 49 69 49" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Face/Head */}
        <path d="M33 40C33 40 33 55 50 55C67 55 67 40 67 40" fill="#1C1B1F" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Nose (minimal L-shape) */}
        <path d="M49 43V47H52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Neck */}
        <path d="M44 54V62H56V54" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
        {/* Clothes/Shoulders (Blazer V shape) */}
        <path d="M22 84C25 74 33 66 42 63L45 74M78 84C75 74 67 66 58 63L55 74" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M45 74H55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M38 65L50 84L62 65" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} text-brand-primary`}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3.5" fill="#1C1B1F"/>
      {/* Hair */}
      <path d="M34 38C34 26 42 20 50 20C58 20 66 26 66 38" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M34 34C34 34 40 28 50 31C60 34 66 34 66 34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Ears */}
      <path d="M33 41C31 41 31 45 33 45" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M67 41C69 41 69 45 67 45" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Face */}
      <path d="M35 38V44C35 52 41 57 50 57C59 57 65 52 65 44V38" fill="#1C1B1F" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Neck */}
      <path d="M45 56V62H55V56" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Collar & Jacket */}
      <path d="M30 82C34 72 41 65 50 65C59 65 66 72 70 82" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Shirt V & Tie */}
      <path d="M45 62L50 71L55 62" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 71H52L53 82H47L48 71Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

import React from 'react';

interface CallboxLogoProps {
  className?: string;
  caretColor?: string;
  textColor?: string;
}

export default function CallboxLogo({ 
  className = "h-8 w-auto", 
  caretColor = "#FFB800", 
  textColor = "currentColor" 
}: CallboxLogoProps) {
  return (
    <svg 
      viewBox="0 -16 205 76" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      id="callbox-vector-logo-svg"
    >
      <defs>
        <linearGradient id="callbox-caret-gradient" x1="133" y1="-11" x2="163" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE000" />
          <stop offset="40%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
        <filter id="callbox-caret-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#FFB800" floodOpacity="0.75" />
        </filter>
      </defs>
      {/* 'c' */}
      <path 
        d="M 36,22 A 13,13 0 1,0 36,48" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      {/* 'a' */}
      <path 
        d="M 69,22 L 69,48 M 69,35 A 13,13 0 1,0 69,36" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* 'l' */}
      <path 
        d="M 81,12 L 81,48" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      {/* 'l' */}
      <path 
        d="M 93,12 L 93,48" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      {/* 'b' */}
      <path 
        d="M 105,12 L 105,48 M 105,35 A 13,13 0 1,1 105,36" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* 'o' */}
      <circle 
        cx="148" 
        cy="35" 
        r="13" 
        stroke={textColor} 
        strokeWidth="7" 
      />
      {/* 'caret' above 'o' */}
      <path 
        d="M 133,3 L 148,-11 L 163,3" 
        stroke="url(#callbox-caret-gradient)" 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#callbox-caret-glow)"
      />
      {/* 'x' */}
      <path 
        d="M 175,22 L 191,48 M 191,22 L 175,48" 
        stroke={textColor} 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

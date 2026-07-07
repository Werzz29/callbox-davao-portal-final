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
      viewBox="0 0 205 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      id="callbox-vector-logo-svg"
    >
      {/* 'c' */}
      <path 
        d="M 36,22 A 13,13 0 1,0 36,48" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      {/* 'a' */}
      <path 
        d="M 69,22 L 69,48 M 69,35 A 13,13 0 1,0 69,36" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* 'l' */}
      <path 
        d="M 81,12 L 81,48" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      {/* 'l' */}
      <path 
        d="M 93,12 L 93,48" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      {/* 'b' */}
      <path 
        d="M 105,12 L 105,48 M 105,35 A 13,13 0 1,1 105,36" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* 'o' */}
      <circle 
        cx="148" 
        cy="35" 
        r="13" 
        stroke={textColor} 
        strokeWidth="5.5" 
      />
      {/* 'caret' above 'o' */}
      <path 
        d="M 136,13 L 148,2 L 160,13" 
        stroke={caretColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* 'x' */}
      <path 
        d="M 175,22 L 191,48 M 191,22 L 175,48" 
        stroke={textColor} 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

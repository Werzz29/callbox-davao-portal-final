import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Target, Zap, MousePointer, Settings, X, Activity, ShieldCheck } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export type CursorPreset = 'sentinel' | 'nova' | 'reticle' | 'minimal';
export type CursorColor = '#FFC72C' | '#00F0FF' | '#FF3B30' | '#34C759';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState<'default' | 'button' | 'input' | 'danger'>('default');
  const [hoverText, setHoverText] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default true, verify in useEffect
  
  // Custom HUD and config states
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_cursor_enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });
  const [preset, setPreset] = useState<CursorPreset>(() => {
    try {
      const saved = localStorage.getItem('cb_cursor_preset');
      return (saved as CursorPreset) || 'sentinel';
    } catch {
      return 'sentinel';
    }
  });
  const [cursorColor, setCursorColor] = useState<CursorColor>(() => {
    try {
      const saved = localStorage.getItem('cb_cursor_color');
      return (saved as CursorColor) || '#FFC72C';
    } catch {
      return '#FFC72C';
    }
  });
  const [sparklesEnabled, setSparklesEnabled] = useState(true);
  const [hudOpen, setHudOpen] = useState(false);

  // Physics Trailing & Velocity States
  const [velocity, setVelocity] = useState(0);
  const [moveAngle, setMoveAngle] = useState(0);
  const [hoveredElementTag, setHoveredElementTag] = useState<string>('NONE');
  
  // Click reaction states
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Store previous values for velocity calculation
  const lastCoords = useRef({ x: 0, y: 0, time: Date.now() });
  const mouseStoppedTimer = useRef<number | null>(null);

  useEffect(() => {
    // Check if device matches fine pointers (mouse) vs coarse (touch screens)
    const checkCoarsePointer = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsMobile(!hasFinePointer);
    };

    checkCoarsePointer();
    window.addEventListener('resize', checkCoarsePointer);
    
    // Add dynamic global utility class to hide default cursor when HUD is enabled
    const applyGlobalCursorStyle = () => {
      if (isEnabled && !isMobile) {
        document.documentElement.classList.add('custom-cursor-active');
        
        // Dynamic styling injection to suppress default cursor safely across DOM
        let styleSheet = document.getElementById('custom-cursor-global-styles');
        if (!styleSheet) {
          styleSheet = document.createElement('style');
          styleSheet.id = 'custom-cursor-global-styles';
          document.head.appendChild(styleSheet);
        }
        styleSheet.innerHTML = `
          .custom-cursor-active,
          .custom-cursor-active body,
          .custom-cursor-active button,
          .custom-cursor-active a,
          .custom-cursor-active [role="button"],
          .custom-cursor-active .cursor-pointer,
          .custom-cursor-active input,
          .custom-cursor-active textarea,
          .custom-cursor-active [type="submit"] {
            cursor: none !important;
          }
        `;
      } else {
        document.documentElement.classList.remove('custom-cursor-active');
        const styleSheet = document.getElementById('custom-cursor-global-styles');
        if (styleSheet) {
          styleSheet.remove();
        }
      }
    };
    
    applyGlobalCursorStyle();

    return () => {
      window.removeEventListener('resize', checkCoarsePointer);
      document.documentElement.classList.remove('custom-cursor-active');
      const styleSheet = document.getElementById('custom-cursor-global-styles');
      if (styleSheet) styleSheet.remove();
    };
  }, [isEnabled, isMobile]);

  // Synchronize dynamic customizations to local storage
  useEffect(() => {
    localStorage.setItem('cb_cursor_enabled', String(isEnabled));
    localStorage.setItem('cb_cursor_preset', preset);
    localStorage.setItem('cb_cursor_color', cursorColor);
  }, [isEnabled, preset, cursorColor]);

  useEffect(() => {
    if (isMobile || !isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      const { clientX, clientY } = e;
      setPosition({ x: clientX, y: clientY });

      // Calculate vector velocity and skew angles
      const now = Date.now();
      const dt = now - lastCoords.current.time || 1;
      const dx = clientX - lastCoords.current.x;
      const dy = clientY - lastCoords.current.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt; // pixels per millisecond
      
      // Compute direct angle of rotation (movement vector direction)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Dampen velocity to prevent wild scaling
      const smoothSpeed = Math.min(speed * 8, 2.5);
      
      setVelocity(smoothSpeed);
      setMoveAngle(angle);

      lastCoords.current = { x: clientX, y: clientY, time: now };

      // Set cooldown to ease velocity back to 0 when stationary
      if (mouseStoppedTimer.current) window.clearTimeout(mouseStoppedTimer.current);
      mouseStoppedTimer.current = window.setTimeout(() => {
        setVelocity(0);
      }, 100);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setVelocity(0);
    };

    // Global event delegation for interactive visual triggers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Extract details for telemetry display safely without causing TS static type-narrowing issues
      const rawClassName = (target as any).className;
      const classNameStr = typeof rawClassName === 'string' 
        ? rawClassName 
        : (rawClassName && typeof rawClassName === 'object' && 'baseVal' in rawClassName) 
          ? (rawClassName.baseVal as string) 
          : '';
      setHoveredElementTag(target.tagName + (target.id ? `#${target.id}` : classNameStr ? `.${classNameStr.split(' ')[0]}` : ''));

      const interactive = target.closest('button, a, [role="button"], .cursor-pointer, input, textarea, select');
      if (interactive) {
        setIsHovered(true);
        
        // Extract descriptive labels
        const ariaLabel = interactive.getAttribute('aria-label');
        const titleText = interactive.getAttribute('title');
        const textLabel = interactive.getAttribute('data-cursor-label');
        
        if (textLabel) {
          setHoverText(textLabel);
        } else if (titleText && titleText.length < 20) {
          setHoverText(titleText);
        } else if (interactive.tagName === 'INPUT' || interactive.tagName === 'TEXTAREA') {
          setHoverText('TYPE');
        } else {
          setHoverText('LOCK-ON');
        }

        // Assess specific hover styles
        if (interactive.tagName === 'INPUT' || interactive.tagName === 'TEXTAREA') {
          setHoverType('input');
        } else if (
          interactive.classList.contains('text-rose-500') ||
          interactive.classList.contains('bg-rose-500') ||
          interactive.classList.contains('bg-rose-600') ||
          interactive.id?.toLowerCase().includes('delete') ||
          interactive.id?.toLowerCase().includes('cancel') ||
          interactive.id?.toLowerCase().includes('logout')
        ) {
          setHoverType('danger');
          setHoverText('DANGER');
        } else {
          setHoverType('button');
        }
      } else {
        setIsHovered(false);
        setHoverType('default');
        setHoverText('');
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const { clientX, clientY } = e;

      // Create a localized vector expand ripple
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY
      };
      setRipples(prev => [...prev, newRipple]);

      // Spawn mechanical kinetic particles
      if (sparklesEnabled) {
        const spawned: Particle[] = [];
        const numParticles = preset === 'nova' ? 10 : 6;
        for (let i = 0; i < numParticles; i++) {
          const particleAngle = (i * (360 / numParticles)) + (Math.random() * 30);
          const particleSpeed = 1.2 + Math.random() * 2.8;
          spawned.push({
            id: Date.now() + Math.random() * 1000 + i,
            x: clientX,
            y: clientY,
            angle: particleAngle,
            speed: particleSpeed,
            color: cursorColor,
            size: 3 + Math.random() * 4
          });
        }
        setParticles(prev => [...prev, ...spawned]);
      }
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mouseStoppedTimer.current) window.clearTimeout(mouseStoppedTimer.current);
    };
  }, [isMobile, isEnabled, sparklesEnabled, cursorColor, preset, isVisible]);

  // Handle particle drift physics updates
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        return prev
          .map(p => {
            const rad = p.angle * (Math.PI / 180);
            return {
              ...p,
              x: p.x + Math.cos(rad) * p.speed,
              y: p.y + Math.sin(rad) * p.speed,
              speed: p.speed * 0.92, // Decel
              size: Math.max(0, p.size - 0.15)
            };
          })
          .filter(p => p.size > 0.5 && p.speed > 0.1);
      });
    }, 16); // ~60fps layout loop

    return () => clearInterval(interval);
  }, [particles]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples(prev => prev.slice(1));
    }, 850);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (isMobile) return null;

  // Color translation states
  const accentLight = cursorColor === '#FFC72C' ? 'rgba(255, 199, 44, 0.4)' 
                    : cursorColor === '#00F0FF' ? 'rgba(0, 240, 255, 0.4)'
                    : cursorColor === '#FF3B30' ? 'rgba(255, 59, 48, 0.4)'
                    : 'rgba(52, 199, 89, 0.4)';

  const accentSolid = cursorColor;

  return (
    <>
      {/* 1. Master Active Custom Cursor Elements */}
      {isEnabled && isVisible && (
        <div className="pointer-events-none fixed inset-0 z-[999]" style={{ mixBlendMode: 'normal' }}>
          
          {/* A. Vector click ripples */}
          <AnimatePresence>
            {ripples.map((rip) => (
              <motion.div
                key={rip.id}
                initial={{ opacity: 0.8, scale: 0.2 }}
                animate={{ opacity: 0, scale: 2.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: rip.y,
                  left: rip.x,
                  transform: 'translate(-50%, -50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${accentSolid}`,
                  boxShadow: `0 0 12px ${accentLight}`,
                  zIndex: 998,
                }}
              />
            ))}
          </AnimatePresence>

          {/* B. Sparks physical particles */}
          {particles.map((part) => (
            <div
              key={part.id}
              style={{
                position: 'absolute',
                top: part.y,
                left: part.x,
                transform: 'translate(-50%, -50%)',
                width: `${part.size}px`,
                height: `${part.size}px`,
                borderRadius: '50%',
                background: part.color,
                boxShadow: `0 0 8px ${part.color}`,
                opacity: part.size > 2 ? 0.9 : part.size * 0.4,
                zIndex: 998,
              }}
            />
          ))}

          {/* C. Outer Core Ring Layer */}
          <motion.div
            animate={{
              x: position.x,
              y: position.y,
            }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 24,
              mass: 0.45,
            }}
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              zIndex: 999,
            }}
          >
            {/* Direct velocity stretching outer ring container */}
            <div
              style={{
                transform: `rotate(${moveAngle}deg) scale(${1 + velocity * 0.15}, ${Math.max(0.4, 1 - velocity * 0.12)})`,
                transition: 'transform 0.05s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Preset 1: Davao Sentinel lock-on radar with rotational telemetry teeth */}
              {preset === 'sentinel' && (
                <div 
                  className="relative rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    width: isHovered ? '42px' : '26px',
                    height: isHovered ? '42px' : '26px',
                    border: `1.5px dashed ${hoverType === 'danger' ? '#FF3B30' : accentSolid}`,
                    borderRadius: '50%',
                    transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                    boxShadow: isHovered ? `0 0 14px ${hoverType === 'danger' ? 'rgba(255, 59, 48, 0.3)' : accentLight}` : 'none',
                  }}
                >
                  {/* Rotating scanner ticks */}
                  {isHovered && (
                    <div 
                      className="absolute inset-0 border border-white/10 rounded-full animate-spin" 
                      style={{ animationDuration: '4s', padding: '1px' }}
                    />
                  )}
                  {/* Corner indicator notches */}
                  <span className="absolute -top-1 -left-1 w-1 h-1 bg-white/25 rounded-full" />
                  <span className="absolute -bottom-1 -right-1 w-1 h-1 bg-white/25 rounded-full" />
                </div>
              )}

              {/* Preset 2: Aura Nova dynamic fluid gravity field */}
              {preset === 'nova' && (
                <div 
                  className="relative transition-all duration-300"
                  style={{
                    width: isHovered ? '54px' : '20px',
                    height: isHovered ? '54px' : '20px',
                    borderRadius: '50%',
                    background: isHovered 
                      ? `${hoverType === 'danger' ? 'rgba(255, 59, 48, 0.1)' : accentLight}` 
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hoverType === 'danger' ? 'rgba(255, 59, 48, 0.6)' : isHovered ? accentSolid : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: `0 0 24px ${hoverType === 'danger' ? 'rgba(255, 59, 48, 0.25)' : accentLight}`,
                  }}
                />
              )}

              {/* Preset 3: Cyber Reticle targeting crosshair */}
              {preset === 'reticle' && (
                <div 
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{
                    width: isHovered ? '44px' : '30px',
                    height: isHovered ? '44px' : '30px',
                    transform: isHovered ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  {/* Surrounding lock-on brackets */}
                  <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: hoverType === 'danger' ? '#FF3B30' : accentSolid }} />
                  <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: hoverType === 'danger' ? '#FF3B30' : accentSolid }} />
                  <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: hoverType === 'danger' ? '#FF3B30' : accentSolid }} />
                  <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: hoverType === 'danger' ? '#FF3B30' : accentSolid }} />
                  
                  {isHovered && (
                    <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: hoverType === 'danger' ? '#FF3B30' : accentSolid }} />
                  )}
                </div>
              )}

              {/* Preset 4: Minimalist Classic Orbit dot */}
              {preset === 'minimal' && (
                <div 
                  className="relative transition-all duration-200"
                  style={{
                    width: isHovered ? '32px' : '16px',
                    height: isHovered ? '32px' : '16px',
                    borderRadius: '50%',
                    border: `1.5px solid ${hoverType === 'danger' ? '#FF3B30' : accentSolid}`,
                    opacity: isHovered ? 1 : 0.45
                  }}
                />
              )}
            </div>

            {/* Lock-on label flag floating next to cursor */}
            <AnimatePresence>
              {isHovered && hoverText && (
                <motion.div
                  initial={{ opacity: 0, x: 10, y: -4 }}
                  animate={{ opacity: 1, x: 22, y: -4 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute left-0 top-0 pointer-events-none whitespace-nowrap bg-brand-dark/95 border border-white/10 rounded px-2 py-0.5 shadow-xl flex items-center gap-1 z-50 text-[8px] font-mono font-bold uppercase tracking-widest text-[#FFC72C]"
                  style={{ 
                    borderColor: hoverType === 'danger' ? '#FF3B30/30' : `${accentSolid}30`,
                    color: hoverType === 'danger' ? '#FF3B30' : cursorColor
                  }}
                >
                  <span className="h-1 w-1 rounded-full animate-ping bg-current" />
                  <span>{hoverText}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* D. Precision center dot */}
          <div
            style={{
              position: 'absolute',
              top: position.y,
              left: position.x,
              transform: 'translate(-50%, -50%)',
              width: isClicked ? '4px' : '6px',
              height: isClicked ? '4px' : '6px',
              borderRadius: '50%',
              background: hoverType === 'danger' ? '#FF3B30' : accentSolid,
              boxShadow: `0 0 10px ${hoverType === 'danger' ? '#FF3B30' : accentSolid}`,
              transition: 'transform 0.1s ease, background-color 0.2s',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />

        </div>
      )}

      {/* 2. Floating Cybernetic Telemetry and Neural Link Control Panel */}
      <div className="fixed bottom-6 left-6 z-[80] font-mono text-xs select-none flex flex-col items-start">
        
        {/* Toggle / HUD Expand Button */}
        <motion.button
          type="button"
          onClick={() => {
            setHudOpen(!hudOpen);
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border bg-brand-dark/90 text-gray-300 hover:text-white border-white/5 hover:border-brand-primary/20 shadow-xl cursor-pointer"
          title="Neural Link Systems HUD"
          id="neural-link-hud-trigger"
        >
          <Activity 
            className={`h-3.5 w-3.5 text-brand-primary ${isEnabled ? 'animate-pulse' : 'opacity-40'}`} 
            style={{ color: isEnabled ? cursorColor : undefined }}
          />
          <span className="text-[10px] uppercase font-bold tracking-wider">Neural Pointer HUD</span>
          <Settings className={`h-3 w-3 text-gray-500 hover:text-white transition-transform ${hudOpen ? 'rotate-90' : ''}`} />
        </motion.button>

        {/* Neural configurations interface panel */}
        <AnimatePresence>
          {hudOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="absolute bottom-14 left-0 w-80 glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 space-y-4"
              id="neural-link-portal-hud"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-brand-primary" style={{ color: cursorColor }} />
                  <div>
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wide">NEURAL LINK HUD</h5>
                    <p className="text-[8px] text-gray-500">Callbox Davao Security Engine</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHudOpen(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Cursor Active Node Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">NEURAL INTERACTIVE COUPLING</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isEnabled ? 'bg-brand-success/10 text-brand-success' : 'bg-white/5 text-gray-500'}`}>
                    {isEnabled ? 'SYNCED' : 'OFFLINE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEnabled(true)}
                    className={`py-1.5 rounded-lg font-bold text-[9px] uppercase transition-all cursor-pointer ${
                      isEnabled 
                        ? 'bg-brand-primary text-brand-dark' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                    }`}
                    style={{ 
                      backgroundColor: isEnabled ? cursorColor : undefined,
                      color: isEnabled ? '#050a12' : undefined
                    }}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEnabled(false);
                      setHudOpen(false);
                    }}
                    className={`py-1.5 rounded-lg font-bold text-[9px] uppercase transition-all cursor-pointer ${
                      !isEnabled 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                    }`}
                  >
                    Standard OS
                  </button>
                </div>
              </div>

              {isEnabled && (
                <>
                  {/* Preset Profile selector */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">VECTOR ENGINE STYLE</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'sentinel', label: 'Davao Sentinel', icon: Target },
                        { key: 'nova', label: 'Nova Particle', icon: Sparkles },
                        { key: 'reticle', label: 'Cyber Reticle', icon: Cpu },
                        { key: 'minimal', label: 'Minimal Classic', icon: MousePointer },
                      ].map((item) => {
                        const IconComp = item.icon;
                        const isSel = preset === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setPreset(item.key as CursorPreset)}
                            className={`p-2 rounded-lg text-left border flex items-center gap-1.5 transition-all text-[9.5px] font-medium cursor-pointer ${
                              isSel 
                                ? 'bg-white/5 border-white/20 text-white shadow-inner' 
                                : 'bg-transparent hover:bg-white/5 border-white/5 text-gray-400'
                            }`}
                            style={{ 
                              borderBottomColor: isSel ? cursorColor : undefined,
                              borderBottomWidth: isSel ? '2px' : '1px'
                            }}
                          >
                            <IconComp className="h-3 w-3 text-brand-primary shrink-0" style={{ color: isSel ? cursorColor : 'currentColor' }} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantum Quantum Hue (Colors) */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">QUANTUM HUE ACCENT</span>
                    <div className="flex gap-2 bg-black/30 p-2 rounded-xl border border-white/5">
                      {[
                        { hex: '#FFC72C', name: 'Gold' },
                        { hex: '#00F0FF', name: 'Cyan' },
                        { hex: '#FF3B30', name: 'Crimson' },
                        { hex: '#34C759', name: 'Emerald' }
                      ].map((col) => (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setCursorColor(col.hex as CursorColor)}
                          className={`h-6 w-6 rounded-lg transition-transform relative flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {cursorColor === col.hex && (
                            <span className="h-2 w-2 rounded-full bg-brand-dark antialiased" />
                          )}
                        </button>
                      ))}
                      <div className="ml-auto text-[8px] font-bold text-gray-400 self-center uppercase pr-1">
                        {cursorColor === '#FFC72C' ? 'Gold Node' : cursorColor === '#00F0FF' ? 'Cyber Cyan' : cursorColor === '#FF3B30' ? 'Security Red' : 'Davao Green'}
                      </div>
                    </div>
                  </div>

                  {/* Audio feedback, Sparks switch toggle */}
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[9px] text-gray-300 font-medium">Click Sparks Particles</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSparklesEnabled(!sparklesEnabled)}
                      className={`text-[8px] px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        sparklesEnabled 
                          ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' 
                          : 'bg-white/5 text-gray-500 border border-white/5'
                      }`}
                    >
                      {sparklesEnabled ? 'Active' : 'Muted'}
                    </button>
                  </div>
                </>
              )}

              {/* Neural Telemetry Tracker */}
              <div className="border-t border-white/5 pt-2.5 bg-black/40 p-2 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>TELEMETRY FEED</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-ping" />
                    <span>SECURE</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[8.5px] text-gray-400 font-mono">
                  <div>
                    <span className="text-gray-600 font-semibold">X / Y:</span>{' '}
                    <span className="text-white font-medium">
                      {Math.round(position.x)}, {Math.round(position.y)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 font-semibold">VEL:</span>{' '}
                    <span className="text-white font-medium">{(velocity * 10).toFixed(1)} px/ms</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-gray-600 font-semibold">HOVER_TAG:</span>{' '}
                    <span className="text-brand-primary lowercase font-medium" style={{ color: cursorColor }}>
                      {hoveredElementTag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance Assurance Signoff */}
              <div className="flex items-center gap-1.5 text-[7.5px] text-gray-600 border-t border-white/5 pt-2 font-mono">
                <ShieldCheck className="h-3 w-3 text-gray-500" />
                <span>Synchronized via Davao Cyber-security Protocol V3</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

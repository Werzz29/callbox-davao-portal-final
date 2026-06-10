import React, { useEffect, useRef, useState } from 'react';

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000, radius: 160 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track state to handle resize smoothly
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      setMouse((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    };

    const handleMouseLeave = () => {
      setMouse((prev) => ({
        ...prev,
        x: -1000,
        y: -1000,
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      pulseSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Super smooth slow floating vectors
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 2.2 + 1;
        
        // Brand themes (mix of yellow-gold, white, and subtle corporate brand dark blue accent)
        const rand = Math.random();
        if (rand > 0.8) {
          this.color = '255, 199, 44'; // Gold #FFC72C
          this.alpha = Math.random() * 0.5 + 0.3;
        } else if (rand > 0.6) {
          this.color = '255, 184, 0'; // Amber #FFB800
          this.alpha = Math.random() * 0.4 + 0.3;
        } else {
          this.color = '255, 255, 255'; // Clean White
          this.alpha = Math.random() * 0.3 + 0.15;
        }
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce back smoothly from borders
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interactive mouse gravity - gently attract particles
        if (mouse.x !== -1000) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 0.6;
            this.y += (dy / dist) * force * 0.6;
          }
        }

        // Ambient opacity breathing pulse
        this.alpha += this.pulseSpeed;
        if (this.alpha > 0.8 || this.alpha < 0.1) {
          this.pulseSpeed *= -1;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0.05, Math.min(1, this.alpha))})`;
        ctx.shadowBlur = this.color.includes('255, 199') ? 8 : 0;
        ctx.shadowColor = 'rgba(255, 199, 44, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    const initParticles = () => {
      particles = [];
      // Adjust density based on screenspace
      const particleCount = Math.min(75, Math.floor((width * height) / 18000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    // Core high-efficiency rendering loop of network nodes & connecting lines
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw lines connecting particles within proximity
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Render link line within distance threshold
          if (dist < 155) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Link color fades out exponentially with distance
            const alpha = (1 - dist / 155) * 0.14;
            const strokeColor = particles[i].color.includes('255, 199') || particles[j].color.includes('255, 199')
              ? 'rgba(255, 199, 44,'
              : 'rgba(255, 255, 255,';
              
            ctx.strokeStyle = strokeColor + alpha + ')';
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }

        // Draw interactive line linking cursor directly to closest nodes
        if (mouse.x !== -1000) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            const alpha = (1 - dist / mouse.radius) * 0.18;
            ctx.strokeStyle = `rgba(255, 199, 44, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouse.radius]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{ mixBlendMode: 'screen', opacity: 0.5 }}
      id="portal-ambient-network-canvas"
    />
  );
}

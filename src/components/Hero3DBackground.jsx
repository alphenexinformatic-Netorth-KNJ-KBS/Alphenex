import React, { useRef, useEffect } from 'react';

/**
 * Hero3DBackground — Pure Canvas 2D. No Three.js, no framer-motion.
 * Animated particles, glowing orb, and rotating rings — zero JS-library dependency.
 */
function Hero3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let width = 0, height = 0;
    const PARTICLE_COUNT = 70;
    const particles = [];

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          o: Math.random() * 0.45 + 0.15,
        });
      }
    };

    resize();
    initParticles();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.72;
      const cy = height * 0.5;
      const orbR = Math.min(width, height) * 0.14 + Math.sin(t * 1.5) * 2.5;

      // Ambient radial glow
      const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.48);
      radial.addColorStop(0, 'rgba(9,146,194,0.16)');
      radial.addColorStop(0.5, 'rgba(9,146,194,0.05)');
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Outer glow
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 1.9);
      orbGrad.addColorStop(0, 'rgba(9,196,240,0.88)');
      orbGrad.addColorStop(0.3, 'rgba(9,146,194,0.5)');
      orbGrad.addColorStop(0.7, 'rgba(9,146,194,0.1)');
      orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, orbR * 1.9, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.fill();

      // Core orb
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(9,196,240,0.72)';
      ctx.shadowColor = '#09c4f0';
      ctx.shadowBlur = 35;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rotating rings
      const rings = [
        { r: orbR * 2.2, lw: 1.2, speed: 0.4, tilt: 0.5, color: 'rgba(9,146,194,0.48)' },
        { r: orbR * 2.9, lw: 1.0, speed: -0.25, tilt: -0.3, color: 'rgba(9,196,240,0.35)' },
        { r: orbR * 3.6, lw: 0.8, speed: 0.18, tilt: 1.0, color: 'rgba(7,115,160,0.3)' },
      ];
      rings.forEach(({ r, lw, speed, tilt, color }) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt + t * speed);
        ctx.scale(1, 0.36);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.restore();
      });

      // Floating accent dots
      const dots = [
        { ox: -0.18, oy: -0.22, sz: 8, sp: 0.4 },
        { ox: 0.28, oy: -0.18, sz: 6, sp: 0.3 },
        { ox: -0.22, oy: 0.2, sz: 7, sp: 0.5 },
        { ox: 0.25, oy: 0.22, sz: 5, sp: 0.35 },
        { ox: 0, oy: -0.28, sz: 6, sp: 0.2 },
        { ox: -0.3, oy: 0, sz: 5, sp: 0.45 },
      ];
      dots.forEach(({ ox, oy, sz, sp }) => {
        const x = cx + ox * width + Math.sin(t * sp + ox * 10) * 7;
        const y = cy + oy * height + Math.cos(t * sp * 0.7 + oy * 10) * 7;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,146,194,0.68)';
        ctx.shadowColor = '#0992C2';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,200,240,${p.o})`;
        ctx.fill();
      }

      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ background: 'linear-gradient(135deg, #020c1b 0%, #051628 50%, #020c1b 100%)' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

export default Hero3DBackground;

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, ArrowRight, Star } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations';

const words = ['One hub', 'for every', 'workday.'];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(23,133,130,${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(23,133,130,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - rect.left) / rect.width - 0.5) * 20, y: ((e.clientY - rect.top) / rect.height - 0.5) * 20 });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A1828]" onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(23,133,130,0.18) 0%, transparent 70%)' }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,161,129,0.12) 0%, transparent 70%)' }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(23,133,130,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#178582]/10 border border-[#178582]/25 text-[#178582] text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#BFA181] animate-pulse" />
              Now in public beta — free for teams up to 10
            </motion.div>

            <motion.h1 variants={staggerContainer} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              {words.map((word, i) => (
                <motion.span key={i} variants={fadeUp} className="block">
                  {i === 0 ? <span className="gradient-text">{word}</span> : <span className="text-[#E8F0F8]">{word}</span>}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-[#7A9BBF] mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Tasks, messages, leaves, and documents — unified for your entire team.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link href="/register" className="group flex items-center justify-center gap-2 shimmer-btn text-white font-semibold px-8 py-4 rounded-xl text-base hover:shadow-[0_0_24px_rgba(23,133,130,0.4)] hover:scale-105 transition-all duration-200">
                Start for free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#1E3A5F] text-[#E8F0F8] font-semibold text-base hover:bg-[#178582]/10 hover:border-[#178582]/40 transition-all duration-200 group">
                <div className="w-8 h-8 rounded-full bg-[#178582]/20 flex items-center justify-center group-hover:bg-[#178582]/30 transition-colors">
                  <Play size={14} className="text-[#178582] ml-0.5" />
                </div>
                Watch demo
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan'].map((name, i) => (
                  <div key={name} className="w-8 h-8 rounded-full border-2 border-[#0A1828] overflow-hidden" style={{ zIndex: 5 - i }}>
                    <img src={`https://ui-avatars.com/api/?name=${name}&background=178582&color=fff&size=32`} alt={name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-[#BFA181] fill-[#BFA181]" />
                  ))}
                </div>
                <p className="text-xs text-[#7A9BBF] mt-0.5">Trusted by 500+ teams</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="hidden lg:block">
            <motion.div
              style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.3}deg)`, transition: 'transform 0.1s ease-out' }}
              className="relative"
            >
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-[#1E3A5F]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E3A5F] bg-[#0D1F35]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-[#178582]/60" />
                  </div>
                  <div className="flex-1 mx-4 h-5 bg-[#112540] rounded-md" />
                </div>
                <div className="flex">
                  <div className="w-12 bg-[#0D1F35] border-r border-[#1E3A5F] py-4 flex flex-col items-center gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-md ${i === 0 ? 'bg-[#178582]' : 'bg-[#112540]'}`} />
                    ))}
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Tasks', value: '24', color: 'text-[#178582]' },
                        { label: 'Leaves', value: '3', color: 'text-[#BFA181]' },
                        { label: 'Messages', value: '12', color: 'text-[#D4B896]' },
                      ].map((kpi) => (
                        <div key={kpi.label} className="bg-[#112540] rounded-lg p-2">
                          <div className={`text-lg font-bold font-display ${kpi.color}`}>{kpi.value}</div>
                          <div className="text-xs text-[#7A9BBF]">{kpi.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#112540] rounded-lg p-3 h-24 flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 9 ? '#178582' : 'rgba(23,133,130,0.3)' }} />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {['Design system update', 'API integration', 'User testing'].map((task, i) => (
                        <div key={task} className="flex items-center gap-2 bg-[#112540] rounded-lg px-3 py-2">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#178582]' : i === 1 ? 'bg-[#BFA181]' : 'bg-[#D4B896]'}`} />
                          <div className="text-xs text-[#B8D0E8] flex-1">{task}</div>
                          <div className="w-4 h-4 rounded-full bg-[#152B4A]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card rounded-xl px-3 py-2 flex items-center gap-2 shadow-[0_0_16px_rgba(23,133,130,0.3)]">
                <div className="w-2 h-2 rounded-full bg-[#178582] animate-pulse" />
                <span className="text-xs text-[#E8F0F8] font-medium">3 online</span>
              </motion.div>

              <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-xl px-3 py-2 shadow-[0_0_16px_rgba(191,161,129,0.25)]">
                <span className="text-xs text-[#BFA181] font-medium">✓ Task completed</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

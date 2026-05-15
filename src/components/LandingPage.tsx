"use client";

import Link from "next/link";
import { 
  BookOpen, Users, Play, MessageSquare, 
  Sparkles, ArrowRight, CheckCircle2,
  Mail, Lock, User as UserIcon,
  ChevronRight, Star, Globe, Zap, MapPin, Phone,
  Layers, Shield, Cpu, MousePointer2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white overflow-x-hidden">
      {/* Noise Texture */}
      <div className="noise" />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] right-[-5%] w-[60%] aspect-square bg-[var(--primary)]/10 blur-[120px] rounded-full"
        />
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
          className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square bg-blue-400/10 blur-[100px] rounded-full"
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center glass-premium px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 group cursor-pointer">
              <span className="font-black text-white text-lg group-hover:scale-110 transition-transform">E</span>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">ETEMBE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
            <a href="#ecosystem" className="hover:text-[var(--primary)] transition-colors relative group">
              Ecosystem
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full" />
            </a>
            <a href="#academy" className="hover:text-[var(--primary)] transition-colors relative group">
              Academy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full" />
            </a>
            <a href="#founder" className="hover:text-[var(--primary)] transition-colors relative group">
              Founder
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {isLogin ? "Join Now" : "Sign In"}
            </button>
            <Link 
              href="/auth" 
              className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95 shadow-xl shadow-black/5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)]"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">V 2.0 Now Live</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95]"
              >
                The Future of <br />
                <span className="text-gradient">Creative Flow.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-[var(--muted-foreground)] max-w-xl leading-relaxed font-medium"
              >
                A unified ecosystem designed for the next generation of digital architects. Learn, connect, and build without boundaries.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/auth" className="group relative px-8 py-5 bg-[var(--primary)] text-white rounded-2xl font-black text-sm uppercase tracking-widest overflow-hidden shadow-2xl shadow-[var(--primary)]/30">
                  <span className="relative z-10 flex items-center gap-2">
                    Enter the Ecosystem <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <a href="#ecosystem" className="px-8 py-5 border-2 border-[var(--border)] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--muted)] transition-colors text-center">
                  Explore Components
                </a>
              </motion.div>

              {/* Stats / Trust */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="pt-12 flex flex-wrap gap-12 grayscale opacity-50"
              >
                <div className="space-y-1">
                  <div className="text-2xl font-black">2.4k+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Architects</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black">150+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Masterclasses</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black">99.9%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Uptime</div>
                </div>
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,102,255,0.2)] border border-white/20">
                <img 
                  src="/hero-visual.png" 
                  alt="ETEMBE Visual" 
                  className="w-full h-auto hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--primary)]/20 blur-3xl rounded-full" />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Feature Section - Bento Redefined */}
      <section id="ecosystem" className="py-32 px-6 bg-[var(--muted)]/30 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Master the Stack.</h2>
            <p className="text-[var(--muted-foreground)] font-medium">A modular platform built to scale with your ambition. Every tool you need, unified in one interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Academy Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-white border border-[var(--border)] p-12 shadow-2xl shadow-black/5"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--primary)]/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight">The Academy</h3>
                    <p className="text-[var(--muted-foreground)] max-w-sm leading-relaxed font-medium">
                      High-fidelity learning experiences with real-time tracking, peer reviews, and verified certifications.
                    </p>
                  </div>
                </div>
                <Link href="/course" className="inline-flex items-center gap-3 font-black text-sm uppercase tracking-widest text-[var(--primary)] group">
                  Explore Courses <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
              {/* Visual abstraction */}
              <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 border-[40px] border-[var(--primary)]/5 rounded-full" />
            </motion.div>

            {/* Social Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-[var(--foreground)] text-[var(--background)] p-12 shadow-2xl"
            >
              <div className="space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Global <br />Network</h3>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">
                    Collaborate with elite creators worldwide in real-time.
                  </p>
                </div>
                <div className="flex -space-x-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--foreground)] bg-[var(--muted)]" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--foreground)] bg-[var(--primary)] flex items-center justify-center text-[10px] font-black">+2k</div>
                </div>
              </div>
            </motion.div>

            {/* Shorts Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 rounded-[2.5rem] bg-white border border-[var(--border)] p-12 shadow-2xl shadow-black/5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Play className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Shorts</h3>
                <p className="text-[var(--muted-foreground)] text-sm font-medium leading-relaxed">
                  Bite-sized technical mastery delivered in under 60 seconds.
                </p>
              </div>
              <div className="mt-8 aspect-video rounded-2xl bg-[var(--muted)] overflow-hidden border border-[var(--border)]">
                 <div className="w-full h-full bg-gradient-to-br from-[var(--muted)] to-[var(--border)] flex items-center justify-center">
                    <Play className="w-8 h-8 text-[var(--muted-foreground)]/30" />
                 </div>
              </div>
            </motion.div>

            {/* Messaging Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--primary)] to-blue-700 p-12 text-white shadow-2xl shadow-[var(--primary)]/20"
            >
              <div className="flex flex-col md:flex-row gap-12 items-center h-full">
                <div className="flex-1 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Real-time <br />Directives</h3>
                  <p className="text-white/80 font-medium">
                    Low-latency communication layer for team coordination and mentorship.
                  </p>
                  <Link href="/chat" className="inline-block px-8 py-4 bg-white text-[var(--primary)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                    Launch Messenger
                  </Link>
                </div>
                <div className="flex-1 w-full flex justify-center opacity-30">
                  <div className="relative">
                    <div className="w-48 h-48 border-4 border-white/40 rounded-full animate-ping absolute inset-0" />
                    <div className="w-48 h-48 border-4 border-white rounded-full flex items-center justify-center">
                      <Zap className="w-16 h-16 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section - Editorial Style */}
      <section id="founder" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative group">
            <div className="absolute -inset-8 bg-[var(--primary)]/10 blur-[80px] rounded-full group-hover:bg-[var(--primary)]/20 transition-colors" />
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="/dan-peter.jpg" 
                alt="Dan Peter" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="absolute -bottom-10 -right-10 glass-premium p-10 rounded-[3rem] shadow-2xl border-white"
            >
              <div className="text-5xl font-black text-[var(--primary)]">17</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Years of Age</div>
            </motion.div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Founder & Chief Architect
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">Dan <br />Peter.</h2>
              <p className="text-2xl font-bold leading-tight text-[var(--foreground)]">
                Redefining the creative workflow from Lagos, Nigeria.
              </p>
              <p className="text-lg text-[var(--muted-foreground)] leading-relaxed font-medium">
                A visionary architect at **Immaculate Heart Comprehensive High School**, Dan is dedicated to building frictionless digital environments that empower the next generation of global innovators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[var(--muted)] border border-[var(--border)] group hover:border-[var(--primary)]/30 transition-all">
                <MapPin className="w-6 h-6 text-[var(--primary)] mb-4" />
                <div className="text-sm font-black uppercase tracking-widest mb-1">HQ</div>
                <div className="text-xs text-[var(--muted-foreground)] font-bold">Mende, Maryland, Lagos State</div>
              </div>
              <a 
                href="https://wa.me/2348088461525" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-8 rounded-3xl bg-white border border-[var(--border)] group hover:border-[var(--success)] transition-all"
              >
                <Phone className="w-6 h-6 text-[var(--success)] mb-4" />
                <div className="text-sm font-black uppercase tracking-widest mb-1">Direct Line</div>
                <div className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors font-bold">+234 808 846 1525</div>
              </a>
            </div>

            <div className="pt-10 flex items-center gap-12 border-t border-[var(--border)]">
              <div className="space-y-1">
                <div className="text-3xl font-black">Lagos</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Base of Ops</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black">IHCHS</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Education</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-[var(--foreground)] text-[var(--background)] p-16 md:p-24 relative overflow-hidden text-center space-y-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">The Future is <br />Now.</h2>
            <p className="text-white/60 text-lg font-medium max-w-xl mx-auto">
              Join the elite circle of digital architects. Experience ETEMBE today.
            </p>
            <div className="pt-8">
              <Link href="/auth" className="px-12 py-6 bg-[var(--primary)] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-transform inline-block shadow-2xl shadow-[var(--primary)]/40">
                Claim Your Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center font-black text-xs text-white">E</div>
            <span className="font-black text-lg tracking-widest uppercase">ETEMBE</span>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy</a>
          </div>

          <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em]">
            © 2026 ETEMBE ECOSYSTEM. BEYOND BOUNDARIES.
          </p>
        </div>
      </footer>
    </div>
  );
}

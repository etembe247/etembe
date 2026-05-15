"use client";

import Link from "next/link";
import { 
  BookOpen, Users, Play, MessageSquare, 
  Sparkles, ArrowRight, CheckCircle2,
  Mail, Lock, User as UserIcon,
  ChevronRight, Star, Globe, Zap, MapPin, Phone
} from "lucide-react";
import { useState } from "react";

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/10 selection:text-[var(--primary)] font-sans antialiased">
      {/* Light Pattern Background */}
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[var(--primary)]/[0.03] via-transparent to-[var(--secondary)]/[0.03] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-xl py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center font-black text-base tracking-tighter text-white">E</div>
          <span className="font-bold text-lg tracking-tight letter-spacing-tight">ETEMBE</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[13px] font-medium text-[var(--muted-foreground)]">
          <a href="#ecosystem" className="hover:text-[var(--foreground)] transition-colors">Ecosystem</a>
          <a href="#academy" className="hover:text-[var(--foreground)] transition-colors">Academy</a>
          <a href="#social" className="hover:text-[var(--foreground)] transition-colors">Social</a>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[13px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            {isLogin ? "Create account" : "Sign in"}
          </button>
          <Link href="/auth" className="px-5 py-2 bg-[var(--primary)] text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[11px] font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-10 animate-fade-in">
          <Zap className="w-3 h-3 text-[var(--primary)]" />
          The Unified Creative OS
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1] mb-8 max-w-5xl animate-slide-up">
          The all-in-one <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-foreground)]">digital ecosystem.</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl leading-relaxed mb-12 animate-slide-up delay-100">
          A professional space combining elite education, social networking, and content creation. Built for the modern visionary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-slide-up delay-200 mb-24">
          <Link href="/auth" className="flex-1 px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-base shadow-[0_20px_50px_rgba(0,102,255,0.2)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
            Join the Ecosystem <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Professional Mockup Section */}
        <div className="w-full relative animate-fade-in delay-300">
          <div className="absolute inset-0 bg-[var(--primary)]/10 blur-[120px] rounded-full -z-10 scale-75 opacity-50" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: App Showcase Card */}
            <div className="lg:col-span-7 rounded-[2rem] border border-[var(--border)] bg-white overflow-hidden group shadow-2xl">
              <div className="p-1.5 bg-[var(--muted)] border-b border-[var(--border)] flex items-center gap-2 px-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                </div>
                <div className="mx-auto bg-white/50 px-4 py-1 rounded-md text-[10px] text-[var(--muted-foreground)] font-mono">etembe.io/dashboard</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000" 
                alt="App Interface" 
                className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>

            {/* Right: Modern Form Card */}
            <div className="lg:col-span-5 p-10 rounded-[2rem] border border-[var(--border)] bg-white shadow-2xl space-y-8 text-left">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{isLogin ? "Sign In" : "Create Account"}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Enter your professional details below.</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider ml-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)]/30 focus:bg-white transition-all" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider ml-1">Work Email</label>
                  <input type="email" placeholder="name@company.com" className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)]/30 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider ml-1">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)]/30 focus:bg-white transition-all" />
                </div>
                
                <Link href="/auth" className="block w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-sm text-center hover:opacity-90 transition-all mt-4 shadow-lg shadow-[var(--primary)]/20">
                  {isLogin ? "Sign In to ETEMBE" : "Start your journey"}
                </Link>
              </form>

              <div className="pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                    Unlimited access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bento Grid Features */}
      <section id="ecosystem" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 p-10 rounded-[2.5rem] bg-[var(--muted)] border border-[var(--border)] flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4 max-w-md relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">The Academy</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                A professional-grade learning management system. Track progress, earn certifications, and master elite skills with our interactive curriculum.
              </p>
            </div>
            <div className="mt-12 transform group-hover:translate-x-2 transition-transform">
              <Link href="/course" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                Explore Curriculum <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 p-10 rounded-[2.5rem] bg-white border border-[var(--border)] flex flex-col justify-between hover:bg-[var(--muted)] transition-all shadow-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Social Core</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Built-in networking tools for creators to collaborate, share, and grow together.
              </p>
            </div>
            <div className="mt-8 flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-[var(--muted)] border-2 border-white" />
              ))}
              <div className="w-8 h-8 rounded-full bg-[var(--secondary)] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">+2k</div>
            </div>
          </div>

          <div className="md:col-span-4 p-10 rounded-[2.5rem] bg-white border border-[var(--border)] flex flex-col justify-between hover:bg-[var(--muted)] transition-all shadow-sm">
             <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] mb-6">
                  <Play className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Shorts Feed</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Bite-sized video knowledge designed for the modern attention span.
                </p>
              </div>
          </div>

          <div className="md:col-span-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-[var(--primary)] to-blue-600 border border-[var(--primary)] flex items-center justify-between group text-white">
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-bold tracking-tight">Start creating today.</h3>
              <p className="opacity-90">Join the most advanced digital ecosystem for creators.</p>
              <Link href="/auth" className="inline-flex px-6 py-3 bg-white text-[var(--primary)] rounded-xl font-bold text-sm mt-4 active:scale-95 transition-all shadow-xl">
                Get Early Access
              </Link>
            </div>
            <Globe className="w-32 h-32 text-white/20 hidden lg:block group-hover:rotate-12 transition-transform duration-1000" />
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--primary)]/5 blur-2xl rounded-[3rem] -z-10" />
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-[var(--border)] bg-[var(--muted)] group shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000" 
                alt="Dan Peter" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 bg-white border border-[var(--border)] rounded-3xl shadow-xl">
              <div className="text-[var(--primary)] font-black text-xl">17</div>
              <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Years Old</div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
                Founder & Visionary
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">Dan Peter</h2>
              <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                Building the future of digital interaction from Lagos, Nigeria. A student at **Immaculate Heart Comprehensive High School**, Maryland, driven by a mission to unify creative ecosystems.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--muted)] border border-[var(--border)] space-y-2">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                <div className="text-sm font-bold">Location</div>
                <div className="text-xs text-[var(--muted-foreground)]">Mende, Maryland, Lagos State</div>
              </div>
              <a 
                href="https://wa.me/2348088461525" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white border border-[var(--border)] space-y-2 hover:border-[var(--primary)]/30 transition-all group"
              >
                <Phone className="w-5 h-5 text-[var(--success)]" />
                <div className="text-sm font-bold">Contact</div>
                <div className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">+234 808 846 1525</div>
              </a>
            </div>

            <div className="pt-6 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">Lagos</span>
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Operations Base</span>
              </div>
              <div className="w-px h-10 bg-[var(--border)]" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold">IHCHS</span>
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Education</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 border-t border-[var(--border)] bg-[var(--muted)]/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[var(--primary)] rounded flex items-center justify-center font-black text-[10px] text-white">E</div>
            <span className="font-bold text-sm tracking-tight">ETEMBE</span>
          </div>
          <p className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-[0.2em]">© 2026 ETEMBE Ecosystem. Built for Excellence.</p>
          <div className="flex gap-8 text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

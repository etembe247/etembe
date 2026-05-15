"use client";

import Link from "next/link";
import { 
  BookOpen, Users, Play, MessageSquare, 
  Sparkles, ArrowRight, CheckCircle2,
  Mail, Lock, User as UserIcon
} from "lucide-react";
import { useState } from "react";

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);

  const features = [
    { title: "Academy", icon: BookOpen, color: "text-blue-500", label: "Master Skills" },
    { title: "Social", icon: Users, color: "text-purple-500", label: "Build Presence" },
    { title: "Shorts", icon: Play, color: "text-emerald-500", label: "Share Clips" },
    { title: "Chat", icon: MessageSquare, color: "text-orange-500", label: "Connect Fast" },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[var(--primary)] selection:text-white font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-lg shadow-[var(--primary)]/30">E</div>
          <span className="font-bold text-xl tracking-tight">ETEMBE</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
          <a href="#about" className="hover:text-white transition-colors">Purpose</a>
          <a href="#features" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#academy" className="hover:text-white transition-colors">Academy</a>
        </div>
        <button onClick={() => setIsLogin(!isLogin)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
          {isLogin ? "Need an account?" : "Already have an account?"}
        </button>
      </nav>

      {/* Hero Section with Integrated Form */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-screen">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-black tracking-widest uppercase animate-fade-in">
            <Sparkles className="w-4 h-4" />
            The Ultimate PWA Ecosystem
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] animate-slide-up">
            Your Digital Life, <span className="bg-gradient-to-r from-[var(--primary)] to-purple-500 bg-clip-text text-transparent">Unified.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-xl leading-relaxed animate-slide-up delay-100">
            ETEMBE is a premium all-in-one platform combining **Academy, Social, Shorts, and Messaging**. Designed for creators and learners who demand excellence.
          </p>

          {/* Component Highlights */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up delay-200">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 transition-all group">
                <div className={`p-2.5 rounded-xl bg-white/5 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{f.title}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-tighter">{f.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Form & Hero Image Container */}
        <div className="flex-1 w-full max-w-xl perspective-1000">
          <div className="relative group animate-fade-in delay-300">
            {/* Main Image */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
              <img 
                src="/landing_human_hero_1778817203885.png" 
                alt="ETEMBE Community" 
                className="w-full aspect-[4/5] lg:aspect-auto object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Registration Form Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl space-y-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">
                      {isLogin ? "Welcome Back" : "Join the Future"}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {isLogin ? "Enter your credentials to continue" : "Create your free account in seconds"}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    {!isLogin && (
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                        <input type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm outline-none focus:border-[var(--primary)] transition-all" />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                    <Link href="/auth" className="block w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-center shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-95 transition-all">
                      {isLogin ? "Sign In Now" : "Create Account"}
                    </Link>
                  </form>
                  
                  <div className="flex items-center gap-4 text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
                    <span className="flex-1 h-px bg-white/10"></span>
                    <span>Or Continue With</span>
                    <span className="flex-1 h-px bg-white/10"></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Google</button>
                    <button className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Github</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Sections Highlight */}
      <section id="about" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">The Academy</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Professional education modules with progress tracking, certification, and interactive quizzes.
            </p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Social Core</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Connect with mentors and peers. Build your profile, follow creators, and grow your network.
            </p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Shorts Feed</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Bite-sized video content for quick learning and entertainment. Swipe through infinite knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 text-center text-[var(--muted-foreground)] text-xs font-medium border-t border-white/5">
        <p>© 2026 ETEMBE Digital Ecosystem. All rights reserved.</p>
      </footer>
    </div>
  );
}

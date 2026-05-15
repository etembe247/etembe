"use client";

import { useAppStore, formatNumber } from "@/lib/store";
import { 
  TrendingUp, Users, Play, BookOpen, FileText, Search, 
  ArrowRight, Heart, MessageSquare, Share2, Sparkles, Plus, Bell
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const user = useAppStore((s) => s.user);
  const blogs = useAppStore((s) => s.blogs);
  const shorts = useAppStore((s) => s.shorts);
  const courses = useAppStore((s) => s.courses);
  const notifications = useAppStore((s) => s.notifications);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const stats = [
    { label: "Followers", value: user ? formatNumber(user.followers.length) : "0", icon: Users, color: "text-blue-500" },
    { label: "Total Posts", value: formatNumber(blogs.length + shorts.length), icon: FileText, color: "text-emerald-500" },
    { label: "Courses", value: formatNumber(courses.length), icon: BookOpen, color: "text-purple-500" },
    { label: "Notifications", value: user ? formatNumber(notifications.filter(n => !n.read).length) : "0", icon: Bell, color: "text-orange-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-fade-in pb-24">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {user ? `Hello, ${user.name}!` : "Welcome to ETEMBE"}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">Here's what's happening in your ecosystem today.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/blog/create" className="flex-1 md:flex-none px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create Content
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] card-hover">
            <div className={`w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <p className="text-xs text-[var(--muted-foreground)] font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Blogs */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
              Latest Blogs
            </h2>
            <Link href="/blog" className="text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {blogs.length > 0 ? blogs.slice(0, 3).map((blog) => (
              <Link key={blog.id} href="/blog" className="flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted)] transition-all group">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--muted)] shrink-0">
                  <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate group-hover:text-[var(--primary)] transition-colors">{blog.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">{blog.content}</p>
                </div>
              </Link>
            )) : (
              <div className="py-10 text-center border-2 border-dashed border-[var(--border)] rounded-3xl text-[var(--muted-foreground)]">
                <p className="text-sm font-medium">No blog posts yet.</p>
                <Link href="/blog/create" className="text-xs text-[var(--primary)] mt-1 inline-block hover:underline">Write your first post</Link>
              </div>
            )}
          </div>
        </section>

        {/* Featured Shorts */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-[var(--primary)]" />
              Recent Shorts
            </h2>
            <Link href="/shorts" className="text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 group">
              Watch Feed <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {shorts.length > 0 ? shorts.slice(0, 3).map((short) => (
              <Link key={short.id} href="/shorts" className="aspect-[9/16] rounded-2xl overflow-hidden relative group">
                <img src={short.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold truncate">
                  {short.caption}
                </div>
              </Link>
            )) : (
              <div className="col-span-3 py-10 text-center border-2 border-dashed border-[var(--border)] rounded-3xl text-[var(--muted-foreground)]">
                <p className="text-sm font-medium">No shorts uploaded.</p>
                <Link href="/shorts/upload" className="text-xs text-[var(--primary)] mt-1 inline-block hover:underline">Share a short video</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}



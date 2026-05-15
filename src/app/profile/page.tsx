"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, LogOut, Save, ArrowLeft, Settings, Heart } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const logout = useAppStore((s) => s.logout);
  const blogs = useAppStore((s) => s.blogs);
  const shorts = useAppStore((s) => s.shorts);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !user) return null;

  const myBlogs = blogs.filter((b) => b.authorId === user?.id);
  const myShorts = shorts.filter((s) => s.authorId === user?.id);
  
  const totalLikes = 
    myBlogs.reduce((acc, b) => acc + b.likes.length, 0) + 
    myShorts.reduce((acc, s) => acc + s.likes.length, 0);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateUser({ avatar: url });
      toast.success("Profile photo updated");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          username,
          bio,
        })
        .eq("id", user.id);

      if (error) throw error;
      updateUser({ name, username, bio });
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link href="/settings" className="p-2 rounded-xl hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <button onClick={() => fileRef.current?.click()} className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-3xl overflow-hidden border-4 border-[var(--background)] shadow-lg">
            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </button>
        <button onClick={() => fileRef.current?.click()} className="mt-2 text-sm font-medium text-[var(--primary)] hover:underline">Change Photo</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Followers", value: user.followers.length },
          { label: "Following", value: user.following.length },
          { label: "Posts", value: myBlogs.length + myShorts.length },
          { label: "Likes", value: totalLikes },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-xl bg-[var(--muted)]">
            <span className="font-bold text-lg block">{stat.value}</span>
            <span className="text-[11px] text-[var(--muted-foreground)]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <div className="space-y-4 mb-8">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] resize-y min-h-[80px] transition-all" placeholder="Tell us about yourself..." />
          <p className="text-[10px] text-[var(--muted-foreground)] text-right">{bio.length}/160</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold shadow-md shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
        <button onClick={handleLogout} className="py-3 px-5 bg-[var(--destructive)]/10 text-[var(--destructive)] rounded-xl font-semibold hover:bg-[var(--destructive)]/20 transition-colors active:scale-95 flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, X, Send } from "lucide-react";
import { useAppStore, generateId, formatNumber, ShortVideo } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ShortsPage() {
  const shorts = useAppStore((s) => s.shorts);
  const setShorts = useAppStore((s) => s.setShorts);
  const user = useAppStore((s) => s.user);
  const likeShort = useAppStore((s) => s.likeShort);
  const saveShort = useAppStore((s) => s.saveShort);
  const addShortComment = useAppStore((s) => s.addShortComment);
  const followUser = useAppStore((s) => s.followUser);
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentDrawer, setCommentDrawer] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("shorts")
        .select(`
          *,
          profiles:author_id (name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (data && !error) {
        const formattedShorts: ShortVideo[] = data.map((s: any) => ({
          id: s.id,
          url: s.video_url,
          thumbnail: s.thumbnail_url || "",
          caption: s.caption || "",
          authorId: s.author_id,
          authorName: s.profiles?.name || "Unknown",
          authorAvatar: s.profiles?.avatar_url || "",
          likes: s.likes || [],
          comments: [],
          shares: s.shares_count || 0,
          saves: [],
          createdAt: s.created_at,
        }));
        setShorts(formattedShorts);
      }
      setLoading(false);
    };

    fetchShorts();
  }, [setShorts]);

  // Auto-play current video, pause others
  useEffect(() => {
    if (shorts.length === 0) return;
    videoRefs.current.forEach((video, id) => {
      if (id === shorts[currentIndex]?.id) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, shorts]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex && newIndex < shorts.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleLike = async (shortId: string) => {
    if (!user) { router.push("/auth"); return; }
    
    try {
      const short = shorts.find(s => s.id === shortId);
      if (!short) return;

      const isLiked = short.likes.includes(user.id);
      const newLikes = isLiked
        ? short.likes.filter(id => id !== user.id)
        : [...short.likes, user.id];

      const { error } = await supabase
        .from("shorts")
        .update({ likes: newLikes })
        .eq("id", shortId);

      if (error) throw error;
      likeShort(shortId, user.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update like");
    }
  };

  const handleSave = (shortId: string) => {
    if (!user) { router.push("/auth"); return; }
    saveShort(shortId, user.id);
    const short = shorts.find((s) => s.id === shortId);
    if (short?.saves.includes(user.id)) {
      toast("Removed from saved");
    } else {
      toast.success("Saved to collection");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleFollow = (authorId: string) => {
    if (!user) { router.push("/auth"); return; }
    if (authorId === user.id) return;
    followUser(authorId);
    toast.success("Following!");
  };

  const handleAddComment = (shortId: string) => {
    if (!user) { router.push("/auth"); return; }
    if (!commentText.trim()) return;
    addShortComment(shortId, {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    });
    setCommentText("");
  };

  if (shorts.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
        </div>
        <p className="text-white/60 font-medium">No shorts yet</p>
        <button onClick={() => router.push(user ? "/shorts/upload" : "/auth")} className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
          Upload Your First Short
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="h-[100dvh] w-full bg-black text-white snap-y snap-mandatory overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none md:left-[260px]">
        <h1 className="text-xl font-bold pointer-events-auto">Shorts</h1>
        <button onClick={() => router.push(user ? "/shorts/upload" : "/auth")} className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {shorts.map((short, idx) => {
        const isLiked = user ? short.likes.includes(user.id) : false;
        const isSaved = user ? short.saves.includes(user.id) : false;
        return (
          <div key={short.id} className="w-full h-[100dvh] snap-start relative bg-black flex items-center justify-center overflow-hidden">
            {/* Video / Image */}
            {short.url.includes(".mp4") || short.url.includes("blob:") ? (
              <video
                ref={(el) => { if (el) videoRefs.current.set(short.id, el); }}
                src={short.url}
                className="w-full h-full object-cover"
                loop muted playsInline
                onClick={(e) => {
                  const v = e.currentTarget;
                  v.paused ? v.play() : v.pause();
                }}
              />
            ) : (
              <img src={short.url || short.thumbnail} alt="Short" className="w-full h-full object-cover opacity-80" />
            )}

            {/* Right Actions */}
            <div className="absolute right-3 bottom-28 flex flex-col gap-5 items-center z-20">
              {/* Creator */}
              <button onClick={() => handleFollow(short.authorId)} className="relative group">
                <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {short.authorAvatar ? (
                    <img src={short.authorAvatar} alt="" className="w-full h-full object-cover" />
                  ) : short.authorName.charAt(0).toUpperCase()}
                </div>
                {short.authorId !== user?.id && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[var(--primary)] rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </button>

              {/* Like */}
              <button onClick={() => handleLike(short.id)} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLiked ? "bg-red-500/20" : "bg-white/10"} backdrop-blur-sm`}>
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                </div>
                <span className="text-[11px] font-medium">{formatNumber(short.likes.length)}</span>
              </button>

              {/* Comments */}
              <button onClick={() => setCommentDrawer(short.id)} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{short.comments.length}</span>
              </button>

              {/* Save */}
              <button onClick={() => handleSave(short.id)} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSaved ? "bg-yellow-500/20" : "bg-white/10"} backdrop-blur-sm`}>
                  <Bookmark className={`w-5 h-5 ${isSaved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
                </div>
                <span className="text-[11px] font-medium">Save</span>
              </button>

              {/* Share */}
              <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Share</span>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 bg-gradient-to-t from-black via-black/60 to-transparent z-10">
              <p className="font-bold text-sm mb-1">@{short.authorName}</p>
              <p className="text-sm text-white/80 line-clamp-2">{short.caption}</p>
            </div>
          </div>
        );
      })}

      {/* Comment Drawer */}
      {commentDrawer && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setCommentDrawer(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-h-[60vh] bg-[var(--card)] rounded-t-3xl flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-bold text-[var(--foreground)]">Comments ({shorts.find((s) => s.id === commentDrawer)?.comments.length || 0})</h3>
              <button onClick={() => setCommentDrawer(null)} className="p-1 rounded-full hover:bg-[var(--muted)]"><X className="w-5 h-5 text-[var(--foreground)]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
              {shorts.find((s) => s.id === commentDrawer)?.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs flex-shrink-0">
                    {c.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground)]"><span className="font-semibold">{c.userName}</span> {c.content}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {shorts.find((s) => s.id === commentDrawer)?.comments.length === 0 && (
                <p className="text-center text-sm text-[var(--muted-foreground)] py-8">No comments yet. Be the first!</p>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddComment(commentDrawer); }} className="p-4 border-t border-[var(--border)] flex gap-2">
              <input type="text" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 bg-[var(--muted)] rounded-full px-4 py-2.5 text-sm outline-none text-[var(--foreground)]" />
              <button type="submit" disabled={!commentText.trim()} className="p-2.5 bg-[var(--primary)] text-white rounded-full disabled:opacity-40"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

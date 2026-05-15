"use client";

import Link from "next/link";
import { Heart, BookmarkPlus, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { useAppStore, BlogPost } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Technology", "Design", "Business", "Programming", "Productivity", "Science"];

export default function BlogPage() {
  const blogs = useAppStore((s) => s.blogs);
  const setBlogs = useAppStore((s) => s.setBlogs);
  const user = useAppStore((s) => s.user);
  const likeBlog = useAppStore((s) => s.likeBlog);
  const bookmarkBlog = useAppStore((s) => s.bookmarkBlog);
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (name, avatar_url)
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data && !error) {
        const formattedBlogs: BlogPost[] = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          content: b.content || "",
          coverImage: b.image_url || "",
          authorId: b.author_id,
          authorName: b.profiles?.name || "Unknown",
          authorAvatar: b.profiles?.avatar_url || "",
          likes: b.likes || [],
          bookmarks: [],
          comments: [],
          category: b.category || "General",
          published: b.published,
          createdAt: b.created_at,
        }));
        setBlogs(formattedBlogs);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, [setBlogs]);

  const filteredBlogs = activeCategory === "All"
    ? blogs
    : blogs.filter((b) => b.category === activeCategory);

  if (loading && blogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const featuredBlog = filteredBlogs[0];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in space-y-10 pb-24">
      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">Ideas, stories, and expertise from the community.</p>
          </div>
          <button onClick={() => router.push(user ? "/blog/create" : "/auth")} className="bg-[var(--primary)] text-white px-5 py-2 rounded-full font-semibold text-sm shadow-md shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity active:scale-95">
            Write
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar text-sm">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-1.5 rounded-full font-medium transition-all ${activeCategory === cat ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Featured */}
      {featuredBlog && (
        <section className="group">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-[10px]">
                  {featuredBlog.authorName.charAt(0)}
                </div>
                <span className="font-semibold">{featuredBlog.authorName}</span>
              </div>
              <h2 className="text-2xl font-bold leading-tight group-hover:text-[var(--primary)] transition-colors">{featuredBlog.title}</h2>
              <p className="text-[var(--muted-foreground)] line-clamp-2 text-sm">{featuredBlog.content.replace(/<[^>]*>/g, "")}</p>
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-2">
                <div className="flex items-center gap-3">
                  <span>{new Date(featuredBlog.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">{featuredBlog.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => user && likeBlog(featuredBlog.id, user.id)} className={`flex items-center gap-1 transition-colors ${user && featuredBlog.likes.includes(user.id) ? "text-red-500" : "hover:text-red-500"}`}>
                    <Heart className={`w-4 h-4 ${user && featuredBlog.likes.includes(user.id) ? "fill-red-500" : ""}`} />{featuredBlog.likes.length}
                  </button>
                  <button onClick={() => user && bookmarkBlog(featuredBlog.id, user.id)} className={`transition-colors ${user && featuredBlog.bookmarks.includes(user.id) ? "text-[var(--primary)]" : "hover:text-[var(--primary)]"}`}>
                    <BookmarkPlus className={`w-4 h-4 ${user && featuredBlog.bookmarks.includes(user.id) ? "fill-[var(--primary)]" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
            {featuredBlog.coverImage && (
              <div className="order-1 md:order-2 overflow-hidden rounded-xl border border-[var(--border)]">
                <img src={featuredBlog.coverImage} alt={featuredBlog.title} className="w-full h-[200px] md:h-[250px] object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feed */}
      <section className="border-t border-[var(--border)] pt-8 space-y-8">
        {filteredBlogs.slice(1).map((blog) => (
          <article key={blog.id} className="flex flex-col md:flex-row gap-6 items-start group">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-[8px]">{blog.authorName.charAt(0)}</div>
                <span className="font-medium">{blog.authorName}</span>
              </div>
              <h2 className="text-lg font-bold leading-tight group-hover:text-[var(--primary)] transition-colors">{blog.title}</h2>
              <p className="text-[var(--muted-foreground)] text-sm line-clamp-2">{blog.content.replace(/<[^>]*>/g, "")}</p>
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-1">
                <div className="flex items-center gap-3">
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{blog.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => user && likeBlog(blog.id, user.id)} className={`flex items-center gap-1 transition-colors ${user && blog.likes.includes(user.id) ? "text-red-500" : "hover:text-red-500"}`}>
                    <Heart className={`w-3.5 h-3.5 ${user && blog.likes.includes(user.id) ? "fill-red-500" : ""}`} />{blog.likes.length}
                  </button>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{blog.comments.length}</span>
                  <button onClick={() => user && bookmarkBlog(blog.id, user.id)} className={`transition-colors ${user && blog.bookmarks.includes(user.id) ? "text-[var(--primary)]" : "hover:text-[var(--primary)]"}`}>
                    <BookmarkPlus className={`w-3.5 h-3.5 ${user && blog.bookmarks.includes(user.id) ? "fill-[var(--primary)]" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
            {blog.coverImage && (
              <div className="w-full md:w-[180px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-[120px] object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
          </article>
        ))}

        {filteredBlogs.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-sm mb-3">No posts found</p>
            <Link href="/blog/create" className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center justify-center gap-1">
              Write your first post <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

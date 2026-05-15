"use client";

import { useState, useRef } from "react";
import { useAppStore, generateId } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Send, X, Bold, Italic, List, Heading, ArrowLeft } from "lucide-react";

const CATEGORIES = ["Technology", "Design", "Business", "Programming", "Productivity", "Science"];

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addBlog = useAppStore((s) => s.addBlog);
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let formatted = "";
    switch (format) {
      case "bold": formatted = `**${selected || "bold text"}**`; break;
      case "italic": formatted = `*${selected || "italic text"}*`; break;
      case "heading": formatted = `\n## ${selected || "Heading"}\n`; break;
      case "list": formatted = `\n- ${selected || "List item"}\n`; break;
      default: formatted = selected;
    }
    setContent(content.substring(0, start) + formatted + content.substring(end));
  };

  const handlePublish = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setPublishing(true);

    try {
      const { data, error } = await supabase.from("blogs").insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        image_url: coverImage,
        category,
        published: true,
      }).select();

      if (error) throw error;
      
      if (data?.[0]) {
        addBlog({
          id: data[0].id,
          title: data[0].title,
          content: data[0].content,
          coverImage: data[0].image_url,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          createdAt: data[0].created_at,
          likes: [],
          bookmarks: [],
          comments: [],
          category: data[0].category,
          published: true,
        });
      }

      toast.success("Blog post published!");
      router.push("/blog");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish blog");
    } finally {
      setPublishing(false);
    }
  };

  const handleDraft = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!title.trim()) { toast.error("Add a title first"); return; }
    
    try {
      const { error } = await supabase.from("blogs").insert({
        author_id: user.id,
        title: title.trim(),
        content,
        image_url: coverImage,
        category,
        published: false,
      });

      if (error) throw error;
      toast.success("Draft saved");
      router.push("/blog");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-6 border-b border-[var(--border)] pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleDraft} className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-[var(--muted)] transition-colors">Save Draft</button>
          <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-md shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50">
            {publishing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cover Image */}
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
        {coverImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
            <img src={coverImage} alt="Cover" className="w-full h-48 md:h-64 object-cover" />
            <button onClick={() => setCoverImage("")} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full h-40 md:h-52 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--muted)] transition-colors group">
            <ImagePlus className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors mb-2" />
            <span className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">Add cover image</span>
          </button>
        )}

        {/* Title */}
        <input type="text" placeholder="Article title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-3xl md:text-4xl font-bold bg-transparent outline-none placeholder:text-[var(--muted-foreground)]/40" />

        {/* Meta */}
        <div className="flex flex-wrap gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[var(--muted)] rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Toolbar */}
        <div className="flex gap-1 border-b border-[var(--border)] pb-3">
          {[
            { icon: Bold, action: "bold" },
            { icon: Italic, action: "italic" },
            { icon: Heading, action: "heading" },
            { icon: List, action: "list" },
          ].map((tool) => (
            <button key={tool.action} onClick={() => insertFormatting(tool.action)} className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" title={tool.action}>
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Content */}
        <textarea id="blog-content" placeholder="Tell your story..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-[400px] text-lg leading-relaxed bg-transparent outline-none resize-y placeholder:text-[var(--muted-foreground)]/40" />
      </div>
    </div>
  );
}

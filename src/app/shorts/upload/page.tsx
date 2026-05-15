"use client";

import { useState, useRef } from "react";
import { useAppStore, generateId } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Video, X, Upload, ArrowLeft } from "lucide-react";

export default function UploadShortsPage() {
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addShort = useAppStore((s) => s.addShort);
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File too large. Max 100MB.");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !user) { toast.error("Please select a video and sign in"); return; }
    if (!caption.trim()) { toast.error("Please add a caption"); return; }

    setUploading(true);

    try {
      // 1. Upload to Storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shorts')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shorts')
        .getPublicUrl(fileName);

      // 3. Insert into Database
      const { data, error } = await supabase.from("shorts").insert({
        author_id: user.id,
        caption: caption.trim(),
        video_url: publicUrl,
        thumbnail_url: "", // In a real app, we'd generate a thumbnail
        shares_count: 0,
      }).select();

      if (error) throw error;

      if (data?.[0]) {
        addShort({
          id: data[0].id,
          url: data[0].video_url,
          thumbnail: data[0].thumbnail_url,
          caption: data[0].caption,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          likes: [],
          comments: [],
          shares: 0,
          saves: [],
          createdAt: data[0].created_at,
        });
      }

      toast.success("Short uploaded!");
      router.push("/shorts");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 md:p-8 animate-fade-in pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg font-bold">Upload Short</h1>
        <div className="w-16" />
      </div>

      <div className="space-y-6">
        <input type="file" ref={fileRef} accept="video/*" className="hidden" onChange={handleFileUpload} />

        {videoPreview ? (
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-black">
            <video src={videoPreview} className="w-full h-[400px] object-contain" autoPlay loop muted playsInline />
            <button onClick={() => setVideoPreview("")} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full h-[350px] border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--muted)]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--muted)] transition-colors group">
            <Video className="w-12 h-12 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors mb-3" />
            <span className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">Select Video</span>
            <span className="text-xs text-[var(--muted-foreground)]/60 mt-1">MP4, WebM up to 100MB</span>
          </button>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Caption</label>
          <textarea placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[var(--primary)] resize-y min-h-[100px] text-sm transition-all" />
        </div>

        <button onClick={handleUpload} disabled={uploading || !videoPreview} className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl font-semibold shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2">
          {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
          Post Short
        </button>
      </div>
    </div>
  );
}

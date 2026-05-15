"use client";

import { useState, useRef } from "react";
import { useAppStore, generateId } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, X, Save, Plus, Trash2, ArrowLeft, GripVertical } from "lucide-react";

export default function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [modules, setModules] = useState([{ id: generateId(), title: "", lessons: [{ id: generateId(), title: "", description: "", content: "", videoUrl: "", duration: "0", isCompleted: false }] }]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addCourse = useAppStore((s) => s.addCourse);
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  };

  const addModule = () => {
    setModules([...modules, { id: generateId(), title: "", lessons: [{ id: generateId(), title: "", description: "", content: "", videoUrl: "", duration: "0", isCompleted: false }] }]);
  };

  const removeModule = (idx: number) => {
    if (modules.length <= 1) return;
    setModules(modules.filter((_, i) => i !== idx));
  };

  const updateModuleTitle = (idx: number, val: string) => {
    const updated = [...modules];
    updated[idx].title = val;
    setModules(updated);
  };

  const addLesson = (moduleIdx: number) => {
    const updated = [...modules];
    updated[moduleIdx].lessons.push({ id: generateId(), title: "", description: "", content: "", videoUrl: "", duration: "0", isCompleted: false });
    setModules(updated);
  };

  const updateLesson = (moduleIdx: number, lessonIdx: number, field: string, val: string | number) => {
    const updated = [...modules];
    (updated[moduleIdx].lessons[lessonIdx] as any)[field] = val;
    setModules(updated);
  };

  const removeLesson = (moduleIdx: number, lessonIdx: number) => {
    const updated = [...modules];
    if (updated[moduleIdx].lessons.length <= 1) return;
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setModules(updated);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) { toast.error("Title and description are required"); return; }
    const validModules = modules.filter((m) => m.title.trim());
    if (validModules.length === 0) { toast.error("At least one module with a title is required"); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    addCourse({
      id: generateId(), title: title.trim(), description: description.trim(),
      thumbnail: thumbnailPreview, authorId: user?.id || "", authorName: user?.name || "",
      modules: validModules.map((m) => ({
        ...m, lessons: m.lessons.filter((l) => l.title.trim()).map((l) => ({ 
          id: l.id,
          title: l.title.trim(),
          duration: l.duration.toString(),
          content: l.content || l.description,
          videoUrl: l.videoUrl,
          isCompleted: false
        })),
      })),
      enrolledUsers: [], price: 0, rating: 0, students: 0,
      createdAt: new Date().toISOString(),
    });

    toast.success("Course published!");
    setSaving(false);
    router.push("/course");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-6 border-b border-[var(--border)] pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-md shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Publish Course
        </button>
      </div>

      <div className="space-y-8">
        {/* Thumbnail */}
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
        {thumbnailPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
            <img src={thumbnailPreview} className="w-full h-48 md:h-56 object-cover" alt="Thumbnail" />
            <button onClick={() => setThumbnailPreview("")} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full h-44 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--muted)] transition-colors group">
            <ImagePlus className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] mb-2" />
            <span className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">Upload Thumbnail</span>
          </button>
        )}

        {/* Details */}
        <div className="space-y-4">
          <input type="text" placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl md:text-3xl font-bold bg-transparent outline-none placeholder:text-[var(--muted-foreground)]/40 border-b border-[var(--border)] pb-2 focus:border-[var(--primary)] transition-colors" />
          <textarea placeholder="Course Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[100px] text-base bg-transparent outline-none resize-y placeholder:text-[var(--muted-foreground)]/40 border-b border-[var(--border)] pb-2 focus:border-[var(--primary)] transition-colors" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[var(--muted)] rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-[var(--primary)]">
            {["Web Development", "Data Science", "Machine Learning", "UI/UX Design", "Mobile Development", "Cloud Computing"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Modules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Curriculum</h2>
            <button onClick={addModule} className="flex items-center gap-1 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity font-medium">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          </div>

          {modules.map((mod, mi) => (
            <div key={mod.id} className="border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--muted)]/50">
                <span className="text-sm font-bold text-[var(--primary)]">Module {mi + 1}</span>
                <input type="text" placeholder="Module Title" value={mod.title} onChange={(e) => updateModuleTitle(mi, e.target.value)} className="flex-1 bg-transparent outline-none font-semibold text-sm" />
                {modules.length > 1 && (
                  <button onClick={() => removeModule(mi)} className="p-1.5 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="p-4 space-y-3">
                {mod.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-start gap-3 p-3 bg-[var(--muted)]/30 rounded-xl">
                    <span className="text-xs font-bold text-[var(--muted-foreground)] pt-2">{li + 1}</span>
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Lesson Title" value={lesson.title} onChange={(e) => updateLesson(mi, li, "title", e.target.value)} className="w-full bg-transparent outline-none font-medium text-sm" />
                      <input type="text" placeholder="Description (optional)" value={lesson.description} onChange={(e) => updateLesson(mi, li, "description", e.target.value)} className="w-full bg-transparent outline-none text-xs text-[var(--muted-foreground)]" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="Video URL" value={lesson.videoUrl} onChange={(e) => updateLesson(mi, li, "videoUrl", e.target.value)} className="flex-1 bg-[var(--muted)] rounded-lg px-3 py-1.5 text-xs outline-none" />
                        <input type="number" placeholder="Min" value={lesson.duration || ""} onChange={(e) => updateLesson(mi, li, "duration", e.target.value)} className="w-16 bg-[var(--muted)] rounded-lg px-2 py-1.5 text-xs outline-none text-center" />
                      </div>
                    </div>
                    {mod.lessons.length > 1 && (
                      <button onClick={() => removeLesson(mi, li)} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => addLesson(mi)} className="w-full py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-xl transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

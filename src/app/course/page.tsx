"use client";

import Link from "next/link";
import { PlayCircle, Star, Clock, Award, ChevronRight, Search, BookOpen, Users } from "lucide-react";
import { useAppStore, Course } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const TOPICS = ["Web Development", "Data Science", "Machine Learning", "UI/UX Design", "Mobile Development", "Cloud Computing", "Cybersecurity", "Blockchain"];

export default function CoursePage() {
  const courses = useAppStore((s) => s.courses);
  const setCourses = useAppStore((s) => s.setCourses);
  const user = useAppStore((s) => s.user);
  const enrollCourse = useAppStore((s) => s.enrollCourse);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const formattedCourses: Course[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || "",
          thumbnail: c.image_url || "",
          authorId: "system",
          authorName: c.instructor || "Expert",
          price: 0,
          rating: Number(c.rating) || 5.0,
          students: (c.enrolled_users || []).length,
          modules: [], // We can fetch lessons separately or as a join
          enrolledUsers: c.enrolled_users || [],
          createdAt: c.created_at,
        }));
        setCourses(formattedCourses);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [setCourses]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      const newEnrolledUsers = [...course.enrolledUsers, user.id];
      const { error } = await supabase
        .from("courses")
        .update({ enrolled_users: newEnrolledUsers })
        .eq("id", courseId);

      if (error) throw error;

      enrollCourse(courseId, user.id);
      toast.success("Enrolled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll");
    }
  };

  const enrolledCourses = courses.filter((c) => user && c.enrolledUsers.includes(user.id));
  const availableCourses = courses;

  if (loading && courses.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-fade-in pb-24">
      {/* Hero */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 bg-[var(--primary)] text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Master new skills</h1>
          <p className="text-white/70 mb-6">Create and explore courses. Track your learning progress.</p>
          <div className="flex gap-3">
            <button onClick={() => router.push(user ? "/course/create" : "/auth")} className="bg-white text-[var(--primary)] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors active:scale-95">
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* My Learning */}
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[var(--primary)]" /> Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => {
              const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
              const completedLessons = course.modules.reduce((a, m) => a + m.lessons.filter((l) => l.isCompleted).length, 0);
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              return (
                <div key={course.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden card-hover">
                  {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 line-clamp-1">{course.title}</h3>
                    <div className="w-full h-2 bg-[var(--muted)] rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{progress}% complete · {completedLessons}/{totalLessons} lessons</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All Courses */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">All Courses</h2>
          <button onClick={() => router.push("/course/create")} className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
            Create <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => {
              const isEnrolled = user && course.enrolledUsers.includes(user.id);
              return (
                <div key={course.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden card-hover flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center"><BookOpen className="w-10 h-10 text-[var(--primary)]/30" /></div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">{course.description}</p>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.modules.length} modules</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolledUsers.length} enrolled</span>
                      </div>
                      <button onClick={() => !isEnrolled && handleEnroll(course.id)} disabled={!!isEnrolled} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${isEnrolled ? "bg-[var(--muted)] text-[var(--muted-foreground)]" : "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 hover:opacity-90"}`}>
                        {isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-2xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-3">No courses yet</p>
            <button onClick={() => router.push("/course/create")} className="text-sm font-semibold text-[var(--primary)] hover:underline">Create your first course</button>
          </div>
        )}
      </section>

      {/* Topics */}
      <section>
        <h2 className="text-xl font-bold mb-4">Explore Topics</h2>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <span key={topic} className="px-4 py-2 rounded-full bg-[var(--muted)] text-sm font-medium hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors cursor-pointer">{topic}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

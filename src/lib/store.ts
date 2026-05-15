import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ───── Types ─────

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
  bio: string;
  followers: string[];
  following: string[];
  createdAt: string;
};

export type BlogComment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: string[];
  bookmarks: string[];
  comments: BlogComment[];
  category: string;
  published: boolean;
  createdAt: string;
};

export type ShortComment = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

export type ShortVideo = {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: string[];
  comments: ShortComment[];
  shares: number;
  saves: string[];
  createdAt: string;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: string;
  videoUrl?: string;
  isCompleted: boolean;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  authorId: string;
  authorName: string;
  price: number;
  rating: number;
  students: number;
  modules: Module[];
  enrolledUsers: string[];
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
  type: 'text' | 'image' | 'video';
  reactions: { emoji: string; userId: string }[];
};

export type ChatThread = {
  id: string;
  participants: { id: string; name: string; avatar: string; online: boolean }[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unread: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  isPinned: boolean;
  typingUsers: string[];
};

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'course' | 'message' | 'system';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  message: string;
  targetId?: string;
  targetType?: 'blog' | 'short' | 'course' | 'chat';
  read: boolean;
  createdAt: string;
};

export type UserSettings = {
  notifications: boolean;
  emailNotifications: boolean;
  messageNotifications: boolean;
  privateAccount: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  twoFactorEnabled: boolean;
};

// ───── Seed Data ─────

const SEED_BLOGS: BlogPost[] = [
  {
    id: "seed-blog-1",
    title: "The Future of Digital Ecosystems",
    content: "Digital ecosystems are evolving faster than ever. In this post, we explore how integrated platforms like ETEMBE are shaping the future of productivity and social interaction. From seamless media sharing to advanced learning modules, the boundaries between different digital services are blurring...",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072",
    authorId: "system",
    authorName: "ETEMBE Editorial",
    authorAvatar: "",
    likes: ["1", "2"],
    bookmarks: [],
    comments: [],
    category: "Technology",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-blog-2",
    title: "Mastering Modern Design Systems",
    content: "Design systems are the backbone of consistent user experiences. Learn how to build scalable, accessible, and beautiful interfaces that wow users. We'll cover everything from color theory and typography to component architecture and developer handoff...",
    coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1964",
    authorId: "system",
    authorName: "Creative Labs",
    authorAvatar: "",
    likes: ["3", "4", "5"],
    bookmarks: [],
    comments: [],
    category: "Design",
    published: true,
    createdAt: new Date().toISOString(),
  }
];

const SEED_SHORTS: ShortVideo[] = [
  {
    id: "seed-short-1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-23214-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070",
    caption: "The rhythm of the night 🌃✨ #dance #neon #vibes",
    authorId: "creator-1",
    authorName: "NeonVibe",
    authorAvatar: "",
    likes: ["10", "11", "12"],
    comments: [],
    shares: 42,
    saves: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-short-2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-14788-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2071",
    caption: "Autumn colors are just different 🍂🧡 #nature #autumn #peace",
    authorId: "creator-2",
    authorName: "NatureGraph",
    authorAvatar: "",
    likes: ["20", "21"],
    comments: [],
    shares: 15,
    saves: [],
    createdAt: new Date().toISOString(),
  }
];

const SEED_COURSES: Course[] = [
  {
    id: "seed-course-1",
    title: "Full-Stack Development Masterclass",
    description: "Go from zero to hero in modern web development. Learn React, Next.js, Node.js, and more with hands-on projects and professional guidance.",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072",
    authorId: "edu-1",
    authorName: "Tech Academy",
    price: 99,
    rating: 4.8,
    students: 1250,
    modules: [
      {
        id: "m1",
        title: "Introduction to Web Tech",
        lessons: [
          { id: "l1", title: "History of the Web", duration: "10m", content: "Brief history of the internet...", isCompleted: false },
          { id: "l2", title: "How Browsers Work", duration: "15m", content: "Rendering engines and JS runtime...", isCompleted: false },
        ]
      }
    ],
    enrolledUsers: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-course-2",
    title: "Digital Marketing Fundamentals",
    description: "Learn the secrets of growing your brand online. Cover SEO, SEM, social media marketing, and data-driven strategy for the modern era.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015",
    authorId: "edu-2",
    authorName: "Growth Experts",
    price: 49,
    rating: 4.5,
    students: 850,
    modules: [],
    enrolledUsers: [],
    createdAt: new Date().toISOString(),
  }
];

// ───── Store ─────

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Content
  blogs: BlogPost[];
  shorts: ShortVideo[];
  courses: Course[];
  chats: ChatThread[];
  notifications: Notification[];

  // Settings
  settings: UserSettings;

  // Online users (socket-driven)
  onlineUsers: string[];

  // Auth actions
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Blog actions
  addBlog: (blog: BlogPost) => void;
  updateBlog: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (blogId: string, userId: string) => void;
  bookmarkBlog: (blogId: string, userId: string) => void;
  addBlogComment: (blogId: string, comment: BlogComment) => void;

  // Shorts actions
  addShort: (short: ShortVideo) => void;
  deleteShort: (id: string) => void;
  likeShort: (shortId: string, userId: string) => void;
  saveShort: (shortId: string, userId: string) => void;
  addShortComment: (shortId: string, comment: ShortComment) => void;

  // Course actions
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  enrollCourse: (courseId: string, userId: string) => void;
  completeLesson: (courseId: string, moduleId: string, lessonId: string) => void;

  // Chat actions
  addChat: (chat: ChatThread) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  markChatRead: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  addReaction: (chatId: string, messageId: string, emoji: string, userId: string) => void;

  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Settings actions
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Social
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;

  // Online users
  setOnlineUsers: (users: string[]) => void;
  
  // Set data
  setBlogs: (blogs: BlogPost[]) => void;
  setCourses: (courses: Course[]) => void;
  setShorts: (shorts: ShortVideo[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state with Seed Data
      user: null,
      isAuthenticated: false,
      authLoading: false,
      blogs: SEED_BLOGS,
      shorts: SEED_SHORTS,
      courses: SEED_COURSES,
      chats: [],
      notifications: [],
      onlineUsers: [],
      settings: {
        notifications: true,
        emailNotifications: true,
        messageNotifications: true,
        privateAccount: false,
        theme: 'dark',
        language: 'en',
        twoFactorEnabled: false,
      },

      // ─── Setters ───
      setBlogs: (blogs) => set({ blogs }),
      setCourses: (courses) => set({ courses }),
      setShorts: (shorts) => set({ shorts }),

      // ─── Auth ───
      login: (user) => set({ user, isAuthenticated: true }),
      signup: (user) => set({ user, isAuthenticated: true }),
      // CRITICAL: logout should NOT clear global content like blogs, shorts, courses
      logout: () => set({ user: null, isAuthenticated: false, chats: [], notifications: [] }),
      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),

      // ─── Blogs ───
      addBlog: (blog) => set((s) => ({ blogs: [blog, ...s.blogs] })),
      updateBlog: (id, updates) =>
        set((s) => ({
          blogs: s.blogs.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteBlog: (id) =>
        set((s) => ({ blogs: s.blogs.filter((b) => b.id !== id) })),
      likeBlog: (blogId, userId) =>
        set((s) => ({
          blogs: s.blogs.map((b) => {
            if (b.id !== blogId) return b;
            const likes = b.likes.includes(userId)
              ? b.likes.filter((id) => id !== userId)
              : [...b.likes, userId];
            return { ...b, likes };
          }),
        })),
      bookmarkBlog: (blogId, userId) =>
        set((s) => ({
          blogs: s.blogs.map((b) => {
            if (b.id !== blogId) return b;
            const bookmarks = b.bookmarks.includes(userId)
              ? b.bookmarks.filter((id) => id !== userId)
              : [...b.bookmarks, userId];
            return { ...b, bookmarks };
          }),
        })),
      addBlogComment: (blogId, comment) =>
        set((s) => ({
          blogs: s.blogs.map((b) =>
            b.id === blogId ? { ...b, comments: [...b.comments, comment] } : b
          ),
        })),

      // ─── Shorts ───
      addShort: (short) => set((s) => ({ shorts: [short, ...s.shorts] })),
      deleteShort: (id) =>
        set((s) => ({ shorts: s.shorts.filter((s) => s.id !== id) })),
      likeShort: (shortId, userId) =>
        set((s) => ({
          shorts: s.shorts.map((sh) => {
            if (sh.id !== shortId) return sh;
            const likes = sh.likes.includes(userId)
              ? sh.likes.filter((id) => id !== userId)
              : [...sh.likes, userId];
            return { ...sh, likes };
          }),
        })),
      saveShort: (shortId, userId) =>
        set((s) => ({
          shorts: s.shorts.map((sh) => {
            if (sh.id !== shortId) return sh;
            const saves = sh.saves.includes(userId)
              ? sh.saves.filter((id) => id !== userId)
              : [...sh.saves, userId];
            return { ...sh, saves };
          }),
        })),
      addShortComment: (shortId, comment) =>
        set((s) => ({
          shorts: s.shorts.map((sh) =>
            sh.id === shortId ? { ...sh, comments: [...sh.comments, comment] } : sh
          ),
        })),

      // ─── Courses ───
      addCourse: (course) => set((s) => ({ courses: [course, ...s.courses] })),
      updateCourse: (id, updates) =>
        set((s) => ({
          courses: s.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCourse: (id) =>
        set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),
      enrollCourse: (courseId, userId) =>
        set((s) => ({
          courses: s.courses.map((c) => {
            if (c.id !== courseId) return c;
            if (c.enrolledUsers.includes(userId)) return c;
            return {
              ...c,
              enrolledUsers: [...c.enrolledUsers, userId],
              students: c.students + 1,
            };
          }),
        })),
      completeLesson: (courseId, moduleId, lessonId) =>
        set((s) => ({
          courses: s.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              modules: c.modules.map((m) => {
                if (m.id !== moduleId) return m;
                return {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, isCompleted: true } : l
                  ),
                };
              }),
            };
          }),
        })),

      // ─── Chat ───
      addChat: (chat) => set((s) => ({ chats: [chat, ...s.chats] })),
      deleteChat: (chatId) =>
        set((s) => ({ chats: s.chats.filter((c) => c.id !== chatId) })),
      addMessage: (chatId, message) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  lastMessage: message,
                  unread: c.unread + (message.senderId !== s.user?.id ? 1 : 0),
                }
              : c
          ),
        })),
      markChatRead: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c)),
        })),
      pinChat: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c)),
        })),
      setTyping: (chatId, userId, isTyping) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const typingUsers = isTyping
              ? [...new Set([...c.typingUsers, userId])]
              : c.typingUsers.filter((id) => id !== userId);
            return { ...c, typingUsers };
          }),
        })),
      addReaction: (chatId, messageId, emoji, userId) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== messageId) return m;
                const reactions = m.reactions.some((r) => r.userId === userId && r.emoji === emoji)
                  ? m.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji))
                  : [...m.reactions, { emoji, userId }];
                return { ...m, reactions };
              }),
            };
          }),
        })),

      // ─── Notifications ───
      addNotification: (notification) =>
        set((s) => ({ notifications: [notification, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // ─── Settings ───
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      // ─── Social ───
      followUser: (targetUserId) =>
        set((s) => ({
          user: s.user
            ? { ...s.user, following: [...s.user.following, targetUserId] }
            : null,
        })),
      unfollowUser: (targetUserId) =>
        set((s) => ({
          user: s.user
            ? { ...s.user, following: s.user.following.filter((u) => u !== targetUserId) }
            : null,
        })),

      // ─── Online ───
      setOnlineUsers: (users) => set({ onlineUsers: users }),
    }),
    {
      name: 'etembe-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        blogs: state.blogs,
        shorts: state.shorts,
        courses: state.courses,
        chats: state.chats,
        notifications: state.notifications,
        settings: state.settings,
      }),
    }
  )
);

// ───── Utilities ─────

export const generateId = () => Math.random().toString(36).substring(2, 15);

export const formatTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

export const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

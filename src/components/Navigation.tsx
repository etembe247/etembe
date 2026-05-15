"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  PlaySquare,
  FileText,
  BookOpen,
  User,
  Bell,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useSocket } from "@/components/SocketProvider";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Chat", path: "/chat", icon: MessageSquare },
  { name: "Shorts", path: "/shorts", icon: PlaySquare },
  { name: "Blog", path: "/blog", icon: FileText },
  { name: "Learn", path: "/course", icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const notifications = useAppStore((s) => s.notifications);
  const chats = useAppStore((s) => s.chats);
  const { isConnected } = useSocket();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const totalUnreadChats = chats.reduce((acc, c) => acc + c.unread, 0);

  // Don't show nav on auth page or if not authenticated
  if (pathname.startsWith("/auth") || !isAuthenticated) return null;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-[var(--border)] bg-[var(--card)] h-screen sticky top-0 py-6 px-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 mb-8 group">
          <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-lg shadow-[var(--primary)]/20 group-hover:shadow-[var(--primary)]/40 transition-shadow">
            E
          </div>
          <span className="font-bold text-xl tracking-tight">ETEMBE</span>
        </Link>

        {/* Search */}
        <div className="px-1 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[var(--muted)] text-[var(--foreground)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)] transition-all"
            />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            const showBadge = item.name === "Chat" && totalUnreadChats > 0;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm relative",
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
                {showBadge && (
                  <span className="ml-auto bg-[var(--destructive)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {totalUnreadChats}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 pt-4 border-t border-[var(--border)] px-1 mt-auto">
          {isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm relative",
                  pathname === "/notifications"
                    ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                )}
              >
                <Bell className="w-5 h-5" />
                Notifications
                {unreadNotifs > 0 && (
                  <span className="ml-auto bg-[var(--destructive)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm",
                  pathname === "/settings"
                    ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                )}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>

              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl transition-all cursor-pointer hover:bg-[var(--muted)] group"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--muted)] overflow-hidden border-2 border-transparent group-hover:border-[var(--primary)]/30 transition-colors flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold leading-none truncate">{user.name}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-[var(--success)]" : "bg-[var(--destructive)]")} />
                      <span className="text-[11px] text-[var(--muted-foreground)] truncate">
                        {isConnected ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-all active:scale-95 mb-2"
            >
              Join ETEMBE
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass safe-area-bottom z-50">
        <div className="flex items-center justify-around px-1 py-1.5">
           {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            const showBadge = item.name === "Chat" && totalUnreadChats > 0;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] active:scale-95"
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_var(--primary)]")}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 bg-[var(--destructive)] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalUnreadChats > 9 ? "9+" : totalUnreadChats}
                    </span>
                  )}
                </div>
                <span
                  className={cn("text-[10px] font-medium", isActive && "font-semibold")}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-5 h-[3px] bg-[var(--primary)] rounded-full" />
                )}
              </Link>
            );
          })}
          <Link
            href={isAuthenticated ? "/profile" : "/auth"}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative",
              pathname === "/profile" || pathname === "/auth"
                ? "text-[var(--primary)]"
                : "text-[var(--muted-foreground)] active:scale-95"
            )}
          >
            <User className="w-6 h-6" strokeWidth={pathname === "/profile" ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{isAuthenticated ? "Profile" : "Join"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

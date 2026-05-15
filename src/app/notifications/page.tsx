"use client";

import { Bell, Heart, MessageSquare, UserPlus, PlayCircle, CheckCircle2, MoreHorizontal, Trash2 } from "lucide-react";
import { useAppStore, formatTime } from "@/lib/store";
import { useState } from "react";

const FILTERS = ["All", "Unread", "Mentions", "Follows", "Likes"];

export default function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Mentions") return n.type === "mention";
    if (activeFilter === "Follows") return n.type === "follow";
    if (activeFilter === "Likes") return n.type === "like";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconMap: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
    like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
    comment: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    mention: { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
    course: { icon: PlayCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
    message: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    system: { icon: Bell, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in pb-24">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-[var(--muted-foreground)] mt-1 text-sm">Stay updated with your community.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead} className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-sm font-medium text-[var(--destructive)] hover:underline flex items-center gap-1 ml-3">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === f ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            {f}{f === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1">When you get notifications, they'll appear here</p>
          </div>
        ) : filtered.map((notif) => {
          const { icon: Icon, color, bg } = iconMap[notif.type] || iconMap.system;
          return (
            <button key={notif.id} onClick={() => markNotificationRead(notif.id)} className={`flex gap-3 p-4 rounded-2xl border transition-all cursor-pointer group w-full text-left ${notif.read ? "bg-[var(--card)] border-transparent hover:bg-[var(--muted)]" : "bg-[var(--primary)]/5 border-[var(--primary)]/15 hover:bg-[var(--primary)]/10"}`}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                  {notif.fromUserAvatar ? <img src={notif.fromUserAvatar} className="w-full h-full rounded-full object-cover" alt="" /> : notif.fromUserName.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--background)] flex items-center justify-center ${bg}`}>
                  <Icon className={`w-2.5 h-2.5 ${color}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight">{notif.message}</p>
                <span className={`text-xs mt-1 block ${notif.read ? "text-[var(--muted-foreground)]" : "text-[var(--primary)] font-semibold"}`}>{formatTime(notif.createdAt)}</span>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

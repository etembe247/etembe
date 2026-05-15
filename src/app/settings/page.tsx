"use client";

import { User, Bell, Lock, Palette, Globe, Shield, CreditCard, LogOut, ChevronRight, Mail, Key, Smartphone, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();

  const [nameParts, setNameParts] = useState((user?.name || "").split(" "));
  const [bio, setBio] = useState(user?.bio || "");
  const [activeTab, setActiveTab] = useState("Account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");

  const handleSave = () => {
    updateUser({ name: `${nameParts[0] || ""} ${nameParts.slice(1).join(" ") || ""}`.trim(), bio });
    toast.success("Settings saved");
  };

  const handleLogout = () => { logout(); toast.success("Logged out"); router.push("/auth"); };

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    toast.success("Password updated successfully");
    setShowChangePassword(false);
    setCurrentPassword(""); setNewPassword("");
  };

  const handleEmailChange = () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { toast.error("Enter a valid email"); return; }
    updateUser({ email: newEmail });
    toast.success("Email updated");
    setShowChangeEmail(false);
  };

  const tabs = [
    { name: "Account", icon: User },
    { name: "Notifications", icon: Bell },
    { name: "Privacy", icon: Lock },
    { name: "Appearance", icon: Palette },
    { name: "Security", icon: Shield },
  ];

  const Toggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`toggle-switch ${active ? "active" : ""}`}>
      <div className="toggle-knob" />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          {tabs.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.name ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
              <item.icon className="w-4 h-4" /> {item.name}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 max-w-2xl">
          {activeTab === "Account" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">Public Profile</h2>
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">First Name</label>
                    <input type="text" value={nameParts[0] || ""} onChange={(e) => setNameParts([e.target.value, ...nameParts.slice(1)])} className="w-full bg-[var(--muted)] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Last Name</label>
                    <input type="text" value={nameParts.slice(1).join(" ") || ""} onChange={(e) => setNameParts([nameParts[0], e.target.value])} className="w-full bg-[var(--muted)] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] resize-none transition-all" />
                </div>
              </div>

              <h2 className="text-lg font-bold">Account</h2>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <button onClick={() => setShowChangeEmail(!showChangeEmail)} className="w-full p-4 border-b border-[var(--border)] flex items-center justify-between hover:bg-[var(--muted)] transition-colors">
                  <div><h4 className="font-semibold text-sm">Email</h4><p className="text-xs text-[var(--muted-foreground)]">{user?.email}</p></div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
                {showChangeEmail && (
                  <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 space-y-3">
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)]" />
                    <button onClick={handleEmailChange} className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium">Update Email</button>
                  </div>
                )}
                <button onClick={() => setShowChangePassword(!showChangePassword)} className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors">
                  <div><h4 className="font-semibold text-sm">Password</h4><p className="text-xs text-[var(--muted-foreground)]">Change your password</p></div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
                {showChangePassword && (
                  <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30 space-y-3">
                    <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)]" />
                    <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)]" />
                    <button onClick={handlePasswordChange} className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium">Update Password</button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={handleSave} className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95">Save Changes</button>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 space-y-3 mt-4">
                <h3 className="font-bold text-[var(--destructive)]">Danger Zone</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Permanently delete your account. This cannot be undone.</p>
                <button onClick={() => toast.error("Account deletion requires confirmation email")} className="bg-[var(--destructive)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 active:scale-95">Delete Account</button>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">Notification Preferences</h2>
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
                {[
                  { label: "Push Notifications", desc: "Receive push notifications for activity", key: "notifications" as const, value: settings.notifications },
                  { label: "Email Notifications", desc: "Get email updates for important activity", key: "emailNotifications" as const, value: settings.emailNotifications },
                  { label: "Message Notifications", desc: "Get notified for new messages", key: "messageNotifications" as const, value: settings.messageNotifications },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div><h3 className="font-semibold text-sm">{item.label}</h3><p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p></div>
                    <Toggle active={item.value} onChange={() => { updateSettings({ [item.key]: !item.value }); toast.success(`${item.label} ${!item.value ? "enabled" : "disabled"}`); }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Privacy" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">Privacy Settings</h2>
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-semibold text-sm">Private Account</h3><p className="text-xs text-[var(--muted-foreground)]">Only approved followers can see your content</p></div>
                  <Toggle active={settings.privateAccount} onChange={() => { updateSettings({ privateAccount: !settings.privateAccount }); toast.success(`Account is now ${!settings.privateAccount ? "private" : "public"}`); }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">Theme</h2>
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button key={t} onClick={() => { updateSettings({ theme: t }); document.documentElement.setAttribute("data-theme", t === "system" ? "" : t); toast.success(`Theme: ${t}`); }} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === t ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:bg-[var(--muted)]"}`}>
                      <Palette className={`w-6 h-6 ${settings.theme === t ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
                      <span className="font-medium capitalize text-sm">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">Security</h2>
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-semibold text-sm">Two-Factor Authentication</h3><p className="text-xs text-[var(--muted-foreground)]">Add an extra layer of security</p></div>
                  <Toggle active={settings.twoFactorEnabled} onChange={() => { updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled }); toast.success(`2FA ${!settings.twoFactorEnabled ? "enabled" : "disabled"}`); }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

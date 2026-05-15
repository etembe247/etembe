"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/components/SocketProvider";
import { useAppStore, generateId, ChatMessage } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Send, Plus, X, Users, ArrowLeft, Smile, Paperclip,
  CheckCheck, Pin, MoreVertical, Phone, Video, Hash,
} from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "💯"];

export default function ChatPage() {
  const { isConnected, sendMessage, startTyping, stopTyping, markRead, sendReaction, joinChat, leaveChat } = useSocket();
  const searchParams = useSearchParams();
  
  const user = useAppStore((s) => s.user);
  const chats = useAppStore((s) => s.chats);
  const addChat = useAppStore((s) => s.addChat);
  const addMessage = useAppStore((s) => s.addMessage);
  const pinChat = useAppStore((s) => s.pinChat);
  const markChatRead = useAppStore((s) => s.markChatRead);
  const onlineUsers = useAppStore((s) => s.onlineUsers);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true });

      if (data && !error) {
        const formattedMsgs: ChatMessage[] = data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          createdAt: m.created_at,
          read: m.read,
          type: 'text',
          reactions: [],
        }));
        
        // Update the specific chat in the store
        useAppStore.setState((s) => ({
          chats: s.chats.map(c => c.id === activeChatId ? { ...c, messages: formattedMsgs } : c)
        }));
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${activeChatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChatId}`
      }, (payload) => {
        const m = payload.new;
        if (m.sender_id !== user?.id) {
          addMessage(activeChatId, {
            id: m.id,
            senderId: m.sender_id,
            text: m.text,
            createdAt: m.created_at,
            read: m.read,
            type: 'text',
            reactions: [],
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChatId, user?.id, addMessage]);

  useEffect(() => {
    const isNew = searchParams?.get("new");
    const isGroup = searchParams?.get("group");
    if (isNew) setShowNewChat(true);
    if (isGroup) setShowNewGroup(true);
  }, [searchParams]);

  useEffect(() => {
    if (activeChatId) {
      joinChat(activeChatId);
      markChatRead(activeChatId);
      markRead(activeChatId);
    }
    return () => { if (activeChatId) leaveChat(activeChatId); };
  }, [activeChatId, joinChat, leaveChat, markChatRead, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, chats]);

  if (!mounted || !user) return null;

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatId || !user) return;
    
    const text = inputText.trim();
    setInputText("");

    try {
      const { data, error } = await supabase.from("messages").insert({
        chat_id: activeChatId,
        sender_id: user.id,
        text: text,
      }).select();

      if (error) throw error;

      if (data?.[0]) {
        addMessage(activeChatId, {
          id: data[0].id,
          senderId: user.id,
          text: data[0].text,
          createdAt: data[0].created_at,
          read: false,
          type: 'text',
          reactions: [],
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (!activeChatId) return;
    startTyping(activeChatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(activeChatId), 2000);
  };

  const handleCreateChat = () => {
    if (!newChatName.trim() || !user) return;
    const id = generateId();
    addChat({
      id, 
      participants: [{ id: user.id, name: user.name, avatar: user.avatar, online: true }], 
      messages: [], 
      unread: 0, 
      isGroup: false,
      isPinned: false,
      typingUsers: [],
    });
    setActiveChatId(id);
    setShowNewChat(false);
    setNewChatName("");
    toast.success(`Chat started with ${newChatName}`);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || !user) return;
    const id = generateId();
    addChat({
      id, 
      participants: [{ id: user.id, name: user.name, avatar: user.avatar, online: true }], 
      messages: [], 
      unread: 0, 
      isGroup: true,
      groupName: groupName.trim(),
      groupAvatar: "",
      isPinned: false,
      typingUsers: [],
    });
    setActiveChatId(id);
    setShowNewGroup(false);
    setGroupName("");
    toast.success(`Group "${groupName}" created`);
  };

  const filteredChats = chats
    .filter((c) => {
      const otherParticipant = c.participants.find(p => p.id !== user?.id);
      const chatName = c.isGroup ? (c.groupName || "") : (otherParticipant?.name || "");
      return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : 0;
      const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const formatMsgTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-[100dvh] md:h-screen bg-[var(--background)] overflow-hidden relative">
      {/* Sidebar */}
      <div className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-full absolute md:relative z-20 md:z-auto transition-transform duration-300 ${activeChatId ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              Messages
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-[var(--success)]" : "bg-[var(--destructive)]"}`} />
            </h1>
            <div className="flex gap-1.5">
              <button onClick={() => setShowNewChat(true)} className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)]/20 transition-colors" title="New Chat">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowNewGroup(true)} className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)]/20 transition-colors" title="New Group">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--muted)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] gap-2 px-4 text-center">
              <MessageBubbleIcon />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin messaging</p>
            </div>
          ) : filteredChats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const otherParticipant = chat.participants.find(p => p.id !== user?.id);
            const chatName = chat.isGroup ? chat.groupName : (otherParticipant?.name || "Chat");
            
            return (
              <button key={chat.id} onClick={() => { setActiveChatId(chat.id); markChatRead(chat.id); }} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all w-full mb-1 text-left ${activeChatId === chat.id ? "bg-[var(--primary)]/10 border-l-[3px] border-[var(--primary)]" : "hover:bg-[var(--muted)] border-l-[3px] border-transparent"}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm border border-[var(--border)]">
                    {chat.isGroup ? <Hash className="w-5 h-5" /> : (chatName || "?").charAt(0).toUpperCase()}
                  </div>
                  {chat.isPinned && <Pin className="absolute -top-1 -right-1 w-3 h-3 text-[var(--primary)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm truncate ${chat.unread > 0 ? "font-bold" : "font-medium"}`}>{chatName || "Chat"}</h3>
                    <span className={`text-[10px] flex-shrink-0 ml-2 ${chat.unread > 0 ? "text-[var(--primary)] font-bold" : "text-[var(--muted-foreground)]"}`}>
                      {lastMsg ? formatMsgTime(lastMsg.createdAt) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${chat.unread > 0 ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                      {chat.typingUsers.length > 0 ? <span className="text-[var(--primary)] italic">typing...</span> : lastMsg ? lastMsg.text : "No messages yet"}
                    </p>
                    {chat.unread > 0 && (
                      <span className="ml-2 bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat */}
      <div className={`flex-1 flex flex-col relative z-10 transition-transform duration-300 ${!activeChatId ? "translate-x-full md:translate-x-0 hidden md:flex" : "translate-x-0"}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-[var(--muted)] active:scale-95 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm border border-[var(--border)]">
                  {activeChat.isGroup ? <Hash className="w-5 h-5" /> : (activeChat.participants.find(p => p.id !== user?.id)?.name.charAt(0).toUpperCase() || "?")}
                </div>
                <div>
                  <h2 className="font-bold text-sm">{activeChat.isGroup ? activeChat.groupName : (activeChat.participants.find(p => p.id !== user?.id)?.name || "Chat")}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {activeChat.typingUsers.length > 0 ? (
                      <span className="text-[var(--primary)]">typing...</span>
                    ) : activeChat.isGroup ? (
                      `${activeChat.participants.length} members`
                    ) : (
                      <span className="text-[var(--success)]">Online</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => pinChat(activeChat.id)} className={`p-2 rounded-full hover:bg-[var(--muted)] transition-colors ${activeChat.isPinned ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                  <Pin className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"><Video className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 hide-scrollbar">
              {activeChat.messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full text-[var(--muted-foreground)] flex-col gap-2">
                  <p className="text-sm">No messages yet. Say hi!</p>
                </div>
              ) : activeChat.messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const sender = activeChat.participants.find(p => p.id === msg.senderId);
                const senderName = sender?.name || "User";
                return (
                  <div key={msg.id} className={`flex max-w-[80%] md:max-w-[65%] ${isMe ? "ml-auto flex-row-reverse" : ""} gap-2 items-end group`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-[10px] flex-shrink-0">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && activeChat.isGroup && (
                        <span className="text-[10px] text-[var(--muted-foreground)] mb-1 ml-1">{senderName}</span>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm relative ${isMe ? "bg-[var(--primary)] text-white rounded-br-sm" : "bg-[var(--muted)] rounded-bl-sm"}`}
                        onDoubleClick={() => setReactionMsgId(reactionMsgId === msg.id ? null : msg.id)}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {/* Reactions */}
                      {msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                            const count = msg.reactions.filter(r => r.emoji === emoji).length;
                            return (
                              <button key={emoji} onClick={() => sendReaction(activeChat.id, msg.id, emoji)} className="text-xs bg-[var(--muted)] rounded-full px-1.5 py-0.5 border border-[var(--border)] hover:bg-[var(--primary)]/10 transition-colors">
                                {emoji} {count > 1 ? count : ""}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {/* Reaction picker */}
                      {reactionMsgId === msg.id && (
                        <div className="flex gap-1 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-1 shadow-lg animate-scale-in">
                          {EMOJIS.map((e) => (
                            <button key={e} onClick={() => { sendReaction(activeChat.id, msg.id, e); setReactionMsgId(null); }} className="text-base hover:scale-125 transition-transform p-0.5">
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-[var(--muted-foreground)]">{formatMsgTime(msg.createdAt)}</span>
                        {isMe && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 md:p-4 bg-[var(--card)] border-t border-[var(--border)]">
              {showEmoji && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => { setInputText((p) => p + e); setShowEmoji(false); }} className="text-xl hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 bg-[var(--muted)] rounded-full p-1.5 focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--accent)] transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <input type="text" placeholder="Type a message..." value={inputText} onChange={(e) => handleInputChange(e.target.value)} className="flex-1 bg-transparent outline-none text-sm px-2 min-w-0" />
                <button type="submit" disabled={!inputText.trim()} className="p-2 bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 active:scale-95">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)] flex-col gap-3">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center">
              <MessageBubbleIcon />
            </div>
            <p className="font-medium">Select a chat or start a new conversation</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowNewChat(false)}>
          <div className="bg-[var(--card)] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--border)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">New Message</h2>
              <button onClick={() => setShowNewChat(false)} className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" autoFocus placeholder="Enter name or username..." value={newChatName} onChange={(e) => setNewChatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateChat()} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
              <button onClick={handleCreateChat} disabled={!newChatName.trim()} className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-40">Start Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowNewGroup(false)}>
          <div className="bg-[var(--card)] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--border)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Create Group</h2>
              <button onClick={() => setShowNewGroup(false)} className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" autoFocus placeholder="Group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()} className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all" />
              <button onClick={handleCreateGroup} disabled={!groupName.trim()} className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-40">Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubbleIcon() {
  return <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
}

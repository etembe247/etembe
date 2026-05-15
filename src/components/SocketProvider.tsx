"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore, generateId } from "@/lib/store";
import { toast } from "sonner";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (chatId: string, text: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markRead: (chatId: string) => void;
  sendReaction: (chatId: string, messageId: string, emoji: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  markRead: () => {},
  sendReaction: () => {},
  joinChat: () => {},
  leaveChat: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAppStore((s) => s.user);
  const addMessage = useAppStore((s) => s.addMessage);
  const setTyping = useAppStore((s) => s.setTyping);
  const addReaction = useAppStore((s) => s.addReaction);
  const setOnlineUsers = useAppStore((s) => s.setOnlineUsers);
  const addNotification = useAppStore((s) => s.addNotification);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    const socketInstance = io({
      path: "/socket.io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      if (user) {
        socketInstance.emit("user:online", { userId: user.id, userName: user.name });
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("reconnect", () => {
      if (user) {
        socketInstance.emit("user:online", { userId: user.id, userName: user.name });
      }
    });

    // Online users tracking
    socketInstance.on("users:online", (users: string[]) => {
      setOnlineUsers(users);
    });

    // Chat messages from other users
    socketInstance.on("chat:message", (data: any) => {
      if (data.senderId !== user?.id) {
        addMessage(data.chatId, {
          id: data.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.timestamp || new Date().toISOString(),
          read: false,
          type: 'text',
          reactions: [],
        });
      }
    });

    // Chat notifications
    socketInstance.on("chat:notification", (data: any) => {
      if (data.senderId !== user?.id && settings.messageNotifications) {
        toast(`💬 ${data.senderName}: ${data.preview}`, {
          duration: 3000,
        });
      }
    });

    // Typing indicators
    socketInstance.on("chat:typing", (data: any) => {
      if (data.userId !== user?.id) {
        setTyping(data.chatId, data.userId, data.isTyping);
      }
    });

    // Read receipts
    socketInstance.on("chat:read", (data: any) => {
      // Handle read receipt UI update
    });

    // Reactions
    socketInstance.on("chat:reaction", (data: any) => {
      if (data.userId !== user?.id) {
        addReaction(data.chatId, data.messageId, data.emoji, data.userId);
      }
    });

    // Notifications
    socketInstance.on("notification:receive", (data: any) => {
      if (data.targetUserId === user?.id) {
        addNotification({
          id: generateId(),
          type: data.type,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserAvatar: data.fromUserAvatar,
          message: data.message,
          targetId: data.targetId,
          targetType: data.targetType,
          read: false,
          createdAt: new Date().toISOString(),
        });
        if (settings.notifications) {
          toast(data.message, { duration: 3000 });
        }
      }
    });

    // Follow notifications
    socketInstance.on("user:follow", (data: any) => {
      if (data.targetUserId === user?.id) {
        addNotification({
          id: generateId(),
          type: "follow",
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserAvatar: data.fromUserAvatar,
          message: `${data.fromUserName} started following you`,
          read: false,
          createdAt: new Date().toISOString(),
        });
        if (settings.notifications) {
          toast(`${data.fromUserName} started following you`);
        }
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Re-emit online status when user changes
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit("user:online", { userId: user.id, userName: user.name });
    }
  }, [socket, isConnected, user]);

  const sendMessage = useCallback(
    (chatId: string, text: string) => {
      if (!socket || !user || !text.trim()) return;
      const msgData = {
        id: generateId(),
        senderId: user.id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        type: 'text' as const,
        reactions: [],
      };
      // Add locally immediately for instant feedback
      addMessage(chatId, msgData);
      // Emit to server
      socket.emit("chat:message", msgData);
    },
    [socket, user, addMessage]
  );

  const startTyping = useCallback(
    (chatId: string) => {
      if (!socket || !user) return;
      socket.emit("chat:typing", { chatId, userId: user.id, userName: user.name, isTyping: true });
    },
    [socket, user]
  );

  const stopTyping = useCallback(
    (chatId: string) => {
      if (!socket || !user) return;
      socket.emit("chat:typing", { chatId, userId: user.id, userName: user.name, isTyping: false });
    },
    [socket, user]
  );

  const markRead = useCallback(
    (chatId: string) => {
      if (!socket || !user) return;
      socket.emit("chat:read", { chatId, userId: user.id });
    },
    [socket, user]
  );

  const sendReaction = useCallback(
    (chatId: string, messageId: string, emoji: string) => {
      if (!socket || !user) return;
      addReaction(chatId, messageId, emoji, user.id);
      socket.emit("chat:reaction", { chatId, messageId, emoji, userId: user.id });
    },
    [socket, user, addReaction]
  );

  const joinChat = useCallback(
    (chatId: string) => {
      if (!socket) return;
      socket.emit("chat:join", chatId);
    },
    [socket]
  );

  const leaveChat = useCallback(
    (chatId: string) => {
      if (!socket) return;
      socket.emit("chat:leave", chatId);
    },
    [socket]
  );

  const value = useMemo(() => ({
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    sendReaction,
    joinChat,
    leaveChat,
  }), [socket, isConnected, sendMessage, startTyping, stopTyping, markRead, sendReaction, joinChat, leaveChat]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

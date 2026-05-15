"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { syncAuth } from "@/lib/auth-sync";

const PUBLIC_ROUTES = ["/auth", "/", "/blog", "/shorts", "/course"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncAuth();
    // Wait for zustand persist to hydrate
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!mounted || !hydrated) return;

    const isPublicRoute = pathname === "/" || PUBLIC_ROUTES.filter(r => r !== "/").some((r) => pathname.startsWith(r));

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth");
    } else if (isAuthenticated && pathname === "/auth") {
      router.replace("/");
    }
  }, [isAuthenticated, pathname, router, mounted, hydrated]);

  // Show loading spinner while hydrating
  if (!mounted || !hydrated) {
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[var(--primary)]/30">
            E
          </div>
          <div className="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth page, show loader (redirect happening)
  if (!isAuthenticated && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

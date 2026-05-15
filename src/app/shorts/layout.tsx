import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shorts | ETEMBE Video",
  description: "Watch trending short-form videos on ETEMBE. Experience a premium, high-speed video ecosystem designed for modern creators and viewers.",
  keywords: ["shorts", "video", "short-form content", "trending videos", "etembe shorts", "video platform"],
  openGraph: {
    title: "Shorts | ETEMBE Video",
    description: "Watch trending short-form videos on ETEMBE.",
    type: "video.other",
  },
};

export default function ShortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

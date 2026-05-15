import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SocketProvider } from "@/components/SocketProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";
import { CreateFAB } from "@/components/CreateFAB";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ETEMBE | Premium Digital Ecosystem",
    template: "%s | ETEMBE",
  },
  description:
    "ETEMBE is a world-class all-in-one digital ecosystem combining social media, messaging, shorts, blogging, and online learning in a unified premium experience.",
  keywords: ["ETEMBE", "social media", "messaging", "shorts", "blogging", "learning", "digital ecosystem", "PWA", "Next.js"],
  manifest: "/manifest.json",
  authors: [{ name: "ETEMBE Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://etembe.com",
    siteName: "ETEMBE",
    title: "ETEMBE | Premium Digital Ecosystem",
    description: "The all-in-one digital platform for creators and learners.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ETEMBE Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETEMBE | Premium Digital Ecosystem",
    description: "The all-in-one digital platform for creators and learners.",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ETEMBE",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SocketProvider>
            <div className="flex min-h-[100dvh]">
              <Navigation />
              <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden relative">
                {children}
              </main>
            </div>
            <CreateFAB />
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  borderRadius: "12px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

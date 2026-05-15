import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | ETEMBE Academy",
  description: "Master new skills with ETEMBE's premium online courses. From web development to UI/UX design, learn from industry experts in our digital ecosystem.",
  keywords: ["learning", "courses", "online education", "web development", "data science", "design", "etembe academy"],
  openGraph: {
    title: "Learn | ETEMBE Academy",
    description: "Master new skills with ETEMBE's premium online courses.",
    type: "website",
  },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}

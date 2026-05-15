import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | ETEMBE Publishing",
  description: "Read the latest stories, tutorials, and insights from the ETEMBE creator community. Discover articles on technology, design, business, and more.",
  keywords: ["blog", "publishing", "articles", "technology", "design", "business", "etembe", "creators"],
  openGraph: {
    title: "Blog | ETEMBE Publishing",
    description: "Read the latest stories and insights from the ETEMBE community.",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}

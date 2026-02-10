import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost-Post | AI LinkedIn Writer",
  description:
    "Stop staring at a blank page. Generate viral LinkedIn posts in seconds with AI.",
  openGraph: {
    title: "Ghost-Post | AI LinkedIn Writer",
    description:
      "Stop staring at a blank page. Generate viral LinkedIn posts in seconds with AI.",
    type: "website",
    siteName: "Ghost-Post",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Ghost-Post" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost-Post | AI LinkedIn Writer",
    description:
      "Stop staring at a blank page. Generate viral LinkedIn posts in seconds with AI.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

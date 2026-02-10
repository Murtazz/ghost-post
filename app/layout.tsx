import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost-Post Generator",
  description: "Paste a link or notes, get 3 perfect LinkedIn posts with AI.",
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

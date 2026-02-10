import type { Metadata } from "next";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost-Post | AI Social Media Writer",
  description:
    "Stop staring at a blank page. Generate polished LinkedIn posts and viral tweets in seconds with AI.",
  openGraph: {
    title: "Ghost-Post | AI Social Media Writer",
    description:
      "Stop staring at a blank page. Generate polished LinkedIn posts and viral tweets in seconds with AI.",
    type: "website",
    siteName: "Ghost-Post",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Ghost-Post" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost-Post | AI Social Media Writer",
    description:
      "Stop staring at a blank page. Generate polished LinkedIn posts and viral tweets in seconds with AI.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-slate-950 transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

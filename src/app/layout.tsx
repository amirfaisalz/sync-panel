import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Home } from "lucide-react";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Integration Sync Panel",
  description:
    "Manage and monitor bidirectional data synchronization across your connected integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <nav className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-4">
            <span className="font-semibold text-sm tracking-tight">
              Integration Sync Panel
            </span>
            <div className="h-4 w-px bg-border" />
            <Link
              href="/integrations"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              Integrations
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Toast notifications */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

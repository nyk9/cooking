import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
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
  title: "料理アシスタント",
  description: "AIと一緒にレシピを考える自炊サポートアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head />
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="mr-4 font-semibold text-sm"
                >
                  🍳 料理アシスタント
                </Link>
                <Link
                  href="/chat"
                  className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  チャット
                </Link>
                <Link
                  href="/recipes"
                  className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  レシピ
                </Link>
                <Link
                  href="/shopping"
                  className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  買い物リスト
                </Link>
                <Link
                  href="/preferences"
                  className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  好み設定
                </Link>
              </nav>
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

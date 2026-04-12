import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileNav } from "@/components/features/mobile-nav";
import "./globals.css";

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
      className="h-full antialiased"
    >
      <head />
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 relative">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <MobileNav />
                <Link
                  href="/"
                  className="mr-4 font-semibold text-sm"
                >
                  🍳 料理アシスタント
                </Link>
                <nav className="hidden md:flex items-center gap-1">
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
                    href="/cooking-log"
                    className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    調理ログ
                  </Link>
                  <Link
                    href="/ingredients"
                    className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    食材管理
                  </Link>
                  <Link
                    href="/meal-plan"
                    className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    週間献立
                  </Link>
                  <Link
                    href="/preferences"
                    className="px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    好み設定
                  </Link>
                </nav>
              </div>
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

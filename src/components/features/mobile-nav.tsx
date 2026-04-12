"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/chat", label: "チャット" },
  { href: "/recipes", label: "レシピ" },
  { href: "/shopping", label: "買い物リスト" },
  { href: "/cooking-log", label: "調理ログ" },
  { href: "/ingredients", label: "食材管理" },
  { href: "/meal-plan", label: "週間献立" },
  { href: "/preferences", label: "好み設定" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
        aria-label="メニューを開く"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 border-b bg-background z-50">
          <nav className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-accent font-medium"
                    : "hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

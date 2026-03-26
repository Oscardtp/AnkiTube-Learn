"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/my-flashcards", label: "My Flashcards", icon: BookOpen },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col py-8 px-4 bg-surface-container-low z-50">
      {/* Logo */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">
              AnkiTube Learn
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
              The Digital Mentor
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-white/50 shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* New Collection Button */}
      <div className="mt-auto px-2">
        <Link
          href="/generate"
          className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:opacity-90 transition-all active:scale-95"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 4v16m8-8H4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          New Collection
        </Link>
      </div>
    </aside>
  );
}

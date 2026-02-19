"use client";
// ─────────────────────────────────────────────────────────────────
//  MobileNav — sticky bottom tab bar for mobile/tablet
//  PRD Reference: Section 9.5 (mobile layout)
//  - 5 tabs: Create, Edit, Gallery, Templates, Settings
//  - Glassmorphic effect with blur
//  - Haptic feedback (simulated via active scales)
// ─────────────────────────────────────────────────────────────────
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Image, LayoutGrid, Settings } from "lucide-react";
import type { Plan } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Create", href: "/create", icon: Sparkles },
  { label: "Edit", href: "/edit", icon: Wand2 },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Gallery", href: "/gallery", icon: Image },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface MobileNavProps {
  plan: Plan;
}

export default function MobileNav({ plan }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-surface/80 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 px-4 pb-safe overflow-hidden">
      <ul className="flex items-center justify-between h-full relative">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1 relative">
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1.5 h-full w-full relative z-10
                  transition-all duration-500
                  ${isActive ? "text-primary scale-110" : "text-text-disabled hover:text-text-secondary"}
                `}
              >
                <div className={`
                  p-2 rounded-2xl transition-all duration-500
                  ${isActive ? "bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" : "bg-transparent"}
                `}>
                  <Icon
                    size={22}
                    className={isActive ? "text-primary" : "text-text-disabled"}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-1"}`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";
// ─────────────────────────────────────────────────────────────────
//  Sidebar — desktop fixed navigation (240px)
//  PRD Reference: Section 9.5 nav structure
// ─────────────────────────────────────────────────────────────────
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Film, LayoutGrid, Image, Lock } from "lucide-react";
import type { Plan } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  lockedFor?: Plan[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Create", href: "/create", icon: Sparkles },
  { label: "Edit", href: "/edit", icon: Wand2 },
  { label: "Video", href: "/video", icon: Film, lockedFor: ["free"] },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Gallery", href: "/gallery", icon: Image },
];

interface SidebarProps {
  plan: Plan;
}

export default function Sidebar({ plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-sidebar h-full bg-surface border-r border-border perspective-1000">
      {/* Logo */}
      <div className="flex items-center h-24 px-8 flex-shrink-0">
        <Link href="/create" className="group">
          <span className="font-heading font-black text-3xl text-text-primary tracking-tighter italic uppercase group-hover:text-primary transition-colors">
            Creative<span className="text-primary not-italic">AI</span>
          </span>
          <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500" />
        </Link>
      </div>

      {/* Nav items */}
      <ul className="flex-1 py-8 space-y-2 px-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isLocked = item.lockedFor?.includes(plan) ?? false;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em]
                  transition-all duration-300 group relative
                  ${isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "text-text-disabled hover:bg-surface-2 hover:text-text-primary"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={20}
                  className={`${isActive ? "text-white" : "text-text-disabled group-hover:text-primary"} transition-colors`}
                  fill={isActive ? "currentColor" : "none"}
                />
                <span className="relative z-10">{item.label}</span>
                {isLocked && (
                  <Lock size={12} className="ml-auto opacity-50" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Plan badge at bottom */}
      <div className="p-8">
        <div className="bg-surface-2 border border-border rounded-[24px] p-5 shadow-inner group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-text-disabled uppercase tracking-widest">Neural Link</span>
            <div className={`h-2 w-2 rounded-full animate-pulse ${plan === "free" ? "bg-text-disabled" : "bg-secondary shadow-[0_0_8px_rgba(var(--secondary-rgb),0.6)]"}`} />
          </div>

          <div className="flex flex-col gap-3">
            <span className={`
              text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border text-center
              ${plan === "free" ? "bg-surface text-text-disabled border-border" : ""}
              ${plan === "spark" ? "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : ""}
              ${plan === "glow" ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : ""}
              ${plan === "pro" ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] italic" : ""}
            `}>
              {plan === "pro" ? "ULTIMATE PRO" : `${plan.toUpperCase()} TIER`}
            </span>

            {plan === "free" && (
              <Link href="/settings" className="btn-primary py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg transform group-hover:scale-105 transition-all">
                Upgrade Signal
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

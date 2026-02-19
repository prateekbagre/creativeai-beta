"use client";
// ─────────────────────────────────────────────────────────────────
//  TopBar — fixed header with credit display and user menu
//  PRD Reference: Section 8.2 (credit balance display rules)
//  - Always visible in top nav
//  - Amber pulsing at < 20 credits
//  - Red at 0 credits
//  - Tooltip shows breakdown: monthly + rollover + topup
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, User, Settings, LogOut, ChevronDown } from "lucide-react";
import type { Plan } from "@/types";
import { LOW_CREDIT_THRESHOLD } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TopBarProps {
  displayName: string | null;
  avatarUrl: string | null;
  plan: Plan;
  creditsTotal: number;
  creditsMonthly: number;
  creditsRollover: number;
}

export default function TopBar({
  displayName, avatarUrl, plan, creditsTotal, creditsMonthly, creditsRollover,
}: TopBarProps) {
  const [showCreditTooltip, setShowCreditTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const isLow = creditsTotal < LOW_CREDIT_THRESHOLD && creditsTotal > 0;
  const isEmpty = creditsTotal === 0;
  const creditsTopup = Math.max(0, creditsTotal - creditsMonthly - creditsRollover);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-end h-24 px-8 bg-background/50 backdrop-blur-xl border-b border-border flex-shrink-0 gap-6 sticky top-0 z-40">

      {/* Credit Display — PRD Section 8.2 */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowCreditTooltip(true)}
          onMouseLeave={() => setShowCreditTooltip(false)}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest
            transition-all duration-300 shadow-sm hover:shadow-lg
            ${isEmpty ? "border-error/40 text-error bg-error/10" :
              isLow ? "border-warning/40 text-warning bg-warning/10 animate-pulse-credit" :
                "border-border text-primary bg-surface/50 hover:bg-surface hover:border-primary/30"}
          `}
          aria-label={`${creditsTotal} credits remaining`}
        >
          <Zap size={16} fill="currentColor" className={isEmpty || isLow ? "animate-pulse" : ""} />
          <span className="tabular-nums">{plan === "pro" ? "INFINITY" : creditsTotal}</span>
          <span className="opacity-50 hidden sm:inline">Energy Units</span>
        </button>

        {/* Credit breakdown tooltip */}
        <AnimatePresence>
          {showCreditTooltip && plan !== "pro" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-4 w-64 bg-surface/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 z-50 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              <p className="text-[10px] font-black text-text-disabled mb-4 uppercase tracking-[0.2em]">Flux Topology</p>
              <div className="space-y-3">
                {[
                  { label: "Core Allocation", val: creditsMonthly },
                  { label: "Temporal Rollover", val: creditsRollover },
                  { label: "External Top-up", val: creditsTopup }
                ].map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center group/row">
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-tighter group-hover/row:text-text-primary transition-colors">{row.label}</span>
                    <span className="text-sm font-black text-text-primary tabular-nums italic">{row.val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Total Energy</span>
                  <span className="text-lg font-black text-primary tabular-nums italic shadow-glow">{creditsTotal}</span>
                </div>
              </div>
              <Link
                href="/settings"
                className="block mt-6 text-center text-[10px] font-black text-text-primary uppercase tracking-widest hover:text-primary transition-colors bg-surface-2 py-3 rounded-xl border border-border"
              >
                Inject Energy →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center gap-3 hover:bg-surface-2 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-border group"
          aria-label="User menu"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-colors" />
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-[14px] object-cover relative z-10 border border-white/10 shadow-lg" />
            ) : (
              <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center relative z-10 border border-white/10 shadow-lg">
                <User size={20} className="text-white" />
              </div>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-[11px] font-black uppercase tracking-tight text-text-primary group-hover:translate-x-1 transition-transform">
              {displayName ?? "Syncing..."}
            </span>
            <span className="text-[9px] font-black text-text-disabled uppercase tracking-widest">{plan} OPERATIVE</span>
          </div>
          <ChevronDown size={14} className={`text-text-disabled group-hover:text-text-primary transition-all ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-4 w-56 bg-surface/90 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <Link href="/settings" className="flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white text-text-primary transition-all group">
                <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" /> Control Room
              </Link>
              <div className="h-px bg-border mx-4" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-error hover:text-white text-error transition-all"
              >
                <LogOut size={16} /> Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

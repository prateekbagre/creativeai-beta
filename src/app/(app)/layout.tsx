// ─────────────────────────────────────────────────────────────────
//  App Layout — authenticated shell
//  - Fixed left sidebar on desktop (240px)
//  - Bottom tab bar on mobile (5 tabs)
//  - Credit display in top navigation
//  PRD Reference: Section 9.5 (navigation), 8.2 (credit display)
// ─────────────────────────────────────────────────────────────────
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import TopBar from "@/components/layout/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile for credit display
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_url, plan, credits_remaining, credits_monthly_allowance, credits_rollover_balance, onboarding_complete")
    .eq("id", user.id)
    .single() as { data: any };

  if (!profile) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — fixed left, 240px */}
      <aside className="hidden lg:flex lg:w-sidebar lg:flex-shrink-0">
        <Sidebar plan={profile.plan as any} />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar with credit display */}
        <TopBar
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          plan={profile.plan as any}
          creditsTotal={profile.credits_remaining}
          creditsMonthly={profile.credits_monthly_allowance}
          creditsRollover={profile.credits_rollover_balance}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — visible below lg breakpoint */}
      <MobileNav plan={profile.plan as any} />
    </div>
  );
}

"use client";
/**
 * src/app/(app)/settings/page.tsx
 * PRD Reference: Section 9 (Account Settings)
 * Features: Profile management, plan info, credit settings, sign out.
 */
import { useState, useEffect } from "react";
import { User, Mail, Shield, CreditCard, LogOut, ChevronRight, Zap, Bell, Check, Sparkles, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // @ts-ignore
                const { data: profile } = await (supabase
                    .from("users") as any)
                    .select("*")
                    .eq("id", user.id)
                    .single();
                if (profile) {
                    setUser({ ...user, ...(profile as any) });
                }
            }
            setIsLoading(false);
        }
        getProfile();
    }, [supabase]);

    const handleCheckout = async (params: { type: "subscription" | "topup", planId?: string, packageId?: string }) => {
        setIsCheckoutLoading(true);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || "Failed to initiate checkout");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    if (isLoading) return (
        <div className="max-w-4xl mx-auto p-12 space-y-8">
            <div className="h-10 w-48 bg-surface-2 animate-pulse rounded-lg" />
            <div className="h-40 w-full bg-surface-2 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-56 bg-surface-2 animate-pulse rounded-3xl" />
                <div className="h-56 bg-surface-2 animate-pulse rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-16 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                        <User size={12} /> Account Control Center
                    </div>
                    <h1 className="text-5xl font-heading font-black text-text-primary tracking-tighter">Settings</h1>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-text-disabled hover:text-error font-black uppercase text-[10px] tracking-widest transition-all p-2"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </header>

            {/* Profile Section */}
            <section className="space-y-6">
                <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[40px] bg-primary/5 flex items-center justify-center text-primary font-black text-4xl border-2 border-primary/10 overflow-hidden shadow-inner transform group-hover:rotate-6 transition-transform">
                                {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user?.display_name?.charAt(0) || "U"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-2xl shadow-xl border-4 border-background">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-3xl font-black text-text-primary tracking-tight mb-2 uppercase italic">{user?.display_name || "Creative User"}</h4>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-border text-text-secondary text-xs font-bold">
                                <Mail size={14} className="text-primary" /> {user?.email}
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                                    <Shield size={12} /> SECURED
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                    <Zap size={12} /> ID: AI-{user?.id?.slice(0, 6).toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <button className="btn-secondary px-8 py-4 text-xs font-black uppercase tracking-widest border-2">Edit Identity</button>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-2/30 border-t border-border">
                        {[
                            { icon: Mail, label: "Verification", value: "Verified", color: "text-secondary" },
                            { icon: Shield, label: "Security Layer", value: "2FA Disabled", color: "text-text-disabled" },
                            { icon: Bell, label: "Neural Alerts", value: "Active", color: "text-primary" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border shadow-sm">
                                <div className={`p-3 rounded-xl bg-surface-2 ${item.color}`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-text-disabled uppercase font-black tracking-widest">{item.label}</p>
                                    <p className="text-sm text-text-primary font-black uppercase tracking-tight">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Billing Matrix */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-px bg-border flex-1" />
                    <h3 className="text-xs font-black text-text-disabled uppercase tracking-[0.2em] flex items-center gap-2">
                        <CreditCard size={14} className="text-primary" /> Billing & Credit Matrix
                    </h3>
                    <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Current Plan Card */}
                    <div className="md:col-span-7 bg-surface border-4 border-primary rounded-[40px] p-10 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-8 py-2 rounded-bl-3xl uppercase tracking-widest italic shadow-xl">TIER: {user?.plan?.toUpperCase()}</div>
                        <div className="absolute -bottom-20 -right-20 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={300} className="text-primary" />
                        </div>

                        <div className="relative z-10">
                            <h4 className="text-5xl font-black text-primary uppercase italic tracking-tighter mb-4">{user?.plan || "Free"} AI CREATOR</h4>
                            <div className="space-y-4">
                                <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-sm">
                                    Your neural bandwidth currently supports <span className="text-text-primary font-bold underline decoration-primary/30 decoration-4">{user?.credits_monthly_allowance || 25} CREDITS</span> per month.
                                </p>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-12 bg-primary rounded-full" />)}
                                    <div className="h-1.5 w-12 bg-primary/20 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-primary/10 relative z-10">
                            <button
                                onClick={() => handleCheckout({ type: "subscription", planId: "pro" })}
                                disabled={isCheckoutLoading || user?.plan === "pro"}
                                className="btn-primary w-fit px-12 py-5 font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isCheckoutLoading ? <RefreshCw className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                                {user?.plan === "free" ? "Upgrade Signal" : "Manage Neural Stream"}
                            </button>
                        </div>
                    </div>

                    {/* Top Up Section */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <div className="bg-surface border border-border rounded-[32px] p-8 shadow-sm flex-1 flex flex-col justify-between hover:border-primary/30 transition-all duration-500">
                            <div>
                                <h4 className="text-xl font-black text-text-primary uppercase italic tracking-tight mb-3">Instant Infusion</h4>
                                <p className="text-sm text-text-secondary leading-relaxed">Inject emergency credits into your core balance without a subscription.</p>
                            </div>
                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={() => handleCheckout({ type: "topup", packageId: "sm" })}
                                    className="w-full flex justify-between items-center p-5 bg-surface-2 border border-border rounded-2xl hover:border-primary hover:bg-primary/[0.02] transition-all group"
                                >
                                    <div className="text-left">
                                        <span className="block text-xs font-black uppercase tracking-widest text-text-disabled group-hover:text-primary mb-1">STRIKE-1</span>
                                        <span className="text-sm font-black text-text-primary">30 CREDS PACK</span>
                                    </div>
                                    <span className="bg-surface px-4 py-2 rounded-xl text-xs font-black border border-border shadow-sm group-hover:text-primary transition-all">$2.00</span>
                                </button>
                                <button
                                    onClick={() => handleCheckout({ type: "topup", packageId: "md" })}
                                    className="w-full flex justify-between items-center p-5 bg-surface-2 border border-border rounded-2xl hover:border-primary hover:bg-primary/[0.02] transition-all group"
                                >
                                    <div className="text-left">
                                        <span className="block text-xs font-black uppercase tracking-widest text-text-disabled group-hover:text-primary mb-1">STRIKE-2</span>
                                        <span className="text-sm font-black text-text-primary">80 CREDS PACK</span>
                                    </div>
                                    <span className="bg-surface px-4 py-2 rounded-xl text-xs font-black border border-border shadow-sm group-hover:text-primary transition-all">$5.00</span>
                                </button>
                            </div>
                        </div>

                        {/* Credits Balance Micro-Card */}
                        <div className="bg-surface-2 border border-border rounded-[24px] p-8 flex items-center justify-between shadow-inner">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled mb-1">Core Balance</p>
                                <p className="text-4xl font-black text-text-primary tracking-tighter">{user?.credits || 0}<span className="text-sm text-primary ml-1 uppercase italic">⚡</span></p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm transform -rotate-12">
                                <Plus size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences Layer */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-px bg-border flex-1" />
                    <h3 className="text-xs font-black text-text-disabled uppercase tracking-[0.2em] flex items-center gap-2">
                        <Bell size={14} className="text-primary" /> Operational Preferences
                    </h3>
                    <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: "Neural Auto-Topup", desc: "Instantly inject 50 credits when core balance reaches zero.", active: false },
                        { title: "Stream Notifications", desc: "Receive weekly neural digests and creative inspiration.", active: true }
                    ].map((pref, idx) => (
                        <div key={idx} className="bg-surface border border-border rounded-[28px] p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 pr-6 text-left">
                                    <h5 className="text-sm font-black text-text-primary uppercase tracking-tight mb-1">{pref.title}</h5>
                                    <p className="text-xs text-text-secondary leading-relaxed">{pref.desc}</p>
                                </div>
                                <button className={`w-14 h-8 rounded-full border-2 p-1 transition-all ${pref.active ? 'bg-primary border-primary' : 'bg-surface-2 border-border'}`}>
                                    <div className={`w-5 h-5 rounded-full shadow-md transition-all ${pref.active ? 'bg-white ml-auto' : 'bg-text-disabled'}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Termination Area */}
            <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black text-text-disabled uppercase tracking-[0.3em]">
                    CreativeAI Operational Interface v1.0.4-Beta
                </p>
                <button className="text-[10px] font-black text-error uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                    Terminate Account & Data Archive
                </button>
            </footer>
        </div>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg className={`${className} animate-spin`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

"use client";
/**
 * src/app/(auth)/onboarding/page.tsx
 * PRD Reference: Section 2.3 (onboarding flow)
 * 3 steps: Welcome/Goals -> Style Preference -> First Generation Teaser
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Rocket, ArrowRight, Check, Image as ImageIcon, LayoutGrid, Zap, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StylePreset } from "@/types";

const GOALS = [
    { id: "social", label: "Social Media Content", icon: LayoutGrid, description: "Instagram, YouTube, Twitter" },
    { id: "personal", label: "Personal Art", icon: Sparkles, description: "Wallpapers, avatars, fun" },
    { id: "commercial", label: "Commercial Design", icon: Zap, description: "Ads, product mockups, branding" },
    { id: "learning", label: "Learning AI Art", icon: Rocket, description: "Mastering prompts and styles" },
];

const STYLES: { id: StylePreset; label: string; image: string }[] = [
    { id: "photorealistic", label: "Photorealistic", image: "/onboarding/style-photo.jpg" },
    { id: "anime", label: "Anime/Manga", image: "/onboarding/style-anime.jpg" },
    { id: "digital_art", label: "Digital Art", image: "/onboarding/style-digital.jpg" },
    { id: "cinematic", label: "Cinematic", image: "/onboarding/style-cinematic.jpg" },
    { id: "oil_painting", label: "Oil Painting", image: "/onboarding/style-oil.jpg" },
    { id: "3d_render", label: "3D Render", image: "/onboarding/style-3d.jpg" },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [selectedGoal, setSelectedGoal] = useState("");
    const [selectedStyle, setSelectedStyle] = useState<StylePreset | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Redirect if already complete
    useEffect(() => {
        async function checkOnboarding() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            const { data: profile } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single() as { data: any };

            if (profile?.onboarding_complete) {
                router.push("/create");
            }
        }
        checkOnboarding();
    }, [router, supabase]);

    const handleNext = () => setStep(s => s + 1);

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await ((supabase
                    .from("users") as any)
                    .update({
                        onboarding_complete: true,
                        preferred_style: selectedStyle,
                    })
                    .eq("id", user.id));

                router.push("/create?first=true");
            }
        } catch (error) {
            console.error("Failed to complete onboarding", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Progress indicator */}
            <div className="w-full max-w-sm flex gap-2 mb-12 relative z-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? "bg-primary flex-1" : "bg-surface-2 w-4"}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        className="w-full max-w-2xl text-center relative z-10"
                    >
                        <header className="mb-12">
                            <h1 className="text-5xl font-heading font-black mb-4 text-text-primary tracking-tighter">
                                Creative<span className="text-primary italic">AI</span>
                            </h1>
                            <p className="text-text-secondary text-xl font-medium tracking-tight">
                                The next generation of artistic expression starts here.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            {GOALS.map((goal) => {
                                const Icon = goal.icon;
                                const isActive = selectedGoal === goal.id;
                                return (
                                    <motion.button
                                        key={goal.id}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`
                      p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden
                      ${isActive
                                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/5"
                                                : "border-border hover:border-text-disabled bg-surface shadow-sm"
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`
                        p-2.5 rounded-xl transition-all
                        ${isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-surface-2 text-text-secondary group-hover:bg-surface group-hover:text-primary"}
                      `}>
                                                <Icon size={24} />
                                            </div>
                                            <h3 className={`font-black tracking-tight ${isActive ? "text-primary" : "text-text-primary"}`}>{goal.label}</h3>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed opacity-80">{goal.description}</p>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <button
                            disabled={!selectedGoal}
                            onClick={handleNext}
                            className="mt-12 btn-primary w-full max-w-sm flex items-center justify-center gap-3 py-5 text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-primary/20"
                        >
                            Begin Journey <ArrowRight size={20} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-4xl text-center relative z-10"
                    >
                        <header className="mb-10">
                            <h2 className="text-4xl font-heading font-black mb-3 text-text-primary tracking-tighter">
                                Define Your Aesthetic
                            </h2>
                            <p className="text-text-secondary font-medium">
                                Select your signature style to calibrate the AI creative engine.
                            </p>
                        </header>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {STYLES.map((style) => (
                                <motion.button
                                    key={style.id}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`
                    group relative aspect-[3/4] rounded-2xl overflow-hidden border-4 transition-all
                    ${selectedStyle === style.id ? "border-primary shadow-2xl" : "border-transparent"}
                  `}
                                >
                                    {/* Placeholder for real images - using gradients for premium feel */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.id === 'photorealistic' ? 'from-slate-700 to-slate-900' :
                                        style.id === 'anime' ? 'from-pink-500 to-purple-600' :
                                            style.id === 'digital_art' ? 'from-cyan-500 to-blue-600' :
                                                style.id === 'cinematic' ? 'from-orange-600 to-red-900' :
                                                    style.id === 'oil_painting' ? 'from-amber-700 to-amber-950' :
                                                        'from-indigo-600 to-violet-900'
                                        }`} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">{style.label}</p>
                                    </div>
                                    {selectedStyle === style.id && (
                                        <div className="absolute inset-0 border-4 border-primary z-20 pointer-events-none">
                                            <div className="absolute top-2 right-2 bg-primary p-1 rounded-full text-white shadow-xl">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-16 w-full max-w-md mx-auto">
                            <button
                                onClick={() => setStep(1)}
                                className="btn-secondary flex-1 py-4 text-xs font-black uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button
                                disabled={!selectedStyle}
                                onClick={handleNext}
                                className="btn-primary flex-[2] py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-md text-center relative z-10"
                    >
                        <div className="w-32 h-32 bg-primary/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 border-4 border-primary/20 shadow-inner relative">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                }}
                            >
                                <Sparkles size={56} className="text-primary" />
                            </motion.div>
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-xl border-2 border-background">
                                NEW USER
                            </div>
                        </div>

                        <h2 className="text-4xl font-heading font-black mb-4 text-text-primary tracking-tighter">
                            Calibration Complete
                        </h2>
                        <p className="text-text-secondary mb-12 leading-relaxed text-lg font-medium">
                            Welcome to the inner circle. We've fueled your account with <span className="text-primary font-black">25 GENERATION CREDITS</span>.
                        </p>

                        <button
                            onClick={handleComplete}
                            disabled={isSubmitting}
                            className="w-full btn-primary py-6 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all group"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Enter Creative Studio <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";
/**
 * src/app/(app)/create/page.tsx
 * PRD Reference: Section 3 (AI Image Generation)
 * Features: Prompt input, style selection, aspect ratio, count, real-time status.
 */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Wand2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGenerationStore } from "@/hooks/useGenerationStore";
import { motion } from "framer-motion";
import { GenerateImageSchema } from "@/utils/validation";
import type { GenerateImageRequest, StylePreset, AspectRatio } from "@/types";
import { CREDIT_COSTS } from "@/types";

const STYLES: { id: StylePreset; label: string }[] = [
    { id: "photorealistic", label: "Photorealistic" },
    { id: "anime", label: "Anime" },
    { id: "digital_art", label: "Digital Art" },
    { id: "cinematic", label: "Cinematic" },
    { id: "oil_painting", label: "Oil Painting" },
    { id: "watercolor", label: "Watercolor" },
    { id: "pixel_art", label: "Pixel Art" },
    { id: "3d_render", label: "3D Render" },
];

const RATIOS: { id: AspectRatio; label: string }[] = [
    { id: "1:1", label: "1:1" },
    { id: "2:3", label: "2:3" },
    { id: "3:2", label: "3:2" },
    { id: "16:9", label: "16:9" },
    { id: "9:16", label: "9:16" },
];

export default function CreatePage() {
    const { state, startGeneration, subscribeToJob, resetState } = useGenerationStore();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GenerateImageRequest>({
        resolver: zodResolver(GenerateImageSchema),
        defaultValues: {
            style: "photorealistic",
            aspectRatio: "1:1",
            count: 1,
            enhancePrompt: true,
        }
    });

    const selectedStyle = watch("style");
    const selectedRatio = watch("aspectRatio");
    const selectedCount = watch("count");

    // Subscribe to job updates when a jobId is present
    useEffect(() => {
        if (state.jobId && (state.status === "submitting" || state.status === "generating")) {
            const unsubscribe = subscribeToJob(state.jobId);
            return unsubscribe;
        }
    }, [state.jobId, state.status, subscribeToJob]);

    const onSubmit = async (data: GenerateImageRequest) => {
        resetState();
        try {
            const response = await fetch("/api/generate/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to start generation");

            startGeneration(result.jobId, result.creditsCost, result.creditsRemaining);
        } catch (error: any) {
            console.error(error);
        }
    };

    const getCreditCost = () => {
        if (selectedCount === 1) return CREDIT_COSTS.IMAGE_SINGLE;
        if (selectedCount === 2) return CREDIT_COSTS.IMAGE_BATCH_2;
        if (selectedCount === 4) return CREDIT_COSTS.IMAGE_BATCH_4;
        return 1;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
            {/* Left Column: Manifestation Panel */}
            <div className="lg:col-span-5 space-y-10">
                <header>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12} /> Neural Manifestation
                    </div>
                    <h1 className="text-4xl font-heading font-black text-text-primary tracking-tighter mb-2">Dream Studio</h1>
                    <p className="text-text-secondary leading-relaxed">Cast your vision into the latent space and witness it materialize.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    {/* Prompt */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Vision Blueprint</label>
                            <span className="text-[10px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">STABLE DIFFUSION XL</span>
                        </div>
                        <div className="group relative">
                            <textarea
                                {...register("prompt")}
                                placeholder="Describe your masterpiece... (e.g., 'Cyberpunk samurai in a rain-slicked Tokyo alley, 8k, cinematic lighting')"
                                className="w-full h-40 p-5 bg-surface-2 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm leading-relaxed scrollbar-hide"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-text-disabled opacity-0 group-focus-within:opacity-100 transition-opacity">
                                ENTER TO IGNITE
                            </div>
                        </div>
                        {errors.prompt && <p className="text-xs text-error font-bold flex items-center gap-2 mt-2"><AlertCircle size={12} /> {errors.prompt.message}</p>}
                    </div>

                    {/* Style Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Aesthetic Calibration</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {STYLES.map((s) => {
                                const isActive = selectedStyle === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setValue("style", s.id)}
                                        className={`
                        px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all group
                        ${isActive ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-border bg-surface-2 text-text-secondary hover:border-text-disabled"}
                      `}
                                    >
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Meta Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Canvas Geometry</label>
                            <div className="flex flex-wrap gap-2">
                                {RATIOS.map((r) => {
                                    const isActive = selectedRatio === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setValue("aspectRatio", r.id)}
                                            className={`
                            px-3 py-2 text-[10px] font-black rounded-lg border-2 transition-all
                            ${isActive ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface-2 text-text-disabled hover:border-text-disabled"}
                          `}
                                        >
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Neural Multiplicity</label>
                            <div className="flex gap-2">
                                {[1, 2, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setValue("count", num as any)}
                                        className={`
                        flex-1 py-2 text-[10px] font-black rounded-lg border-2 transition-all
                        ${selectedCount === num ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface-2 text-text-disabled hover:border-text-disabled"}
                      `}
                                    >
                                        {num === 1 ? 'SINGLE' : num === 2 ? 'DOUBLE' : 'QUAD'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={state.status === "submitting" || state.status === "generating"}
                        className="w-full btn-primary py-5 rounded-[20px] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {state.status === "submitting" || state.status === "generating" ? (
                            <RefreshCw size={24} className="animate-spin" />
                        ) : (
                            <Wand2 size={24} fill="currentColor" />
                        )}
                        <span>Manifest Vision ({getCreditCost()} Creds)</span>
                    </button>
                </form>
            </div>

            {/* Right Column: Display Portal */}
            <div className="lg:col-span-7 space-y-8">
                <div className="bg-surface-2 rounded-[40px] border-2 border-border aspect-[4/3] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-inner group/display">
                    {state.status === "idle" && (
                        <div className="space-y-6 max-w-sm animate-fade-in">
                            <div className="w-24 h-24 bg-surface rounded-[32px] border border-border flex items-center justify-center mx-auto shadow-sm group-hover/display:rotate-3 transition-transform duration-500">
                                <Sparkles size={48} className="text-text-disabled" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-primary tracking-tight">Void Awaiting Creation</h3>
                                <p className="text-sm text-text-secondary leading-relaxed mt-2 p-4">Initialize the neural sequence by describing your vision in the Manifestation Panel.</p>
                            </div>
                        </div>
                    )}

                    {(state.status === "submitting" || state.status === "generating") && (
                        <div className="space-y-10 animate-fade-in w-full max-w-sm px-10">
                            <div className="relative w-40 h-40 mx-auto">
                                <div className="absolute inset-0 border-[10px] border-primary/5 rounded-full" />
                                <motion.div
                                    className="absolute inset-0 border-[10px] border-primary rounded-full border-t-transparent shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-primary">
                                    <Wand2 size={48} className="animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-text-primary italic uppercase tracking-tighter">
                                    {state.status === "submitting" ? "CONNECTING..." : "REFINING LATENT SPACE..."}
                                </h3>
                                <div className="w-full bg-surface border border-border rounded-full h-2.5 overflow-hidden shadow-inner">
                                    <motion.div
                                        className="bg-primary h-full shadow-[0_0_10px_rgba(var(--primary-rgb),1)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 15, ease: "linear" }}
                                    />
                                </div>
                                <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest">Quantum Entanglement in Progress</p>
                            </div>
                        </div>
                    )}

                    {state.status === "complete" && state.outputUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-black flex items-center justify-center"
                        >
                            <img
                                src={state.outputUrl}
                                alt="AI Generated result"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute top-8 right-8 flex gap-3">
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl shadow-2xl transition-all group">
                                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                                </button>
                                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all">
                                    SAVE ARCHIVE
                                </button>
                            </div>
                            <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-[10px] font-black tracking-widest text-white/50">
                                CREATION ID: {state.jobId?.slice(-8).toUpperCase()}
                            </div>
                        </motion.div>
                    )}

                    {state.status === "error" && (
                        <div className="space-y-6 animate-fade-in text-error p-12 max-w-md">
                            <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-error/20">
                                <AlertCircle size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Synaptic Failure</h3>
                                <p className="text-sm opacity-80 mt-2 leading-relaxed">{state.errorMessage}</p>
                            </div>
                            <button
                                onClick={resetState}
                                className="w-full btn-secondary text-text-primary py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
                            >
                                RE-INITIALIZE NEURAL LINK
                            </button>
                        </div>
                    )}
                </div>

                {/* Aesthetic Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-surface rounded-[32px] border border-border shadow-sm group hover:border-primary transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <CheckCircle2 size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Master Prompting</h4>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">Alchemy requires precision. Specify lighting patterns (Rembrandt), lenses (85mm), and atmospheric conditions (bioluminescent).</p>
                    </div>

                    <div className="p-6 bg-surface rounded-[32px] border border-border shadow-sm group hover:border-indigo-500 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <Sparkles size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Styles Synergy</h4>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">Our styles have been fine-tuned for high coherence. Cinematic provides deep shadows while Anime focuses on vibrant contours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
/**
 * src/app/(app)/video/page.tsx
 * PRD Reference: Section 5 (Short AI Video Clips)
 * Features: Image-to-Video conversion, motion presets, duration selection.
 */
import { useState, useEffect } from "react";
import { Film, Wand2, RefreshCw, AlertCircle, Upload, Play, Clock, Sparkles } from "lucide-react";
import { useGenerationStore } from "@/hooks/useGenerationStore";
import { motion, AnimatePresence } from "framer-motion";

const MOTION_PRESETS = [
    { id: "gentle", label: "Gentle Movement", description: "Subtle cinematic flow" },
    { id: "zoom-in", label: "Deep Zoom", description: "Dynamic forward motion" },
    { id: "pan-right", label: "Pan Right", description: "Horizontal sweeping camera" },
    { id: "float", label: "Ethreal Float", description: "Bouncy, handheld look" },
    { id: "shake", label: "High Action", description: "Intense shaking effect" },
];

export default function VideoPage() {
    const [imageUrl, setImageUrl] = useState("");
    const [duration, setDuration] = useState<3 | 5>(3);
    const [motionStyle, setMotionStyle] = useState("gentle");

    const { state, startGeneration, subscribeToJob, resetState } = useGenerationStore();

    useEffect(() => {
        if (state.jobId && (state.status === "submitting" || state.status === "generating")) {
            const unsubscribe = subscribeToJob(state.jobId);
            return unsubscribe;
        }
    }, [state.jobId, state.status, subscribeToJob]);

    const handleGenerate = async () => {
        resetState();
        try {
            const response = await fetch("/api/generate/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceImageUrl: imageUrl,
                    motionPrompt: motionStyle,
                    duration,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Video generation failed");

            startGeneration(result.jobId, result.creditsCost, result.creditsRemaining);
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
            {/* Left Column: Directing */}
            <div className="lg:col-span-5 space-y-10">
                <header>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                        <Film size={12} /> Cinematic Engine
                    </div>
                    <h1 className="text-4xl font-heading font-black text-text-primary tracking-tighter mb-2">Director's Studio</h1>
                    <p className="text-text-secondary leading-relaxed">Transform static concepts into fluid, cinematic masterpieces.</p>
                </header>

                <div className="space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-sm">
                    {/* Image Source */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-text-disabled uppercase tracking-widest">
                            <span>Base Blueprint</span>
                            <span className="text-primary font-black">STRIKE-REQUIRED</span>
                        </div>
                        <div className="group relative">
                            <input
                                type="text"
                                placeholder="Paste creation URL or upload image..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-surface-2 border border-border rounded-2xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface p-2.5 rounded-xl border border-border hover:bg-primary hover:text-white transition-all text-text-secondary">
                                <Upload size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Duration & Motion Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Temporal flow</label>
                            <div className="flex gap-3">
                                {[3, 5].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d as any)}
                                        className={`
                      flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 relative overflow-hidden
                      ${duration === d ? "border-primary bg-primary text-white shadow-xl shadow-primary/30" : "border-border bg-surface-2 text-text-disabled hover:border-text-disabled"}
                    `}
                                    >
                                        {duration === d && <motion.div layoutId="durationActive" className="absolute inset-0 bg-primary-dark/20" />}
                                        <Clock size={16} className="relative z-10" />
                                        <span className="font-black text-xs relative z-10">{d}s PULSE</span>
                                        <span className={`text-[10px] font-bold opacity-70 relative z-10 ${duration === d ? "text-white/80" : "text-text-disabled"}`}>
                                            {d === 3 ? "5" : "8"} CREDITS
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Kinematic style</label>
                            <div className="grid grid-cols-1 gap-2">
                                {MOTION_PRESETS.map((p) => {
                                    const isActive = motionStyle === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setMotionStyle(p.id)}
                                            className={`
                        p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center group
                        ${isActive ? "border-primary bg-primary/[0.03]" : "border-border bg-surface-2 hover:border-text-disabled"}
                      `}
                                        >
                                            <div>
                                                <h4 className={`text-sm font-black tracking-tight ${isActive ? "text-primary" : "text-text-primary"}`}>{p.label}</h4>
                                                <p className="text-[11px] text-text-secondary">{p.description}</p>
                                            </div>
                                            <div className={`
                                        p-1.5 rounded-lg transition-all
                                        ${isActive ? "bg-primary text-white scale-110" : "bg-surface border border-border text-text-disabled group-hover:border-text-disabled"}
                                      `}>
                                                <Play size={14} fill={isActive ? "currentColor" : "none"} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!imageUrl || state.status === "submitting" || state.status === "generating"}
                        className="w-full btn-primary py-5 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {state.status === "submitting" || state.status === "generating" ? (
                            <RefreshCw size={24} className="animate-spin" />
                        ) : (
                            <Wand2 size={24} />
                        )}
                        Ignite Generation
                    </button>
                </div>
            </div>

            {/* Right Column: Cinema Viewer */}
            <div className="lg:col-span-7 space-y-8">
                <div className="bg-surface-2 rounded-[40px] border-2 border-border aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-inner group/cinema">
                    {(!imageUrl && state.status === "idle") && (
                        <div className="text-center space-y-6 max-w-sm animate-fade-in">
                            <div className="w-24 h-24 bg-surface rounded-[32px] border border-border flex items-center justify-center mx-auto text-text-disabled shadow-sm group-hover/cinema:rotate-3 transition-transform">
                                <Film size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-text-primary">Cinema Core Offline</h3>
                                <p className="text-sm text-text-secondary leading-relaxed px-6">Provide a source image on the left to activate the motion generation neural networks.</p>
                            </div>
                        </div>
                    )}

                    {(imageUrl && state.status === "idle") && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <img src={imageUrl} alt="Base" className="w-full h-full object-cover scale-105 blur-[2px] opacity-50 absolute" />
                            <div className="relative group/play">
                                <img src={imageUrl} alt="Base" className="max-w-[85%] max-h-[85%] rounded-3xl shadow-2xl border-2 border-white/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border-4 border-white/20 scale-90 group-hover/play:scale-100 transition-all cursor-pointer">
                                        <Play size={40} fill="currentColor" className="ml-2" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-10 left-10 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-[10px] font-black tracking-widest text-white shadow-2xl">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" /> IMAGE LOADED
                            </div>
                        </motion.div>
                    )}

                    {(state.status === "submitting" || state.status === "generating") && (
                        <div className="flex flex-col items-center gap-10 animate-fade-in text-center px-10">
                            <div className="relative w-40 h-40">
                                <motion.div
                                    className="absolute inset-0 border-[8px] border-primary/10 rounded-full"
                                />
                                <motion.div
                                    className="absolute inset-0 border-[8px] border-primary rounded-full border-t-transparent shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-primary">
                                    <Sparkles size={48} className="animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-2xl font-black text-text-primary italic uppercase tracking-tighter">Bending Time...</p>
                                <div className="h-1.5 w-64 bg-border rounded-full overflow-hidden mx-auto">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "95%" }}
                                        transition={{ duration: 45, ease: "linear" }}
                                    />
                                </div>
                                <p className="text-[11px] text-text-disabled font-bold tracking-widest uppercase mt-2">Neural Interpolation in Progress</p>
                            </div>
                        </div>
                    )}

                    {state.status === "complete" && state.outputUrl && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black flex items-center justify-center"
                        >
                            <video
                                src={state.outputUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute top-10 right-10 flex gap-3">
                                <a
                                    href={state.outputUrl}
                                    download
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl shadow-2xl transition-all"
                                >
                                    <Upload className="w-5 h-5 rotate-180" />
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {state.status === "error" && (
                        <div className="p-12 text-center space-y-6 text-error max-w-sm">
                            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Temporal Failure</h3>
                                <p className="text-sm opacity-80 leading-relaxed">{state.errorMessage}</p>
                            </div>
                            <button onClick={resetState} className="w-full btn-secondary py-4 font-black uppercase text-xs tracking-widest">Re-initialize Engine</button>
                        </div>
                    )}
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: "Final Resolution", value: "HD 768px" },
                        { label: "Neural Speed", value: "24-30 FPS" },
                        { label: "Encoding", value: "MP4 / H.264" },
                    ].map((spec) => (
                        <div key={spec.label} className="p-6 bg-surface rounded-[24px] border border-border shadow-sm group hover:border-primary transition-all">
                            <p className="text-[10px] text-text-disabled font-black uppercase tracking-widest mb-1.5 group-hover:text-primary transition-colors">{spec.label}</p>
                            <p className="text-lg font-black text-text-primary tracking-tight">{spec.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Plus({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

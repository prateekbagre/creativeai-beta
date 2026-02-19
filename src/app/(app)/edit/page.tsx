"use client";
/**
 * src/app/(app)/edit/page.tsx
 * PRD Reference: Section 4 (Image Editing)
 * Features: BG Removal, Upscaling, Enhancement, Inpainting.
 */
import { useState, useEffect } from "react";
import { Sparkles, Wand2, RefreshCw, AlertCircle, Upload, Eraser, Maximize, Scissors, Layers, Plus } from "lucide-react";
import { useGenerationStore } from "@/hooks/useGenerationStore";
import { motion, AnimatePresence } from "framer-motion";

type Tool = "bg-remove" | "upscale" | "enhance" | "inpaint";

const TOOLS: { id: Tool; label: string; icon: any; description: string; cost: number }[] = [
    { id: "bg-remove", label: "Remove BG", icon: Scissors, description: "Remove background instantly", cost: 2 },
    { id: "upscale", label: "Upscale", icon: Maximize, description: "Enhance resolution up to 4x", cost: 2 },
    { id: "enhance", label: "Enhance", icon: Sparkles, description: "Fix faces and restore colors", cost: 1 },
    { id: "inpaint", label: "Inpaint", icon: Eraser, description: "Edit parts of an image", cost: 3 },
];

export default function EditPage() {
    const [selectedTool, setSelectedTool] = useState<Tool>("bg-remove");
    const [imageUrl, setImageUrl] = useState("");
    const [upscaleScale, setUpscaleScale] = useState<2 | 4>(2);
    const [enhanceType, setEnhanceType] = useState<"auto" | "face" | "colorize">("auto");
    const [inpaintPrompt, setInpaintPrompt] = useState("");

    const { state, startGeneration, subscribeToJob, resetState } = useGenerationStore();

    useEffect(() => {
        if (state.jobId && (state.status === "submitting" || state.status === "generating")) {
            const unsubscribe = subscribeToJob(state.jobId);
            return unsubscribe;
        }
    }, [state.jobId, state.status, subscribeToJob]);

    const handleAction = async () => {
        resetState();
        let endpoint = "";
        let body: any = { imageUrl };

        if (selectedTool === "bg-remove") {
            endpoint = "/api/edit/background-remove";
        } else if (selectedTool === "upscale") {
            endpoint = "/api/edit/upscale";
            body.scale = upscaleScale;
        } else if (selectedTool === "enhance") {
            endpoint = "/api/edit/enhance";
            body.enhancementType = enhanceType;
        } else if (selectedTool === "inpaint") {
            endpoint = "/api/edit/inpaint";
            body.prompt = inpaintPrompt;
            body.maskUrl = ""; // TODO: Implement masking
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Action failed");

            startGeneration(result.jobId, result.creditsCost, result.creditsRemaining);
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Left Column: Tools & Input */}
            <div className="lg:col-span-4 space-y-6">
                <header>
                    <h1 className="text-4xl font-heading font-black text-text-primary tracking-tighter mb-2">Refine & Edit</h1>
                    <p className="text-text-secondary leading-relaxed">Precision AI tools to perfect every pixel of your creations.</p>
                </header>

                {/* Source Input */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-text-disabled uppercase tracking-widest">Target Image</label>
                    <div className="group relative">
                        <input
                            type="text"
                            placeholder="Paste creation URL or upload..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full bg-surface border border-border rounded-2xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-2 p-2.5 rounded-xl border border-border hover:bg-primary hover:text-white hover:border-primary transition-all text-text-secondary">
                            <Upload size={18} />
                        </button>
                    </div>
                </div>

                {/* Tool Selection Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = selectedTool === tool.id;
                        return (
                            <motion.button
                                key={tool.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTool(tool.id)}
                                className={`
                  flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden
                  ${isActive ? "border-primary bg-primary/[0.03]" : "border-border hover:border-text-disabled bg-surface"}
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTool"
                                        className="absolute inset-0 bg-primary/5 pointer-events-none"
                                    />
                                )}
                                <div className={`
                  p-2.5 rounded-xl transition-colors
                  ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-2 text-text-secondary"}
                `}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 relative">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`font-bold transition-colors ${isActive ? "text-primary" : "text-text-primary"}`}>
                                            {tool.label}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${isActive ? "bg-primary text-white" : "bg-surface-2 text-text-disabled"}`}>
                                            {tool.cost} CREDITS
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary leading-tight">{tool.description}</p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Dynamic Controls */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedTool}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-text-disabled uppercase tracking-widest">{selectedTool.replace("-", " ")} Options</h4>
                            <div className="h-1 w-12 bg-border rounded-full" />
                        </div>

                        {selectedTool === "upscale" && (
                            <div className="grid grid-cols-2 gap-3">
                                {[2, 4].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setUpscaleScale(s as any)}
                                        className={`py-3 text-xs font-black rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${upscaleScale === s ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" : "border-border bg-surface-2 text-text-disabled hover:border-text-disabled"}`}
                                    >
                                        <span className="text-lg">{s}X</span>
                                        <span className="opacity-70">MAGNIFY</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedTool === "enhance" && (
                            <div className="space-y-2">
                                {["auto", "face", "colorize"].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setEnhanceType(t as any)}
                                        className={`w-full py-3 px-4 text-xs font-bold rounded-xl border-2 text-left transition-all flex items-center justify-between ${enhanceType === t ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-border bg-surface-2 text-text-secondary hover:border-text-disabled"}`}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)} Enhancement
                                        {enhanceType === t && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedTool === "inpaint" && (
                            <div className="space-y-3">
                                <textarea
                                    placeholder="Describe exactly what to change in the image..."
                                    value={inpaintPrompt}
                                    onChange={(e) => setInpaintPrompt(e.target.value)}
                                    className="w-full h-28 p-4 bg-surface-2 border border-border rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <div className="p-3 bg-primary-light/30 border border-primary/20 rounded-xl flex gap-3 italic">
                                    <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-primary-dark leading-normal">
                                        Brush/Masking tool coming soon. Use descriptive prompts for best results with current auto-detection.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleAction}
                            disabled={!imageUrl || state.status === "submitting" || state.status === "generating"}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50"
                        >
                            {state.status === "submitting" || state.status === "generating" ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <Wand2 size={20} />
                            )}
                            <span className="font-black uppercase tracking-widest text-sm">Apply Changes</span>
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Right Column: Preview/Canvas Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-surface-2 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 relative min-h-[600px] overflow-hidden group/canvas">
                    {(!imageUrl && state.status === "idle") && (
                        <div className="text-center space-y-6 max-w-xs animate-fade-in">
                            <div className="w-20 h-20 bg-surface rounded-3xl border border-border flex items-center justify-center mx-auto text-text-disabled shadow-sm">
                                <Layers size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-text-primary">Awaiting Vision</h3>
                                <p className="text-sm text-text-secondary">Provide an image URL or upload a file to begin the AI edit process.</p>
                            </div>
                        </div>
                    )}

                    {(imageUrl && state.status === "idle") && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <img src={imageUrl} alt="Source" className="max-w-full max-h-[700px] rounded-2xl shadow-2xl border border-border group-hover/canvas:scale-[1.01] transition-transform duration-700" />
                            <div className="absolute top-6 left-6 flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest text-text-primary shadow-lg">
                                <span className="w-2 h-2 bg-text-disabled rounded-full" /> SOURCE IMAGE
                            </div>
                        </motion.div>
                    )}

                    {(state.status === "submitting" || state.status === "generating") && (
                        <div className="flex flex-col items-center gap-8 animate-fade-in text-center">
                            <div className="relative w-32 h-32">
                                <motion.div
                                    className="absolute inset-0 border-[6px] border-primary/20 rounded-full"
                                />
                                <motion.div
                                    className="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-primary">
                                    <Sparkles size={40} className="animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-black text-text-primary italic uppercase tracking-tighter">Synthesizing Pixels</p>
                                <p className="text-sm text-text-secondary">Your AI creation is being meticulously modified...</p>
                            </div>
                        </div>
                    )}

                    {state.status === "complete" && state.outputUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <img src={state.outputUrl} alt="Result" className="max-w-full max-h-[700px] rounded-2xl shadow-2xl border-2 border-primary/20" />
                            <div className="absolute top-6 left-6 flex items-center gap-2 bg-primary text-white border border-primary/20 px-4 py-2 rounded-full text-[10px] font-black tracking-widest shadow-xl">
                                <Sparkles size={12} /> ENHANCED RESULT
                            </div>
                            <div className="absolute bottom-6 right-6 flex gap-3">
                                <button onClick={() => setImageUrl(state.outputUrl!)} className="bg-surface/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-2xl flex items-center gap-2 text-xs font-black hover:bg-primary hover:text-white hover:border-primary transition-all group/btn">
                                    <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" /> Iterate on this
                                </button>
                                <a
                                    href={state.outputUrl}
                                    download
                                    target="_blank"
                                    className="bg-primary text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black hover:scale-105 transition-transform"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {state.status === "error" && (
                        <div className="text-center space-y-6 text-error p-12 max-w-sm">
                            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold">Modification Failed</h3>
                                <p className="text-sm opacity-80 leading-relaxed">{state.errorMessage}</p>
                            </div>
                            <button onClick={resetState} className="w-full btn-secondary py-3 px-6 font-bold">Return to Dashboard</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Check({ size, className }: { size: number; className?: string }) {
    return <Sparkles size={size} className={className} />; // Using Sparkles as a check variant
}

function Download({ className }: { className?: string }) {
    return <Upload className={`${className} rotate-180`} />;
}

function ImageIcon({ size, className }: { size: number; className?: string }) {
    return <Layers size={size} className={className} />;
}

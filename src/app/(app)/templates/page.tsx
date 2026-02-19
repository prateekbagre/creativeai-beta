"use client";
/**
 * src/app/(app)/templates/page.tsx
 * PRD Reference: Section 6 (Template Library)
 * Features: Category filters, search, featured badges, "Use" template.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, LayoutGrid, Sparkles, Wand2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DbTemplate, TemplateCategory } from "@/types";

const CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
    { id: "all", label: "All Templates" },
    { id: "social_post", label: "Social Media" },
    { id: "thumbnail", label: "Thumbnails" },
    { id: "wallpaper", label: "Wallpapers" },
    { id: "avatar", label: "Avatars" },
    { id: "artistic", label: "Artistic" },
    { id: "seasonal", label: "Seasonal" },
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<DbTemplate[]>([]);
    const [category, setCategory] = useState<TemplateCategory | "all">("all");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTemplates();
    }, [category]);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/templates?category=${category}&search=${search}`);
            const data = await res.json();
            setTemplates(data.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTemplate = (template: DbTemplate) => {
        const params = new URLSearchParams({
            prompt: template.prompt,
            style: template.style_preset,
            ratio: template.aspect_ratio,
        });
        router.push(`/create?${params.toString()}`);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                        <LayoutGrid size={12} /> Blueprint Repository
                    </div>
                    <h1 className="text-5xl font-heading font-black text-text-primary tracking-tighter">Templates</h1>
                    <p className="text-text-secondary mt-2 leading-relaxed">High-fidelity neural baselines engineered for maximum creativity.</p>
                </div>
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        placeholder="Search neural patterns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchTemplates()}
                        className="w-full bg-surface-2 border border-border rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-inner group-hover:bg-surface"
                    />
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex bg-surface border border-border p-2 rounded-[24px] shadow-sm overflow-x-auto no-scrollbar gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`
            px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl whitespace-nowrap transition-all
            ${category === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-disabled hover:text-text-primary hover:bg-surface-2"}
          `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[4/5] bg-surface-2 rounded-3xl border border-border animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {templates.map((t) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                            >
                                {/* Image Container */}
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <img
                                        src={t.thumbnail_url}
                                        alt={t.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {t.is_featured && (
                                            <span className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/20 tracking-widest uppercase">
                                                <Sparkles size={12} fill="currentColor" /> ELITE
                                            </span>
                                        )}
                                        {!t.is_free && (
                                            <span className="bg-black/60 backdrop-blur-xl text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 tracking-widest uppercase">
                                                <Lock size={12} /> PRO CORE
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-primary/10 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => handleUseTemplate(t)}
                                            className="bg-white text-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <Wand2 size={16} fill="currentColor" /> INITIATE SEQUENCER
                                        </button>
                                    </div>
                                </div>

                                {/* Info Panel */}
                                <div className="p-6 bg-surface border-t border-border relative">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                {t.category.replace("_", " ")}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-border" />
                                        </div>
                                        <h3 className="font-black text-text-primary text-lg tracking-tight uppercase italic truncate">{t.title}</h3>
                                    </div>
                                    <div className="mt-4 flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="h-0.5 flex-1 bg-border group-hover:bg-primary/20 transition-colors" />)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!isLoading && templates.length === 0 && (
                <div className="text-center py-40 bg-surface-2 rounded-[60px] border-2 border-dashed border-border">
                    <div className="w-24 h-24 bg-surface rounded-[32px] border border-border flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <LayoutGrid size={48} className="text-text-disabled" />
                    </div>
                    <h3 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">Library Empty</h3>
                    <p className="text-sm text-text-secondary mt-4">Adjust your neural filters to locate compatible blueprints.</p>
                </div>
            )}
        </div>
    );
}

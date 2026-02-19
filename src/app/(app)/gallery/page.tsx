"use client";
/**
 * src/app/(app)/gallery/page.tsx
 * PRD Reference: Section 7 (Personal Gallery)
 * Features: Grid of creations, favorites toggle, lightbox view, delete/download.
 */
import { useState, useEffect } from "react";
import { Image as ImageIcon, Heart, Download, Trash2, Maximize2, Filter, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DbGalleryItem } from "@/types";

export default function GalleryPage() {
    const [items, setItems] = useState<DbGalleryItem[]>([]);
    const [filter, setFilter] = useState<"all" | "favorites">("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGallery();
    }, [filter]);

    const fetchGallery = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/gallery?favorites=${filter === "favorites"}`);
            const data = await res.json();
            setItems(data.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (id: string, current: boolean) => {
        // Optimistic update
        setItems(prev => prev.map(item => item.id === id ? { ...item, is_favorite: !current } : item));

        try {
            await fetch(`/api/gallery/${id}/favorite`, { method: "POST" });
        } catch (error) {
            // Revert if failed
            setItems(prev => prev.map(item => item.id === id ? { ...item, is_favorite: current } : item));
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this creation?")) return;

        setItems(prev => prev.filter(item => item.id !== id));
        try {
            await fetch(`/api/gallery/${id}`, { method: "DELETE" });
        } catch (error) {
            fetchGallery(); // Refresh on error
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest mb-4">
                        <ImageIcon size={12} /> Neural Archive
                    </div>
                    <h1 className="text-5xl font-heading font-black text-text-primary tracking-tighter">My Gallery</h1>
                    <p className="text-text-secondary mt-2">Vault of your materialized visions and digital artifacts.</p>
                </div>

                <div className="flex bg-surface-2 border border-border p-1.5 rounded-[20px] shadow-inner">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-disabled hover:text-text-primary"}`}
                    >
                        Total Recall
                    </button>
                    <button
                        onClick={() => setFilter("favorites")}
                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === "favorites" ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-text-disabled hover:text-text-primary"}`}
                    >
                        Prioritized
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="aspect-square bg-surface-2 rounded-3xl border border-border animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative aspect-square bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                            >
                                {item.type === "image" ? (
                                    <img
                                        src={item.output_url}
                                        alt={item.prompt || "Creation"}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                                        <video src={item.output_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-full text-white border border-white/20 shadow-2xl transform group-hover:scale-110 transition-transform">
                                                <Clock size={24} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                    <button
                                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                                        className={`p-3 rounded-2xl backdrop-blur-2xl shadow-2xl transition-all ${item.is_favorite ? "bg-secondary text-white scale-110" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"}`}
                                    >
                                        <Heart size={18} fill={item.is_favorite ? "currentColor" : "none"} />
                                    </button>
                                    <a
                                        href={item.output_url}
                                        download
                                        target="_blank"
                                        className="p-3 rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 shadow-2xl hover:bg-white/20 transition-all"
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-3 rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 shadow-2xl hover:bg-red-500/80 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="absolute bottom-5 left-5 right-5 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">PROMPT SEED</div>
                                    <p className="text-[11px] text-white font-black leading-tight line-clamp-2 uppercase italic tracking-tighter">
                                        {item.prompt || "NEURAL GENERATION"}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!isLoading && items.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-40 bg-surface-2 rounded-[60px] border-2 border-dashed border-border"
                >
                    <div className="w-24 h-24 bg-surface rounded-[32px] border border-border flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ImageIcon size={48} className="text-text-disabled" />
                    </div>
                    <h3 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase underline decoration-primary decoration-4 underline-offset-8">Void Detected</h3>
                    <p className="text-sm text-text-secondary max-w-xs mx-auto mt-6 leading-relaxed">
                        {filter === "favorites"
                            ? "Your prioritized neural signals are currently missing. Mark visions as favorites to populate this vault."
                            : "The archive is empty. Begin a manifestation sequence to record your first digital artifact."
                        }
                    </p>
                    <button
                        className="btn-primary mt-10 px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        onClick={() => window.location.href = '/create'}
                    >
                        INITIATE CREATION
                    </button>
                </motion.div>
            )}
        </div>
    );
}

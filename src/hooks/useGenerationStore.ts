// ─────────────────────────────────────────────────────────────────
//  Generation Store (Zustand)
//  Manages the state of an active image/video generation job.
//  Connects to Supabase Realtime to receive job status updates.
//  PRD Reference: Section 3.6 (generation states), 10.4 (async arch)
// ─────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { GenerationState, StylePreset, AspectRatio } from "@/types";

interface GenerationStore {
  state: GenerationState;
  creditBalance: number;

  // Actions
  startGeneration: (jobId: string, creditsCost: number, creditsRemaining: number) => void;
  subscribeToJob: (jobId: string) => () => void; // returns unsubscribe fn
  resetState: () => void;
  updateCredits: (remaining: number) => void;
}

const INITIAL_STATE: GenerationState = {
  status: "idle",
  jobId: null,
  outputUrl: null,
  thumbnailUrl: null,
  galleryItemId: null,
  errorMessage: null,
  queuePosition: null,
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  state: INITIAL_STATE,
  creditBalance: 0,

  startGeneration(jobId, creditsCost, creditsRemaining) {
    set({
      state: { ...INITIAL_STATE, status: "submitting", jobId },
      creditBalance: creditsRemaining,
    });
  },

  subscribeToJob(jobId: string) {
    const supabase = createClient();

    // Subscribe to Supabase Realtime on the generation_jobs row
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generation_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const job = payload.new as any;

          if (job.status === "processing") {
            set((s) => ({ state: { ...s.state, status: "generating" } }));
          }

          if (job.status === "complete") {
            set((s) => ({
              state: {
                ...s.state,
                status: "complete",
                outputUrl: job.output_url,
                thumbnailUrl: job.thumbnail_url,
                galleryItemId: job.gallery_item_id,
              },
            }));
          }

          if (job.status === "failed") {
            set((s) => ({
              state: {
                ...s.state,
                status: "error",
                errorMessage: job.error_message ?? "Something went wrong.",
              },
            }));
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },

  resetState() {
    set({ state: INITIAL_STATE });
  },

  updateCredits(remaining: number) {
    set({ creditBalance: remaining });
  },
}));

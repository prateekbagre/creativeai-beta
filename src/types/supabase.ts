export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string | null
                    display_name: string | null
                    avatar_url: string | null
                    plan: string
                    credits_remaining: number
                    credits_monthly_allowance: number
                    credits_rollover_balance: number
                    stripe_customer_id: string | null
                    onboarding_complete: boolean
                    preferred_style: string | null
                    last_seen_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    display_name?: string | null
                    avatar_url?: string | null
                    plan?: string
                    credits_remaining?: number
                    credits_monthly_allowance?: number
                    credits_rollover_balance?: number
                    stripe_customer_id?: string | null
                    onboarding_complete?: boolean
                    preferred_style?: string | null
                    last_seen_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    display_name?: string | null
                    avatar_url?: string | null
                    plan?: string
                    credits_remaining?: number
                    credits_monthly_allowance?: number
                    credits_rollover_balance?: number
                    stripe_customer_id?: string | null
                    onboarding_complete?: boolean
                    preferred_style?: string | null
                    last_seen_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            generation_jobs: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    status: string
                    prompt: string | null
                    style_preset: string | null
                    aspect_ratio: string | null
                    motion_prompt: string | null
                    duration_seconds: number | null
                    credits_cost: number
                    replicate_prediction_id: string | null
                    output_urls: string[] | null
                    error_message: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    status: string
                    prompt?: string | null
                    style_preset?: string | null
                    aspect_ratio?: string | null
                    motion_prompt?: string | null
                    duration_seconds?: number | null
                    credits_cost: number
                    replicate_prediction_id?: string | null
                    output_urls?: string[] | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    status?: string
                    prompt?: string | null
                    style_preset?: string | null
                    aspect_ratio?: string | null
                    motion_prompt?: string | null
                    duration_seconds?: number | null
                    credits_cost?: number
                    replicate_prediction_id?: string | null
                    output_urls?: string[] | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            credit_transactions: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    balance_after: number
                    type: string
                    reference_id: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    balance_after: number
                    type: string
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    balance_after?: number
                    type?: string
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
            collections: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                }
            }
            gallery_items: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    output_url: string
                    thumbnail_url: string
                    prompt: string
                    negative_prompt: string | null
                    style_preset: string | null
                    aspect_ratio: string | null
                    model_used: string
                    seed: number | null
                    source: string
                    is_favorite: boolean
                    collection_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    output_url: string
                    thumbnail_url: string
                    prompt: string
                    negative_prompt?: string | null
                    style_preset?: string | null
                    aspect_ratio?: string | null
                    model_used: string
                    seed?: number | null
                    source: string
                    is_favorite?: boolean
                    collection_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    output_url?: string
                    thumbnail_url?: string
                    prompt?: string
                    negative_prompt?: string | null
                    style_preset?: string | null
                    aspect_ratio?: string | null
                    model_used?: string
                    seed?: number | null
                    source?: string
                    is_favorite?: boolean
                    collection_id?: string | null
                    created_at?: string
                }
            }
            templates: {
                Row: {
                    id: string
                    title: string
                    category: string
                    thumbnail_url: string
                    prompt: string
                    negative_prompt: string | null
                    style_preset: string
                    aspect_ratio: string
                    is_featured: boolean
                    is_free: boolean
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    category: string
                    thumbnail_url: string
                    prompt: string
                    negative_prompt?: string | null
                    style_preset: string
                    aspect_ratio: string
                    is_featured?: boolean
                    is_free?: boolean
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    category?: string
                    thumbnail_url?: string
                    prompt?: string
                    negative_prompt?: string | null
                    style_preset?: string
                    aspect_ratio?: string
                    is_featured?: boolean
                    is_free?: boolean
                    sort_order?: number
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

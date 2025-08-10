import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          user_agent: string | null
          created_at: string
          completed_at: string | null
          completed_ms: number | null
        }
        Insert: {
          id?: string
          user_agent?: string | null
          created_at?: string
          completed_at?: string | null
          completed_ms?: number | null
        }
        Update: {
          id?: string
          user_agent?: string | null
          created_at?: string
          completed_at?: string | null
          completed_ms?: number | null
        }
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: number
          answer: 'A' | 'B'
          axis: string
          weight: number
          version: number
          timestamp: string
          latency_ms: number | null
        }
        Insert: {
          id?: string
          session_id: string
          question_id: number
          answer: 'A' | 'B'
          axis: string
          weight?: number
          version?: number
          timestamp?: string
          latency_ms?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: number
          answer?: 'A' | 'B'
          axis?: string
          weight?: number
          version?: number
          timestamp?: string
          latency_ms?: number | null
        }
      }
      results: {
        Row: {
          id: string
          session_id: string
          primary_type: string
          secondary_type: string
          confidence: number
          axes_scores: Record<string, number>
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          primary_type: string
          secondary_type: string
          confidence: number
          axes_scores: Record<string, number>
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          primary_type?: string
          secondary_type?: string
          confidence?: number
          axes_scores?: Record<string, number>
          timestamp?: string
        }
      }
    }
  }
}
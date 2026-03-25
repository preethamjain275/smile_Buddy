import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RoastMessage {
  id: string;
  level: number;
  message: string;
  audio_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface SmileDetectedMessage {
  id: string;
  message: string;
  audio_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface AppSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

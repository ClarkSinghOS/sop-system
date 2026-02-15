import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for SOP system
export interface DBProcess {
  id: string;
  process_id: string;
  name: string;
  department: string;
  owner_id: string | null;
  version: string;
  status: 'draft' | 'active' | 'deprecated';
  human_content: object;
  ai_content: object;
  created_at: string;
  updated_at: string;
}

export interface DBProcessStep {
  id: string;
  process_id: string;
  step_id: string;
  sequence: number;
  name: string;
  short_description: string;
  long_description: string;
  owner_role: string;
  duration_estimate: string | null;
  automatable: 'none' | 'partial' | 'full';
  video_url: string | null;
  media: object | null;
  ai_definition: object | null;
}

export interface DBProcessConnection {
  id: string;
  from_process_id: string;
  to_process_id: string;
  connection_type: string;
  condition: string | null;
}

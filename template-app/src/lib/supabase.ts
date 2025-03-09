import { createClient } from '@supabase/supabase-js';

// Supabaseの環境変数を定義
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
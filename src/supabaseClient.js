import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zcoyhczoajqkqwksmlet.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjb3loY3pvYWpxa3F3a3NtbGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDk3NDIsImV4cCI6MjA2OTU4NTc0Mn0.1fS7Z-5E5cValnk1Glb_J8HJ-buSrjX53VJ2lY5ZO6E'

// Create Supabase client with additional options to handle CORS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
  }
})


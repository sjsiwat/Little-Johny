import { createClient } from "@supabase/supabase-js";

// Public URL + anon key — safe to expose client-side (RLS protects the data).
// Defaults match the values previously embedded directly in auth.js.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://amcutibopnfasxrfexdi.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY3V0aWJvcG5mYXN4cmZleGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDM2OTMsImV4cCI6MjA5NzYxOTY5M30.Re8H1by-m7xjoP3skdAWI5th-DqzpF04SCuBnm-PFkc";

export const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID ?? "2010502491";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

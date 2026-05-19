import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_PROJECT_URL";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dmtnb3VpYWFwYWdtZGxob2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NjMwOTIsImV4cCI6MjA5NDAzOTA5Mn0.keDgbqeTcUv_hO45nJdFE2Cs2frgmqz6jmv8idQb6_A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
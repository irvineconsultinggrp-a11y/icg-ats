import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./env";

export const createClient = () => {
  const { url, key } = getPublicSupabaseEnv();
  return createBrowserClient(url, key);
};

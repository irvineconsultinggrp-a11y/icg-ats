import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-officer-role.mjs <email>");
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data: authData, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});

if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const user = authData.users.find(
  (u) => u.email?.toLowerCase() === email.trim().toLowerCase(),
);
if (!user) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: "officer" },
});

if (updateError) {
  console.error("Failed to update role:", updateError.message);
  process.exit(1);
}

console.log(`Updated ${email} to officer (user id: ${user.id})`);

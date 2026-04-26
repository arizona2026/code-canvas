// DELETE /delete-document
// Instructor-only. Body: { id: number }
// Removes both the storage object and the documents row.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!["POST", "DELETE"].includes(req.method)) return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
  const user = userData.user;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Verify instructor role
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "instructor")
    .maybeSingle();

  if (!roleRow) return json({ error: "Forbidden: instructors only" }, 403);

  // Parse body
  let body: { id?: number | string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);
  if (!Number.isFinite(id) || id <= 0) return json({ error: "Valid document id required" }, 400);

  // Look up document to get storage_path
  const { data: doc, error: fetchErr } = await admin
    .from("documents")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return json({ error: "Lookup failed", details: fetchErr.message }, 500);
  if (!doc) return json({ error: "Document not found" }, 404);

  // Remove storage object first (best effort)
  const { error: removeErr } = await admin.storage.from("documents").remove([doc.storage_path]);
  if (removeErr) {
    console.warn("Storage remove failed:", removeErr.message);
  }

  // Delete row
  const { error: deleteErr } = await admin.from("documents").delete().eq("id", id);
  if (deleteErr) return json({ error: "Delete failed", details: deleteErr.message }, 500);

  return json({ success: true, deleted_id: id });
});

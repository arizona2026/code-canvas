// GET /list-documents
// Returns documents. Optional query params:
//   - class_id: filter by class
//   - assignment_tag: filter by assignment (logical folder)
// All authenticated users (instructors + students) can read.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await client.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const class_id = url.searchParams.get("class_id");
  const assignment_tag = url.searchParams.get("assignment_tag");

  let query = client
    .from("documents")
    .select("id, class_id, title, original_filename, content_type, file_size, storage_path, assignment_tag, uploaded_by, visibility, status, created_at")
    .order("created_at", { ascending: false });

  if (class_id) query = query.eq("class_id", class_id);
  if (assignment_tag) query = query.eq("assignment_tag", assignment_tag);

  const { data, error } = await query;
  if (error) return json({ error: "Query failed", details: error.message }, 500);

  // Group by assignment_tag for "virtual folder" view
  const grouped: Record<string, typeof data> = {};
  for (const doc of data ?? []) {
    (grouped[doc.assignment_tag] ||= []).push(doc);
  }

  return json({
    documents: data ?? [],
    grouped_by_assignment: grouped,
    count: data?.length ?? 0,
  });
});

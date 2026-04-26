// POST /rag-context
// Returns documents scoped strictly to one assignment_tag for use as RAG context.
// STRICT RULE: only documents matching the given assignment_tag are returned.
// No cross-assignment retrieval allowed.
//
// Body: { class_id: string, assignment_tag: string, include_signed_urls?: boolean }
// Response: { assignment_tag, class_id, documents: [...], signed_urls?: { [doc_id]: url } }
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

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

  let body: { class_id?: string; assignment_tag?: string; include_signed_urls?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const class_id = String(body.class_id ?? "").trim();
  const assignment_tag = String(body.assignment_tag ?? "").trim();
  const include_signed_urls = Boolean(body.include_signed_urls);

  if (!class_id) return json({ error: "class_id is required" }, 400);
  if (!assignment_tag) return json({ error: "assignment_tag is required for scoped retrieval" }, 400);

  // STRICT scoping: filter by BOTH class_id AND assignment_tag.
  // No fallback, no cross-assignment retrieval.
  const { data: documents, error } = await userClient
    .from("documents")
    .select("id, class_id, title, original_filename, content_type, file_size, storage_path, assignment_tag, status, created_at")
    .eq("class_id", class_id)
    .eq("assignment_tag", assignment_tag)
    .order("created_at", { ascending: false });

  if (error) return json({ error: "Query failed", details: error.message }, 500);

  // Defensive double-check: ensure no document leaked from another assignment
  const safe = (documents ?? []).filter(
    (d) => d.assignment_tag === assignment_tag && d.class_id === class_id,
  );

  let signed_urls: Record<string, string> | undefined;
  if (include_signed_urls && safe.length > 0) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    signed_urls = {};
    for (const doc of safe) {
      const { data: signed } = await admin.storage
        .from("documents")
        .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour
      if (signed?.signedUrl) signed_urls[String(doc.id)] = signed.signedUrl;
    }
  }

  return json({
    class_id,
    assignment_tag,
    count: safe.length,
    documents: safe,
    ...(signed_urls ? { signed_urls } : {}),
    scope_rule: "strict_assignment_only",
  });
});

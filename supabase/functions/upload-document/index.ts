// POST /upload-document
// Instructor-only. Uploads a file to the documents bucket and creates a documents row.
// Body: multipart/form-data with fields: class_id, assignment_tag, title (optional), visibility (optional), file
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

  // Auth client (uses caller's JWT to identify user)
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
  const user = userData.user;

  // Service client for role check + storage + insert (bypasses RLS, we enforce manually)
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Verify instructor role
  const { data: roleRow, error: roleErr } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "instructor")
    .maybeSingle();

  if (roleErr) return json({ error: "Role check failed", details: roleErr.message }, 500);
  if (!roleRow) return json({ error: "Forbidden: instructors only" }, 403);

  // Parse multipart form
  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return json({ error: "Invalid multipart form data" }, 400);
  }

  const class_id = String(form.get("class_id") ?? "").trim();
  const assignment_tag = String(form.get("assignment_tag") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const visibility = String(form.get("visibility") ?? "student").trim();
  const file = form.get("file");

  if (!class_id) return json({ error: "class_id is required" }, 400);
  if (!assignment_tag) return json({ error: "assignment_tag is required" }, 400);
  if (!(file instanceof File)) return json({ error: "file is required" }, 400);
  if (!["student", "teacher", "private"].includes(visibility)) {
    return json({ error: "visibility must be student | teacher | private" }, 400);
  }

  // Build storage path: class_id/assignment_tag/<uuid>-<filename>
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${class_id}/${assignment_tag}/${crypto.randomUUID()}-${safeName}`;

  const buffer = new Uint8Array(await file.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadErr) return json({ error: "Upload failed", details: uploadErr.message }, 500);

  // Insert document row
  const { data: doc, error: insertErr } = await admin
    .from("documents")
    .insert({
      class_id,
      title: title || file.name,
      storage_path: storagePath,
      original_filename: file.name,
      content_type: file.type || "application/octet-stream",
      file_size: file.size,
      assignment_tag,
      uploaded_by: user.id,
      visibility,
      status: "uploaded",
    })
    .select()
    .single();

  if (insertErr) {
    // Roll back the storage upload
    await admin.storage.from("documents").remove([storagePath]);
    return json({ error: "Database insert failed", details: insertErr.message }, 500);
  }

  return json({ success: true, document: doc }, 201);
});

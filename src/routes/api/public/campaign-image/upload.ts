import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const Route = createFileRoute("/api/public/campaign-image/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return Response.json({ error: "No file provided" }, { status: 400 });
          }
          if (!ALLOWED.has(file.type)) {
            return Response.json(
              { error: "Unsupported image type. Use PNG, JPG, WebP, GIF or AVIF." },
              { status: 400 },
            );
          }
          if (file.size > MAX_BYTES) {
            return Response.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const ext = EXT[file.type] ?? "png";
          const path = `${crypto.randomUUID()}.${ext}`;
          const bytes = new Uint8Array(await file.arrayBuffer());

          const { error } = await supabaseAdmin.storage
            .from("campaign-images")
            .upload(path, bytes, { contentType: file.type, upsert: false });

          if (error) {
            return Response.json({ error: error.message }, { status: 500 });
          }

          const origin = new URL(request.url).origin;
          return Response.json({ url: `${origin}/api/public/campaign-image/${path}` });
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Upload failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

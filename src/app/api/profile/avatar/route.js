import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { badRequest, serverError } from "@/lib/api/http";
import { PROFILE_COLUMNS } from "@/lib/api/profile";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const file = (await request.formData()).get("avatar");

  if (!(file instanceof File)) return badRequest("Attach an image");
  if (!EXTENSIONS[file.type]) return badRequest("Use a JPG, PNG, WebP or GIF");
  if (file.size > MAX_BYTES) return badRequest("Keep avatars under 2 MB");

  // Storage policies only allow writes under the user's own folder.
  const path = `${user.id}/${Date.now()}.${EXTENSIONS[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return serverError(uploadError, "Uploading avatar");

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) return serverError(error, "Saving avatar");
  return NextResponse.json(data);
}

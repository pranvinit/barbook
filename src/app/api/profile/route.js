import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { parseBody, serverError } from "@/lib/api/http";
import { PROFILE_COLUMNS, profileUpdateSchema } from "@/lib/api/profile";

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (error) return serverError(error, "Fetching profile");
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await parseBody(request, profileUpdateSchema);
  if (body.response) return body.response;

  const { data, error } = await supabase
    .from("profiles")
    .update(body.data)
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single();

  if (error?.code === "23505") {
    return NextResponse.json({ error: "That handle is taken" }, { status: 409 });
  }
  if (error) return serverError(error, "Updating profile");
  return NextResponse.json(data);
}

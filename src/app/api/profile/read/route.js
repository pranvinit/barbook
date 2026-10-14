import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/rateLimit";
import { readArtist } from "@/lib/llm";
import { serverError } from "@/lib/api/http";
import { PROFILE_COLUMNS } from "@/lib/api/profile";

// Generates a fresh artist read and stores it on the profile.
export async function POST() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const limited = await checkQuota(supabase, "artist_read");
  if (limited) return limited;

  try {
    const [{ data: profile, error: profileError }, { data: topBars }] = await Promise.all([
      supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).single(),
      supabase
        .from("bars")
        .select("text")
        .eq("owner_id", user.id)
        .not("overall", "is", null)
        .order("overall", { ascending: false })
        .limit(5),
    ]);
    if (profileError) return serverError(profileError, "Fetching profile");

    const read = await readArtist(
      profile,
      (topBars ?? []).map((bar) => bar.text),
      { supabase, userId: user.id }
    );

    const { data, error } = await supabase
      .from("profiles")
      .update({ artist_read: { ...read, generated_at: new Date().toISOString() } })
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) return serverError(error, "Saving artist read");
    return NextResponse.json(data);
  } catch (error) {
    return serverError(error, "Reading artist");
  }
}

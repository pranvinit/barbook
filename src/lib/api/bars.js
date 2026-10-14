import { z } from "zod";

// Never send embeddings to the browser.
export const BAR_COLUMNS =
  "id, song_id, position, text, scores, overall, feedback, rhyme_map, is_public, created_at, updated_at";

export const ARTIST_COLUMNS = "handle, display_name, statement, influences, styles";

export const barTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write a bar first")
    .max(500, "Keep a bar under 500 characters"),
});

// Profile plus the user's latest bars, used as context for the judge.
export async function getJudgeContext(supabase, userId, { excludeId } = {}) {
  let recent = supabase
    .from("bars")
    .select("text")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);
  if (excludeId) recent = recent.neq("id", excludeId);

  const [{ data: artist }, { data: recentBars }] = await Promise.all([
    supabase.from("profiles").select(ARTIST_COLUMNS).eq("id", userId).single(),
    recent,
  ]);

  return {
    artist: artist ?? {},
    context: (recentBars ?? []).map((bar) => bar.text).reverse(),
  };
}

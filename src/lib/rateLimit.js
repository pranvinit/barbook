import { NextResponse } from "next/server";

// Daily LLM calls per user, per kind.
export const DAILY_LIMITS = {
  judge: 100,
  ghostwrite: 30,
  artist_read: 10,
};

/**
 * Returns a 429 response if the user has used up today's quota, otherwise null.
 * Counts rows in llm_calls, so it holds across serverless instances.
 */
export async function checkQuota(supabase, kind) {
  const { data: allowed, error } = await supabase.rpc("has_llm_quota", {
    p_kind: kind,
    p_limit: DAILY_LIMITS[kind],
  });

  if (error) {
    console.error("Quota check failed:", error.message);
    return NextResponse.json({ error: "Could not check quota" }, { status: 500 });
  }

  if (!allowed) {
    return NextResponse.json(
      { error: `Daily limit reached for ${kind.replace("_", " ")}. Try again tomorrow.` },
      { status: 429 }
    );
  }

  return null;
}

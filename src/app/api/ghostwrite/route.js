import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/rateLimit";
import { ghostwrite } from "@/lib/llm";
import { parseBody, serverError } from "@/lib/api/http";
import { ARTIST_COLUMNS } from "@/lib/api/bars";

const ghostwriteSchema = z.object({
  // The verse so far. Defaults to the user's latest bars.
  lines: z.array(z.string().max(500)).max(8).optional(),
});

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await parseBody(request, ghostwriteSchema);
  if (body.response) return body.response;

  const limited = await checkQuota(supabase, "ghostwrite");
  if (limited) return limited;

  try {
    const [{ data: artist }, { data: recent }, { data: best }] = await Promise.all([
      supabase.from("profiles").select(ARTIST_COLUMNS).eq("id", user.id).single(),
      supabase
        .from("bars")
        .select("text")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("bars")
        .select("text")
        .eq("owner_id", user.id)
        .not("overall", "is", null)
        .order("overall", { ascending: false })
        .limit(5),
    ]);

    const lines = body.data.lines ?? (recent ?? []).map((bar) => bar.text).reverse();
    const continuations = await ghostwrite(
      lines,
      { artist: artist ?? {}, examples: (best ?? []).map((bar) => bar.text) },
      { supabase, userId: user.id }
    );

    return NextResponse.json({ continuations });
  } catch (error) {
    return serverError(error, "Ghostwriting");
  }
}

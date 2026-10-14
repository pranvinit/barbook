import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/rateLimit";
import { judgeBar } from "@/lib/llm";
import { parseBody, serverError } from "@/lib/api/http";
import { BAR_COLUMNS, barTextSchema, getJudgeContext } from "@/lib/api/bars";

const BARS_PER_PAGE = 10;

export async function GET(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const page = Math.max(parseInt(request.nextUrl.searchParams.get("page")) || 1, 1);
  const from = (page - 1) * BARS_PER_PAGE;
  const to = from + BARS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("bars")
    .select(BAR_COLUMNS, { count: "exact" })
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return serverError(error, "Fetching bars");

  return NextResponse.json({ bars: data, hasMore: to < count - 1 });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await parseBody(request, barTextSchema);
  if (body.response) return body.response;

  const limited = await checkQuota(supabase, "judge");
  if (limited) return limited;

  const ctx = { supabase, userId: user.id };

  try {
    const judgeContext = await getJudgeContext(supabase, user.id);
    const judgement = await judgeBar(body.data.text, judgeContext, ctx);

    const { data, error } = await supabase
      .from("bars")
      .insert({ owner_id: user.id, text: body.data.text, ...judgement })
      .select(BAR_COLUMNS)
      .single();

    if (error) return serverError(error, "Saving bar");
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return serverError(error, "Judging bar");
  }
}

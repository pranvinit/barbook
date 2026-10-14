import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { checkQuota } from "@/lib/rateLimit";
import { judgeBar } from "@/lib/llm";
import { notFound, parseBody, serverError } from "@/lib/api/http";
import { BAR_COLUMNS, barTextSchema, getJudgeContext } from "@/lib/api/bars";

// Rewrites a bar: keeps the old version as a revision, then re-scores it.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await parseBody(request, barTextSchema);
  if (body.response) return body.response;

  // RLS hides other users' bars, so a miss is a 404 either way.
  const { data: existing } = await supabase
    .from("bars")
    .select("id, text, overall")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return notFound("Bar not found");

  if (existing.text === body.data.text) {
    const { data } = await supabase.from("bars").select(BAR_COLUMNS).eq("id", id).single();
    return NextResponse.json(data);
  }

  const limited = await checkQuota(supabase, "judge");
  if (limited) return limited;

  try {
    const judgeContext = await getJudgeContext(supabase, user.id, { excludeId: id });
    const judgement = await judgeBar(body.data.text, judgeContext, {
      supabase,
      userId: user.id,
    });

    const { error: revisionError } = await supabase
      .from("bar_revisions")
      .insert({ bar_id: id, text: existing.text, overall: existing.overall });
    if (revisionError) return serverError(revisionError, "Saving revision");

    const { data, error } = await supabase
      .from("bars")
      .update({ text: body.data.text, ...judgement })
      .eq("id", id)
      .select(BAR_COLUMNS)
      .single();

    if (error) return serverError(error, "Updating bar");
    return NextResponse.json(data);
  } catch (error) {
    return serverError(error, "Judging bar");
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { supabase, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase
    .from("bars")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return serverError(error, "Deleting bar");
  if (!data) return notFound("Bar not found");
  return NextResponse.json(data);
}

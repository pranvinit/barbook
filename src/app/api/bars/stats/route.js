import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/http";

export async function GET() {
  const { supabase, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase.rpc("avg_score");
  if (error) return serverError(error, "Fetching average score");

  return NextResponse.json({ average: Number(data) || 0 });
}

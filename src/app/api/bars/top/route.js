import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/http";
import { BAR_COLUMNS } from "@/lib/api/bars";

// Hall of fame: the user's three highest-scoring bars.
export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase
    .from("bars")
    .select(BAR_COLUMNS)
    .eq("owner_id", user.id)
    .not("overall", "is", null)
    .order("overall", { ascending: false })
    .limit(3);

  if (error) return serverError(error, "Fetching top bars");
  return NextResponse.json(data);
}

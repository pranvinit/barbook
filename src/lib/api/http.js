import { NextResponse } from "next/server";
import { LlmError, isModelBusy } from "@/lib/llm";

/**
 * Validates a JSON body against a Zod schema.
 * @returns {Promise<{ data: any } | { response: NextResponse }>}
 */
export async function parseBody(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    return { response: badRequest("Body must be valid JSON") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { response: badRequest(result.error.issues[0]?.message ?? "Invalid request") };
  }
  return { data: result.data };
}

export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(error, context) {
  console.error(`${context}:`, error);
  if (isModelBusy(error) || error?.name === "AbortError" || /timed? ?out/i.test(error?.message)) {
    return NextResponse.json(
      { error: "Gemini is busy right now. Try again in a minute." },
      { status: 503 }
    );
  }
  if (error instanceof LlmError) {
    return NextResponse.json(
      { error: "The AI judge is having a moment. Try again." },
      { status: 502 }
    );
  }
  return NextResponse.json({ error: `${context} failed` }, { status: 500 });
}

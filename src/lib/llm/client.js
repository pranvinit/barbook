import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const MODEL = process.env.GOOGLE_GENAI_MODEL_ID || "gemini-2.5-flash";
const MAX_ATTEMPTS = 2;

let ai;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
  }
  return ai;
}

export class LlmError extends Error {}

function toResponseSchema(schema) {
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema);
  return jsonSchema;
}

async function logCall(ctx, entry) {
  if (!ctx?.supabase || !ctx?.userId) return;
  const { error } = await ctx.supabase
    .from("llm_calls")
    .insert({ user_id: ctx.userId, model: MODEL, ...entry });
  if (error) console.error("Failed to log LLM call:", error.message);
}

/**
 * Calls Gemini with structured output and validates the result with Zod.
 * Retries once on an invalid response. Every attempt is logged to llm_calls.
 *
 * @param {Object} options
 * @param {string} options.kind - Call type, used for logging and quotas
 * @param {string} options.system - System instruction
 * @param {string} options.prompt - User prompt (user text already delimited)
 * @param {import("zod").ZodType} options.schema - Expected response shape
 * @param {{ supabase: Object, userId: string }} ctx - Caller's session
 */
export async function generateStructured(
  { kind, system, prompt, schema, temperature },
  ctx
) {
  const responseJsonSchema = toResponseSchema(schema);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const startedAt = Date.now();
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema,
        temperature,
      },
    });

    await logCall(ctx, {
      kind,
      input_tokens: response.usageMetadata?.promptTokenCount ?? null,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? null,
      latency_ms: Date.now() - startedAt,
    });

    try {
      const result = schema.safeParse(JSON.parse(response.text ?? ""));
      if (result.success) return result.data;
      console.warn(`[llm:${kind}] invalid response (attempt ${attempt})`, result.error.issues);
    } catch {
      console.warn(`[llm:${kind}] unparseable response (attempt ${attempt})`);
    }
  }

  throw new LlmError("The model returned an invalid response");
}

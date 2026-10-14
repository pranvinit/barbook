import { generateStructured } from "./client";
import { judgeBarSchema } from "./schemas";
import { buildRhymeMap } from "./rhymeMap";
import { system, buildPrompt } from "./prompts/judgeBar";

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Scores a bar on the rubric and maps its rhyme scheme.
 * @returns {Promise<{ scores: Object, overall: number, feedback: string, rhyme_map: Array }>}
 */
export async function judgeBar(text, { artist, context } = {}, ctx) {
  const result = await generateStructured(
    {
      kind: "judge",
      system,
      prompt: buildPrompt(text, artist, context),
      schema: judgeBarSchema,
      temperature: 0.3,
    },
    ctx
  );

  return {
    scores: Object.fromEntries(
      Object.entries(result.scores).map(([key, value]) => [key, round1(value)])
    ),
    overall: round1(result.overall),
    feedback: result.feedback,
    rhyme_map: buildRhymeMap(text, result.rhymeGroups),
  };
}

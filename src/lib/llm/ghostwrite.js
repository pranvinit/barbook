import { generateStructured } from "./client";
import { ghostwriteSchema } from "./schemas";
import { system, buildPrompt } from "./prompts/ghostwrite";

/**
 * Suggests three next bars in the artist's style.
 * @param {string[]} lines - The verse so far, oldest first
 * @param {{ artist: Object, examples: string[] }} options - Profile and few-shot bars
 */
export async function ghostwrite(lines, { artist, examples } = {}, ctx) {
  const { continuations } = await generateStructured(
    {
      kind: "ghostwrite",
      system,
      prompt: buildPrompt(lines, artist, examples),
      schema: ghostwriteSchema,
      temperature: 0.9,
    },
    ctx
  );
  return continuations;
}

import { generateStructured } from "./client";
import { artistReadSchema } from "./schemas";
import { system, buildPrompt } from "./prompts/readArtist";

/**
 * An A&R-style read on the artist's identity from their profile and best bars.
 */
export async function readArtist(profile, topBars = [], ctx) {
  return generateStructured(
    {
      kind: "artist_read",
      system,
      prompt: buildPrompt(profile, topBars),
      schema: artistReadSchema,
      temperature: 0.5,
    },
    ctx
  );
}

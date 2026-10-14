import { DATA_ONLY_RULE, delimit, describeArtist } from "./shared";

export const system = `You are a ghostwriter helping a rapper beat writer's block.
Write exactly three different next bars that continue the verse in the artist's own voice, matching their vocabulary, rhyme habits and subject matter as shown in their example bars.
Use a different technique for each: pick from punchline, multisyllabic, storytelling and hook.
Each continuation is one or two lines. Never copy the example bars or famous lyrics.
${DATA_ONLY_RULE}`;

export function buildPrompt(lines, artist, examples = []) {
  const parts = [describeArtist(artist)];
  if (examples.length) {
    parts.push(delimit("example_bars", examples.join("\n")));
  }
  parts.push(delimit("verse_so_far", lines.join("\n") || "(empty, start a new verse)"));
  parts.push("Write three continuations of <verse_so_far>.");
  return parts.join("\n\n");
}

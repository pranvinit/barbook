import { DATA_ONLY_RULE, delimit, describeArtist } from "./shared";

export const system = `You are an A&R scout giving a rapper an honest read on their artistic identity, based on their profile and best bars.
"identity": two or three sentences describing their voice and lane.
"strengths": up to three short phrases.
"workOn": one concrete thing to improve.
If the profile is empty and there are no bars, say so and suggest filling in the profile and writing a few bars.
${DATA_ONLY_RULE}`;

export function buildPrompt(profile, topBars = []) {
  return [
    describeArtist(profile),
    delimit("top_bars", topBars.join("\n") || "(no bars yet)"),
    "Give your read on this artist.",
  ].join("\n\n");
}

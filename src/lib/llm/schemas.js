import { z } from "zod";

const score = z.number().min(0).max(10);

export const judgeBarSchema = z.object({
  scores: z.object({
    rhyme: score,
    flow: score,
    wordplay: score,
    punch: score,
    originality: score,
  }),
  overall: score,
  feedback: z.string().max(400),
  rhymeGroups: z
    .array(
      z.object({
        group: z.string().max(2),
        words: z.array(z.string()).max(12),
      })
    )
    .max(6),
});

export const ghostwriteSchema = z.object({
  continuations: z
    .array(
      z.object({
        text: z.string().max(300),
        technique: z.enum(["punchline", "multisyllabic", "storytelling", "hook"]),
      })
    )
    .length(3),
});

export const artistReadSchema = z.object({
  identity: z.string().max(400),
  strengths: z.array(z.string().max(120)).max(3),
  workOn: z.string().max(200),
});

import { z } from "zod";

export const PROFILE_COLUMNS =
  "id, handle, display_name, avatar_url, statement, influences, styles, artist_read";

const tagList = z
  .array(z.string().trim().min(1).max(40))
  .max(20, "That's a lot of tags, keep it under 20");

export const profileUpdateSchema = z
  .object({
    handle: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{3,24}$/, "Handles are 3-24 letters, numbers or underscores"),
    display_name: z.string().trim().max(60),
    statement: z.string().max(1000),
    influences: tagList,
    styles: tagList,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Nothing to update");

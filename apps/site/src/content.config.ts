import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Work history for the 331.7 "date due" slip. WorkSlip.astro sorts it most recent first.
const work = defineCollection({
  loader: file('src/content/work.yaml'),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    start: z.string(), // "2023" or "Mar 2023"
    end: z.string().default('Now'),
    summary: z.string(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { work };

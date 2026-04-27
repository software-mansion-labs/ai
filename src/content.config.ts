import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { file } from "astro/loaders";
import { z } from "astro/zod";

import { linkSchema, parseLinksCsv } from "./lib/links";

const jsonLdNodeSchema = z.looseObject({
  "@type": z.string().min(1),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** All pages all require to have a meaningful description. */
        description: z.string().min(1),
        jsonLd: z.array(jsonLdNodeSchema).optional(),
        clapButtons: z.boolean().default(true),
      }),
    }),
  }),
  links: defineCollection({
    loader: file("src/data/links.csv", {
      parser: (fileContent) => {
        const rows = parseLinksCsv(fileContent);
        return Object.fromEntries(rows.map((row) => [row.url, row]));
      },
    }),
    schema: linkSchema,
  }),
};

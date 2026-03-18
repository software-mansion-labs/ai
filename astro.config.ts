import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLlmsTxt from "starlight-llms-txt";

const site = "https://agentic-engineering.swmansion.com/";
const repo = `https://github.com/software-mansion/agentic-engineering/`;
const defaultOgImage = `${site}og-default.png`;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "Software Mansion Agentic Engineering Guide",
      logo: {
        src: "./src/assets/logo.svg",
        alt: "The Software Mansion Agentic Engineering Guide",
        replacesTitle: true,
      },
      description:
        "Practical guidance for setting up and scaling agentic engineering workflows in real software projects.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/software-mansion/agentic-engineering",
        },
        {
          icon: "x.com",
          label: "X",
          href: "https://x.com/swmansion",
        },
      ],
      sidebar: [
        { label: "Home", slug: "index" },
        {
          label: "Getting Started",
          items: [
            { slug: "getting-started/glossary" },
            { slug: "getting-started/how-to-get-started" },
            { slug: "getting-started/what-can-ai-agents-even-do" },
            { slug: "getting-started/how-to-set-up-a-new-repo" },
            { slug: "getting-started/towards-self-improvement" },
            { slug: "getting-started/first-steps-in-mature-projects" },
            { slug: "getting-started/towards-self-improvement" },
          ],
        },
        {
          label: "Becoming Productive",
          items: [
            { slug: "becoming-productive/the-workflow" },
            { slug: "becoming-productive/prompting-techniques" },
            { slug: "becoming-productive/harness-engineering" },
            { slug: "becoming-productive/closing-the-loop" },
            { slug: "becoming-productive/security" },
            { slug: "becoming-productive/legal-compliance" },
            { slug: "becoming-productive/going-10x" },
          ],
        },
        {
          label: "Expanding Horizons",
          items: [
            { slug: "expanding-horizons/threads-context-and-caching" },
            { slug: "expanding-horizons/model-pricing" },
            { slug: "expanding-horizons/what-to-read-next" },
          ],
        },
      ],
      components: {
        Head: "./src/components/Head.astro",
        Footer: "./src/components/Footer.astro",
        SkipLink: "./src/components/SkipLink.astro",
      },
      editLink: {
        baseUrl: `${repo}edit/main/`,
      },
      lastUpdated: true,
      head: [
        {
          tag: "meta",
          attrs: { property: "og:image", content: defaultOgImage },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:width", content: "1200" },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:height", content: "630" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: defaultOgImage },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:creator", content: "@swmansion" },
        },
      ],
      plugins: [starlightLlmsTxt()],
    }),
  ],
});

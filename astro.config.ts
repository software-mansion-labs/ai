import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const site = "https://agentic-engineering.swmansion.com/";
const repo = `https://github.com/software-mansion/agentic-engineering/`;
const defaultOgImage = `${site}og-default.png`;

const globalJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site}#organization`,
      name: "Software Mansion",
      url: "https://swmansion.com/",
      logo: {
        "@type": "ImageObject",
        url: `${site}swm-logo.png`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site}#website`,
      url: site,
      name: "Software Mansion Agentic Engineering Guide",
      inLanguage: "en",
      publisher: {
        "@id": `${site}#organization`,
      },
    },
    {
      "@type": "Book",
      "@id": `${site}#book`,
      name: "Software Mansion Agentic Engineering Guide",
      description:
        "Practical guidance for setting up and scaling agentic engineering workflows in real software projects.",
      url: site,
      inLanguage: "en",
      image: defaultOgImage,
      publisher: { "@id": `${site}#organization` },
      author: [
        { "@type": "Person", name: "Marek Kaput" },
        { "@type": "Person", name: "Jakub Kosmydel" },
        { "@type": "Person", name: "Adam Grzybowski" },
      ],
    },
  ],
});

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "Software Mansion Agentic Engineering Guide",
      logo: {
        src: "./src/assets/logo.svg",
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
            { slug: "getting-started/what-can-ai-agents-even-do" },
            { slug: "getting-started/how-to-set-up-a-new-repo" },
            { slug: "getting-started/towards-self-improvement" },
          ],
        },
        {
          label: "Becoming Productive",
          items: [
            { slug: "becoming-productive/prompting-techniques" },
            { slug: "becoming-productive/closing-the-loop" },
            { slug: "becoming-productive/going-10x" },
          ],
        },
        {
          label: "Expanding Horizons",
          items: [
            { slug: "expanding-horizons/threads-context-and-caching" },
            { slug: "expanding-horizons/some-words-about-models" },
            { slug: "expanding-horizons/a-few-words-about-mcp" },
            { slug: "expanding-horizons/what-to-read-next" },
          ],
        },
      ],
      components: {
        Footer: "./src/components/Footer.astro",
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
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          content: globalJsonLd,
        },
      ],
    }),
  ],
});

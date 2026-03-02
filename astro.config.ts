import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const site = "http://docs.swmansion.com/agentic-engineering/";
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
  base: "/agentic-engineering",
  integrations: [
    starlight({
      title: "Software Mansion Agentic Engineering Guide",
      description:
        "Practical guidance for setting up and scaling agentic engineering workflows in real software projects.",
      logo: {
        src: "./public/favicon.svg",
      },
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
        { label: "Getting Started", slug: "getting-started" },
        { label: "Becoming Productive", slug: "becoming-productive" },
        { label: "Expanding Horizons", slug: "expanding-horizons" },
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

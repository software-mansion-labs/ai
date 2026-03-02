import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightFullViewMode from "starlight-fullview-mode";

// https://astro.build/config
export default defineConfig({
  site: "https://software-mansion-labs.github.io/ai/",
  base: "/ai",
  integrations: [
    starlight({
      title: "AI Workbook",
      logo: {
        src: "./public/favicon.svg",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/software-mansion-labs/ai",
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
        baseUrl: "https://github.com/software-mansion-labs/ai/edit/main/",
      },
      lastUpdated: true,
      plugins: [
        starlightFullViewMode({
          leftSidebarEnabled: true,
          rightSidebarEnabled: false,
        }),
      ],
    }),
  ],
});

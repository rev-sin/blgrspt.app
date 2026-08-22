import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "BlogPost",
  tagline: "Astro, Svelte, Better Auth, and Drizzle on Neon",
  favicon: "img/favicon.png",

  future: {
    v4: true,
  },

  url: "https://blgrspt.app",
  baseUrl: "/",

  organizationName: "rev-sin",
  projectName: "blgrspt.app",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/rev-sin/blgrspt.app/tree/dev/website/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/logo.svg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "BlogPost",
      logo: {
        alt: "BlogPost",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/rev-sin/blgrspt.app",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
            {
              label: "Setup",
              to: "/docs/setup",
            },
            {
              label: "Commands",
              to: "/docs/commands",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/rev-sin/blgrspt.app",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BlogPost. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

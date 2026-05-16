// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://ortegaortegaabogados.com",
  trailingSlash: "ignore",

  // Modo SSR — el admin necesita servidor para login/CRUD y las páginas
  // públicas leen Turso en cada request (con caché HTTP, no rebuild).
  output: "server",
  adapter: netlify(),

  build: {
    format: "directory",
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  vite: {
    // Permite leer process.env en helpers que se ejecutan tanto en build
    // como en runtime (Netlify Functions ya las expone como process.env).
    define: {},
  },
});

// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { defineConfig as viteConfig } from "vite";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import pagefind from "astro-pagefind";
import { agentsSummary } from "@nuasite/agent-summary";
import astroAgentAnnotate from "astro-agent-annotate";
import vercel from "@astrojs/vercel";

const isDevelopment = process.env.NODE_ENV === "development";
const devToolbar = { enabled: isDevelopment };

// https://astro.build/config
export default defineConfig({
  site: "https://hakuto-test-escudo-cinetico.vercel.app",
  output: "static",
  trailingSlash: "always",
  integrations: [
    react(),
    sitemap(),
    agentsSummary(),
    pagefind(),
    ...(devToolbar.enabled ? [astroAgentAnnotate()] : []),
    favicons({
      input: "./src/assets/favicon.png",
      name: "Escudo Cinético",
      short_name: "Escudo",
    }),
  ],

  vite: viteConfig({
    cacheDir: ".astro/vite",
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  }),

  build: {
    concurrency: 4,
    inlineStylesheets: "auto",
  },

  server: { port: 4321, host: "0.0.0.0", allowedHosts: true },
  devToolbar,
  adapter: vercel(),

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Instrument Serif",
      cssVariable: "--font-instrument-serif",
      weights: [400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Outfit",
      cssVariable: "--font-outfit",
      weights: [300, 400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});

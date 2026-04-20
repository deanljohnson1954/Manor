import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://uwmanor.com',
  output: 'static',
  integrations: [sitemap()],
  adapter: cloudflare()
});
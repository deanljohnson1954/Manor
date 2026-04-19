import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://uwmanor.com',
  output: 'static',
  adapter: cloudflare()
});
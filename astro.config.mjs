import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://uwmanor.com',
  output: 'static',
  integrations: [sitemap()],
});

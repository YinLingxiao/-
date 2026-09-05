// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 纯静态输出：产物可直接部署到任意静态托管
  output: 'static',
  // 学院展示用占位域名；实际部署时可替换
  site: 'https://example.edu.cn',
  integrations: [sitemap()],
});

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFile } from 'node:fs/promises';
import { prunePrivateVideos } from './src/utils/public-media.ts';

// https://astro.build/config
export default defineConfig({
  // 纯静态输出：产物可直接部署到任意静态托管
  output: 'static',
  // 学院展示用占位域名；实际部署时可替换
  site: 'https://example.edu.cn',
  integrations: [
    sitemap(),
    {
      name: 'approved-public-media',
      hooks: {
        'astro:build:done': async ({ dir, logger }) => {
          const entries = JSON.parse(await readFile(new URL('./src/content/media/media.json', import.meta.url), 'utf8'));
          const removed = await prunePrivateVideos(dir, entries);
          if (removed) logger.info(`已从构建产物排除 ${removed} 段非公开视频。`);
        },
      },
    },
  ],
});

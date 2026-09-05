import type { ImageMetadata } from 'astro';

/**
 * src/assets/media 下所有图片的集中索引。
 * 键为相对路径（如 'masks/mask-8529.jpg'），值为 Astro 可优化的 ImageMetadata。
 * 素材由 src/scripts/prepare-media.mjs 生成。
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/media/**/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const registry = new Map<string, ImageMetadata>();

for (const [path, mod] of Object.entries(modules)) {
  // path 形如 ../assets/media/masks/mask-8529.jpg
  const key = path.replace('../assets/media/', '');
  registry.set(key, mod.default);
}

export function img(key: string): ImageMetadata {
  const meta = registry.get(key);
  if (!meta) {
    throw new Error(`[images] 未找到图片素材：${key}（请先运行 node src/scripts/prepare-media.mjs）`);
  }
  return meta;
}

export function hasImg(key: string): boolean {
  return registry.has(key);
}

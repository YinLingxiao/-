import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

/**
 * 数据口径说明：
 * - visibility / consentLevel 必须显式填写；页面只展示 public / confirmed 条目。
 */

const consent = {
  visibility: z.enum(['public', 'internal', 'hidden']),
  consentLevel: z.enum(['confirmed', 'pending', 'restricted']),
};

/** 田野人物（content：frontmatter + 正文人物故事） */
const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string(),
    relationToDixi: z.string(),
    portrait: z.string().optional(),
    portraitAlt: z.string().optional(),
    interviewDate: z.string().optional(),
    interviewPlace: z.string().optional(),
    quotes: z
      .array(
        z.object({
          text: z.string(),
          source: z.string(),
        }),
      )
      .default([]),
    videos: z.array(z.string()).default([]),
    relatedMasks: z.array(z.string()).default([]),
    credit: z.string().optional(),
    order: z.number().default(99),
    ...consent,
  }),
});

/** 面具档案（data：单个 JSON 清单，仅收录已命名面具） */
const masks = defineCollection({
  loader: file('src/content/masks/masks.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    image: z.string(),
    alt: z.string(),
    set: z.enum(['wall', 'workshop']),
    setLabel: z.string(),
    index: z.number(),
    captureDate: z.string(),
    place: z.string(),
    role: z.string().trim().min(1).refine((value) => value !== '待考证', '面具必须命名后才能收录'),
    notes: z.string().optional(),
    relatedPeople: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    ...consent,
  }),
});

/** 田野时间线（content：里程碑条目） */
const fieldwork = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fieldwork' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    place: z.string(),
    summary: z.string(),
    photos: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
    order: z.number().default(0),
    ...consent,
  }),
});

/** 成果条目（content） */
const outcomes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/outcomes' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['report', 'video', 'photos', 'interviews', 'atlas', 'website', 'archive']),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    stat: z.string().optional(),
    order: z.number().default(0),
    ...consent,
  }),
});

/** 影像条目（data：13 段压缩短片清单） */
const media = defineCollection({
  loader: file('src/content/media/media.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    src: z.string(),
    poster: z.string(),
    durationSec: z.number(),
    category: z.enum(['performance', 'mask', 'interview', 'workshop', 'village']),
    categoryLabel: z.string(),
    summary: z.string(),
    people: z.array(z.string()).default([]),
    captureDate: z.string().optional(),
    ...consent,
  }),
});

export const collections = { people, masks, fieldwork, outcomes, media };

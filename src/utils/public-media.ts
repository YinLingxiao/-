import { readdir, unlink } from 'node:fs/promises';
import { isPublicEntry } from './content.ts';

/** public/ is copied verbatim by Astro; remove unapproved clips from the build only. */
export async function prunePrivateVideos(
  directory: URL,
  entries: { src: string; visibility?: string; consentLevel?: string }[],
): Promise<number> {
  const allowed = new Set(entries.filter((data) => isPublicEntry({ data })).map((data) => data.src));
  const videoDirectory = new URL('media/video/', directory);
  let files;
  try {
    files = await readdir(videoDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0;
    throw error;
  }
  let removed = 0;
  for (const file of files) {
    if (file.isFile() && /\.mp4$/i.test(file.name) && !allowed.has(`/media/video/${file.name}`)) {
      // Names come from readdir, never from content paths; only direct build children are removed.
      await unlink(new URL(encodeURIComponent(file.name), videoDirectory));
      removed += 1;
    }
  }
  return removed;
}

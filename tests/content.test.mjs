import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isPublicEntry } from '../src/utils/content.ts';
import { prunePrivateVideos } from '../src/utils/public-media.ts';
import { formatDuration } from '../src/utils/media.ts';

test('only public, confirmed entries are publishable', () => {
  for (const visibility of ['public', 'internal', 'hidden', undefined]) {
    for (const consentLevel of ['confirmed', 'pending', 'restricted', undefined]) {
      assert.equal(isPublicEntry({ data: { visibility, consentLevel } }),
        visibility === 'public' && consentLevel === 'confirmed');
    }
  }
});

test('duration rounding carries seconds into the next minute', () => {
  for (const [input, expected] of [[0, '0:00'], [45, '0:45'], [59.6, '1:00'], [119.6, '2:00'], [3600, '60:00']]) {
    assert.equal(formatDuration(input), expected);
  }
  for (const value of [undefined, -1, NaN, Infinity]) assert.equal(formatDuration(value), '');
});

test('build excludes restricted and unlisted clips without touching source assets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dixi-media-test-'));
  try {
    const output = join(root, 'dist');
    const videos = join(output, 'media', 'video');
    await mkdir(videos, { recursive: true });
    await writeFile(join(root, 'source.mp4'), 'source');
    for (const name of ['approved.mp4', 'pending.mp4', 'internal.mp4', 'unknown.mp4', 'poster.webp']) {
      await writeFile(join(videos, name), 'fixture');
    }
    const dir = pathToFileURL(output + '/');
    assert.equal(await prunePrivateVideos(dir, [
      { src: '/media/video/approved.mp4', visibility: 'public', consentLevel: 'confirmed' },
      { src: '/media/video/pending.mp4', visibility: 'public', consentLevel: 'pending' },
      { src: '/media/video/internal.mp4', visibility: 'internal', consentLevel: 'confirmed' },
      { src: '../source.mp4', visibility: 'public', consentLevel: 'confirmed' },
    ]), 3);
    assert.deepEqual((await readdir(videos)).sort(), ['approved.mp4', 'poster.webp']);
    assert.ok((await readdir(root)).includes('source.mp4'));
    assert.equal(await prunePrivateVideos(pathToFileURL(join(root, 'missing') + '/'), []), 0);
  } finally {
    // root is exclusively the directory returned by mkdtemp above.
    await rm(root, { recursive: true, force: true });
  }
});

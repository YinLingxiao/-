/** Only approved public entries may appear in pages, routes, or related content. */
export function isPublicEntry(entry: {
  data: { visibility?: string; consentLevel?: string };
}): boolean {
  return entry.data.visibility === 'public' && entry.data.consentLevel === 'confirmed';
}

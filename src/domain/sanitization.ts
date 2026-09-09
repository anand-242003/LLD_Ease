import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML for sticky note content.
 * Allowlist per PRD §9.14, §15.3, §17.5: <b> <i> <br> <div> only. Strip every attribute.
 */
export function sanitizeStickyHtml(raw: string): string {
  if (!raw) return '';

  // Normalize semantic tags so bold and italic are preserved
  const normalized = raw
    .replace(/<strong\b[^>]*>/gi, '<b>')
    .replace(/<\/strong>/gi, '</b>')
    .replace(/<em\b[^>]*>/gi, '<i>')
    .replace(/<\/em>/gi, '</i>')
    .replace(/<p\b[^>]*>/gi, '<div>')
    .replace(/<\/p>/gi, '</div>');

  // In browser environments where DOMPurify is bound to window
  if (typeof DOMPurify !== 'undefined' && typeof (DOMPurify as any).sanitize === 'function') {
    return (DOMPurify as any).sanitize(normalized, {
      ALLOWED_TAGS: ['b', 'i', 'br', 'div'],
      ALLOWED_ATTR: [],
    });
  }

  // Fallback for Node / headless test environments without DOM
  return normalized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<(?!\/?(b|i|br|div)\b)[^>]+>/gi, '')
    .replace(/<([a-z0-9]+)[^>]*>/gi, (_match, tag) => {
      const lower = tag.toLowerCase();
      if (['b', 'i', 'br', 'div'].includes(lower)) {
        return lower === 'br' ? '<br>' : `<${lower}>`;
      }
      return '';
    });
}

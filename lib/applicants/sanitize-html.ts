/**
 * Conservative allowlist sanitizer for officer-authored coffee-chat notes.
 *
 * Notes are written in a contentEditable rich-text editor and stored/rendered as
 * HTML. Authors are trusted officers, but this prevents a stored-XSS vector where
 * one officer's note could run script in another officer's session. The client
 * editor also pastes as plain text; this is the server-side backstop.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "b", "strong", "i", "em", "u",
  "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "div", "span", "a",
]);

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

/** Strip whole dangerous element blocks (tag + contents). */
function stripDangerousBlocks(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(iframe|object|embed|form|input|textarea|link|meta)[\s\S]*?>/gi, "");
}

export function sanitizeNoteHtml(input: string): string {
  if (!input) return "";

  let html = stripDangerousBlocks(input);

  // Rewrite every tag: drop disallowed tags entirely (keep their text content),
  // and strip all attributes from allowed tags except a safe href on <a>.
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, rawName, attrs) => {
    const name = String(rawName).toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";

    const isClosing = match.startsWith("</");
    if (isClosing) return `</${name}>`;

    if (name === "a") {
      const hrefMatch = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const href = hrefMatch ? (hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "").trim() : "";
      if (href && SAFE_HREF.test(href)) {
        const safe = href.replace(/"/g, "&quot;");
        return `<a href="${safe}" target="_blank" rel="noopener noreferrer nofollow">`;
      }
      return "<a>";
    }

    // Self-closing <br/> normalizes to <br>.
    return `<${name}>`;
  });

  return html.trim();
}

/** Plain-text length of note content, for empty-note checks. */
export function noteTextLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim().length;
}

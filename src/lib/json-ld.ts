/**
 * Safely serializes a JSON-LD object for injection via
 * dangerouslySetInnerHTML into a <script type="application/ld+json"> tag.
 *
 * `JSON.stringify` alone does NOT escape `<`, so if any field contains the
 * literal substring `</script>` (e.g. a product title or description
 * containing it — those fields are DB-editable), the browser's HTML parser
 * terminates the script tag early and starts interpreting what follows as
 * markup/script. This is a well-documented JSON-LD injection vector, not a
 * theoretical one. Escaping `<` as `\u003c` neutralizes it without changing
 * the JSON's meaning (browsers decode `\u003c` back to `<` when parsing the
 * JSON content, but it can no longer break out of the surrounding HTML).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

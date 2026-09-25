import slugify from "slugify";

/**
 * URL-safe slug for any display text.
 * Kept in its own module so both the query layer and the auth layer can use it
 * without importing each other.
 */
export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

/**
 * Builds a property slug such as `3-bhk-apartment-madhurawada`.
 *
 * The title is the primary component; the locality is appended when it is not
 * already part of the title so that listings in different areas do not collide
 * and the URL stays descriptive (and SEO friendly).
 */
export function createPropertySlug(title: string, location?: string | null): string {
  const base = createSlug(title).slice(0, 180);
  const loc = location ? createSlug(location) : "";
  if (loc && base && !base.includes(loc)) {
    return `${base}-${loc}`.slice(0, 200);
  }
  return base || "property";
}

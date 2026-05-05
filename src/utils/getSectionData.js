/**
 * getSectionData - safely extracts section content
 *
 * Index.jsx's buildContentMap already transforms the API response into:
 *   { hero: { title: "...", badge: "..." }, credibility: { ... } }
 *
 * So `content` passed into Hero/Credibility etc. is already a plain object,
 * NOT an array. This function now handles BOTH cases safely:
 *   - If content is already an object (from buildContentMap), return it directly.
 *   - If content is an array (raw API response), filter and reduce as before.
 *   - If content is null/undefined, return {}.
 */
export const getSectionData = (content, page, section) => {
  if (!content) return {};

  // Already a plain object (the common case via Index.jsx buildContentMap)
  if (!Array.isArray(content)) return content;

  // Legacy: raw array from API (filter by page + section)
  const map = {};
  content
    .filter(
      (item) =>
        item.page === page &&
        item.section === section &&
        (item.published === true || item.published === undefined)
    )
    .forEach((item) => {
      map[item.content_key] = item.content_value;
    });

  return map;
};
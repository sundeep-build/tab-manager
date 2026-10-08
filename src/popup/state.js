// What the popup is showing right now.
export const RECENT = "Recently closed";

export const state = {
  tabs: [],
  recent: [],
  query: "",
  collapsed: new Set([RECENT]),
  selected: 0,
};

// Whether a tab matches the search box: every typed word must appear in its title or URL.
export function matches(item) {
  if (!state.query) return true;
  const haystack = `${item.title || ""} ${item.url || ""}`.toLowerCase();
  return state.query.split(/\s+/).every((word) => haystack.includes(word));
}

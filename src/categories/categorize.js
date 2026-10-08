// Rule-based categorisation: a tab's category comes from its URL alone, so it
// works offline and instantly. The categories and their sites are in sites.js.
import { CATEGORIES, GROUP_COLORS, HOSTS_BY_CATEGORY } from "./sites.js";

const HOST_TO_CATEGORY = new Map();
for (const [category, hosts] of Object.entries(HOSTS_BY_CATEGORY)) {
  for (const host of hosts) HOST_TO_CATEGORY.set(host, category);
}

const DOCS_PATH = /\/(docs?|documentation|reference|manual|guide|api-reference)(\/|$)/i;
const DOCS_HOST = /^(docs?|developer|developers|devdocs|learn|wiki)\./;

export function ruleCategory(tab) {
  let url;
  try {
    url = new URL(tab.url || tab.pendingUrl || "");
  } catch {
    return "Other";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "Other";

  const host = url.hostname.replace(/^www\./, "");

  if (/^(google\.[a-z.]+|bing\.com)$/.test(host) && url.pathname.startsWith("/search")) {
    return "Search";
  }
  if (HOST_TO_CATEGORY.has(host)) return HOST_TO_CATEGORY.get(host);
  if (DOCS_HOST.test(host) || DOCS_PATH.test(url.pathname)) return "Docs";

  // Walk up the subdomains: gist.github.com -> github.com
  const labels = host.split(".");
  for (let i = 1; i < labels.length - 1; i++) {
    const parent = labels.slice(i).join(".");
    if (HOST_TO_CATEGORY.has(parent)) return HOST_TO_CATEGORY.get(parent);
  }

  if (/(^|\.)amazon\.[a-z.]+$/.test(host)) return "Shopping";
  return "Other";
}

export function categoryMeta(name) {
  if (CATEGORIES[name]) return CATEGORIES[name];
  // Unknown category names get a stable colour derived from the name.
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return { emoji: "📁", color: GROUP_COLORS[hash % GROUP_COLORS.length] };
}

export function sortCategories(names) {
  const order = Object.keys(CATEGORIES);
  const rank = (name) => {
    if (name === "Other") return Infinity;
    const i = order.indexOf(name);
    return i === -1 ? order.length : i;
  };
  return [...names].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

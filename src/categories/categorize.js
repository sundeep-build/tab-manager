// Rule-based categorisation: a tab's category comes from its URL alone, so it
// works offline and instantly. Add sites to HOSTS_BY_CATEGORY to teach it more.

// Display order, emoji and Chrome tab-group colour for each built-in category.
export const CATEGORIES = {
  Work: { emoji: "💻", color: "blue" },
  AI: { emoji: "🤖", color: "purple" },
  Docs: { emoji: "📚", color: "cyan" },
  Communication: { emoji: "✉️", color: "green" },
  Search: { emoji: "🔎", color: "yellow" },
  Shopping: { emoji: "🛒", color: "orange" },
  Entertainment: { emoji: "📺", color: "red" },
  Social: { emoji: "💬", color: "pink" },
  News: { emoji: "📰", color: "grey" },
  Finance: { emoji: "💰", color: "green" },
  Other: { emoji: "📁", color: "grey" },
};

const GROUP_COLORS = ["blue", "purple", "cyan", "green", "yellow", "orange", "red", "pink", "grey"];

const HOSTS_BY_CATEGORY = {
  AI: [
    "chatgpt.com", "chat.openai.com", "openai.com", "claude.ai", "anthropic.com",
    "gemini.google.com", "aistudio.google.com", "perplexity.ai", "copilot.microsoft.com",
    "huggingface.co", "poe.com", "mistral.ai", "deepseek.com", "grok.com",
  ],
  Work: [
    "github.com", "gitlab.com", "bitbucket.org", "aws.amazon.com", "cloud.google.com",
    "portal.azure.com", "vercel.com", "netlify.com", "cloudflare.com", "supabase.com",
    "firebase.google.com", "planetscale.com", "stackoverflow.com", "stackexchange.com",
    "atlassian.net", "atlassian.com", "linear.app", "notion.so", "figma.com",
    "docs.google.com", "drive.google.com", "npmjs.com", "hub.docker.com", "sentry.io",
    "mixpanel.com", "postman.com", "trello.com", "asana.com", "stripe.com",
    "localhost", "127.0.0.1",
  ],
  Docs: ["developer.mozilla.org", "readthedocs.io", "devdocs.io", "pkg.go.dev", "w3schools.com"],
  Communication: [
    "mail.google.com", "calendar.google.com", "meet.google.com", "outlook.live.com",
    "outlook.office.com", "slack.com", "discord.com", "web.whatsapp.com", "web.telegram.org",
    "teams.microsoft.com", "zoom.us", "mail.yahoo.com", "proton.me",
  ],
  Search: ["duckduckgo.com", "search.brave.com"],
  Shopping: [
    "flipkart.com", "myntra.com", "ajio.com", "meesho.com", "nykaa.com", "ebay.com",
    "etsy.com", "walmart.com", "aliexpress.com", "swiggy.com", "zomato.com", "blinkit.com",
  ],
  Entertainment: [
    "youtube.com", "netflix.com", "primevideo.com", "hotstar.com", "jiocinema.com",
    "spotify.com", "twitch.tv", "imdb.com",
  ],
  Social: [
    "x.com", "twitter.com", "facebook.com", "instagram.com", "linkedin.com", "reddit.com",
    "threads.net", "pinterest.com", "quora.com",
  ],
  News: [
    "news.ycombinator.com", "bbc.com", "bbc.co.uk", "cnn.com", "nytimes.com", "theverge.com",
    "techcrunch.com", "medium.com", "substack.com", "timesofindia.indiatimes.com", "ndtv.com",
    "thehindu.com", "news.google.com",
  ],
  Finance: [
    "zerodha.com", "groww.in", "tradingview.com", "moneycontrol.com", "paypal.com",
    "razorpay.com", "coinmarketcap.com",
  ],
};

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

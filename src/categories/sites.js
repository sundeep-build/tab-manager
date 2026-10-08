// The categories and the sites in each. This is the file to edit to teach Tab Manager
// about more sites: add a domain under the category you want and reload the extension.

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

// Colours Chrome offers for a tab group; an unknown category gets one of these.
export const GROUP_COLORS = ["blue", "purple", "cyan", "green", "yellow", "orange", "red", "pink", "grey"];

// Which sites belong to which category. Subdomains are matched automatically.
export const HOSTS_BY_CATEGORY = {
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

import { ruleCategory, categoryMeta, sortCategories } from "./categorize.js";

const RECENT = "Recently closed";

const $ = (id) => document.getElementById(id);
const listEl = $("list");
const searchEl = $("search");
const statusEl = $("status");

const state = {
  tabs: [],
  recent: [],
  query: "",
  collapsed: new Set([RECENT]),
  selected: 0,
};

const categoryOf = ruleCategory;

function hostOf(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, "") || url.protocol.replace(":", "");
  } catch {
    return "";
  }
}

function matches(item) {
  if (!state.query) return true;
  const haystack = `${item.title || ""} ${item.url || ""}`.toLowerCase();
  return state.query.split(/\s+/).every((word) => haystack.includes(word));
}

function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.hidden = !text;
  statusEl.classList.toggle("error", isError);
}

// ---------- rendering ----------

function favicon(item) {
  const letter = document.createElement("span");
  letter.className = "fav letter";
  letter.textContent = (hostOf(item.url) || item.title || "?")[0];
  if (!item.favIconUrl || !/^(https?|data):/.test(item.favIconUrl)) return letter;

  const img = document.createElement("img");
  img.className = "fav";
  img.src = item.favIconUrl;
  img.alt = "";
  img.addEventListener("error", () => img.replaceWith(letter));
  return img;
}

function row(item, { onOpen, onClose, active }) {
  const el = document.createElement("div");
  el.className = "row" + (active ? " active" : "");
  el.title = item.url || "";

  const text = document.createElement("div");
  text.className = "text";
  const title = document.createElement("div");
  title.className = "title";
  title.textContent = item.title || item.url || "Untitled";
  const host = document.createElement("div");
  host.className = "host";
  host.textContent = hostOf(item.url);
  text.append(title, host);
  el.append(favicon(item), text);

  if (onClose) {
    const x = document.createElement("button");
    x.className = "x";
    x.type = "button";
    x.textContent = "✕";
    x.title = "Close tab";
    x.addEventListener("click", (event) => {
      event.stopPropagation();
      onClose();
    });
    el.append(x);
  }

  el.addEventListener("click", onOpen);
  el.open = onOpen;
  return el;
}

function section(name, emoji, items, buildRow, onCloseAll) {
  const frag = document.createDocumentFragment();
  // While searching, every section is expanded so matches are never hidden.
  const collapsed = !state.query && state.collapsed.has(name);

  const head = document.createElement("div");
  head.className = "group-head";
  const chev = document.createElement("span");
  chev.className = "chev";
  chev.textContent = collapsed ? "▶" : "▼";
  const label = document.createElement("span");
  label.className = "name";
  label.textContent = `${emoji} ${name} `;
  const n = document.createElement("span");
  n.className = "n";
  n.textContent = items.length;
  label.append(n);
  head.append(chev, label);

  if (onCloseAll) {
    const closeAll = document.createElement("button");
    closeAll.className = "close-all";
    closeAll.type = "button";
    closeAll.textContent = "Close all";
    closeAll.addEventListener("click", (event) => {
      event.stopPropagation();
      onCloseAll();
    });
    head.append(closeAll);
  }

  head.addEventListener("click", () => {
    if (state.collapsed.has(name)) state.collapsed.delete(name);
    else state.collapsed.add(name);
    render();
  });

  frag.append(head);
  if (!collapsed) for (const item of items) frag.append(buildRow(item));
  return frag;
}

function render() {
  const groups = new Map();
  for (const tab of state.tabs.filter(matches)) {
    const name = categoryOf(tab);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(tab);
  }

  listEl.replaceChildren();
  for (const name of sortCategories(groups.keys())) {
    const tabs = groups.get(name);
    listEl.append(
      section(
        name,
        categoryMeta(name).emoji,
        tabs,
        (tab) =>
          row(tab, {
            active: tab.active,
            onOpen: () => switchTo(tab),
            onClose: () => chrome.tabs.remove(tab.id),
          }),
        () => chrome.tabs.remove(tabs.map((tab) => tab.id)),
      ),
    );
  }

  const recent = state.recent.filter(matches);
  if (recent.length) {
    listEl.append(
      section(RECENT, "🕘", recent, (item) =>
        row(item, { onOpen: () => chrome.sessions.restore(item.sessionId) }),
      ),
    );
  }

  if (!listEl.children.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = state.query ? "No tabs match your search." : "No tabs open.";
    listEl.append(empty);
  }

  const windows = new Set(state.tabs.map((tab) => tab.windowId)).size;
  $("count").textContent =
    `${state.tabs.length} tab${state.tabs.length === 1 ? "" : "s"}` +
    (windows > 1 ? ` · ${windows} windows` : "");

  const dupes = duplicateTabs().length;
  $("dedupe").textContent = dupes ? `Close duplicates (${dupes})` : "Close duplicates";
  $("dedupe").disabled = !dupes;
  $("ungroup").disabled = !state.tabs.some((tab) => tab.groupId !== -1);

  select(state.selected);
}

function select(index) {
  const rows = listEl.querySelectorAll(".row");
  state.selected = Math.max(0, Math.min(index, rows.length - 1));
  rows.forEach((el, i) => el.classList.toggle("sel", i === state.selected));
  rows[state.selected]?.scrollIntoView({ block: "nearest" });
}

// ---------- tab actions ----------

async function switchTo(tab) {
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
  window.close();
}

// Every tab whose URL (ignoring the #fragment) is already open; the active or
// first copy of each URL is the one kept.
function duplicateTabs() {
  const byUrl = new Map();
  for (const tab of state.tabs) {
    const key = (tab.url || "").split("#")[0];
    if (!key || key.startsWith("chrome://newtab")) continue;
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key).push(tab);
  }
  const dupes = [];
  for (const tabs of byUrl.values()) {
    if (tabs.length < 2) continue;
    const keep = tabs.find((tab) => tab.active) || tabs[0];
    dupes.push(...tabs.filter((tab) => tab !== keep));
  }
  return dupes;
}

async function groupTabs() {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const normal = new Set(windows.map((win) => win.id));

  // Tab groups cannot span windows, so build them per window.
  const buckets = new Map();
  for (const tab of state.tabs) {
    if (tab.pinned || !normal.has(tab.windowId)) continue;
    const key = `${tab.windowId}\n${categoryOf(tab)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(tab.id);
  }

  let made = 0;
  for (const [key, tabIds] of buckets) {
    if (tabIds.length < 2) continue;
    const [windowId, name] = key.split("\n");
    const groupId = await chrome.tabs.group({ tabIds, createProperties: { windowId: Number(windowId) } });
    await chrome.tabGroups.update(groupId, { title: name, color: categoryMeta(name).color });
    made++;
  }
  setStatus(made ? `Created ${made} tab group${made === 1 ? "" : "s"}.` : "Nothing to group: no category has two or more tabs.");
}

async function ungroupTabs() {
  const ids = state.tabs.filter((tab) => tab.groupId !== -1).map((tab) => tab.id);
  if (ids.length) await chrome.tabs.ungroup(ids);
  setStatus("");
}

// ---------- wiring ----------

async function refresh() {
  [state.tabs, state.recent] = await Promise.all([
    chrome.tabs.query({}),
    chrome.sessions.getRecentlyClosed({ maxResults: 10 }).then((sessions) =>
      sessions.filter((s) => s.tab).map((s) => ({ ...s.tab, sessionId: s.tab.sessionId })),
    ),
  ]);
  render();
}

let refreshTimer;
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refresh, 80);
}

for (const event of ["onCreated", "onRemoved", "onUpdated", "onMoved", "onAttached", "onDetached"]) {
  chrome.tabs[event].addListener(scheduleRefresh);
}

searchEl.addEventListener("input", () => {
  state.query = searchEl.value.trim().toLowerCase();
  state.selected = 0;
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    select(state.selected + (event.key === "ArrowDown" ? 1 : -1));
  } else if (event.key === "Enter" && event.target === searchEl) {
    listEl.querySelectorAll(".row")[state.selected]?.open();
  }
});

const reportFailure = (error) => setStatus(error.message || String(error), true);
$("group").addEventListener("click", () => groupTabs().catch(reportFailure));
$("ungroup").addEventListener("click", () => ungroupTabs().catch(reportFailure));
$("dedupe").addEventListener("click", () => chrome.tabs.remove(duplicateTabs().map((tab) => tab.id)));
await refresh();

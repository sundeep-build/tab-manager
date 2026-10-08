// Draws the list of tabs, grouped by category.
import { ruleCategory, categoryMeta, sortCategories } from "../categories/categorize.js";
import { state, matches, RECENT } from "./state.js";
import { $, listEl, hostOf } from "./dom.js";
import { switchTo, duplicateTabs } from "./actions.js";

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

export function render() {
  const groups = new Map();
  for (const tab of state.tabs.filter(matches)) {
    const name = ruleCategory(tab);
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

export function select(index) {
  const rows = listEl.querySelectorAll(".row");
  state.selected = Math.max(0, Math.min(index, rows.length - 1));
  rows.forEach((el, i) => el.classList.toggle("sel", i === state.selected));
  rows[state.selected]?.scrollIntoView({ block: "nearest" });
}

// What the popup can do to tabs.
import { ruleCategory, categoryMeta } from "../categories/categorize.js";
import { state } from "./state.js";
import { setStatus } from "./dom.js";

export async function switchTo(tab) {
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
  window.close();
}

// Every tab whose URL (ignoring the #fragment) is already open; the active or
// first copy of each URL is the one kept.
export function duplicateTabs() {
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

export async function groupTabs() {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const normal = new Set(windows.map((win) => win.id));

  // Tab groups cannot span windows, so build them per window.
  const buckets = new Map();
  for (const tab of state.tabs) {
    if (tab.pinned || !normal.has(tab.windowId)) continue;
    const key = `${tab.windowId}\n${ruleCategory(tab)}`;
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

export async function ungroupTabs() {
  const ids = state.tabs.filter((tab) => tab.groupId !== -1).map((tab) => tab.id);
  if (ids.length) await chrome.tabs.ungroup(ids);
  setStatus("");
}

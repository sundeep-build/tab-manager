// Tab Manager popup: loads the tabs, keeps the list fresh and wires up the controls.
import { state } from "./state.js";
import { $, listEl, searchEl, setStatus } from "./dom.js";
import { render, select } from "./view.js";
import { duplicateTabs, groupTabs, ungroupTabs } from "./actions.js";

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

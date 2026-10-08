// The popup's fixed elements and small helpers for them.
export const $ = (id) => document.getElementById(id);
export const listEl = $("list");
export const searchEl = $("search");
const statusEl = $("status");

export function hostOf(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, "") || url.protocol.replace(":", "");
  } catch {
    return "";
  }
}

export function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.hidden = !text;
  statusEl.classList.toggle("error", isError);
}

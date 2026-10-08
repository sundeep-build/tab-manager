# Tab Manager

A free, open-source Chrome extension that turns a pile of open tabs into a tidy, searchable list grouped by category.

It runs entirely in your browser. There is no AI, no account, no server and no network request: a tab's category is worked out from its URL using a plain list of rules.

## Demo

[▶ Watch the demo video](tab-manager.mp4)

## Features

- **Grouped list** of every open tab across all windows: Work, AI (sites such as ChatGPT), Docs, Communication, Search, Shopping, Entertainment, Social, News, Finance, Other
- **Search** by title or URL, then use the arrow keys and Enter to jump to a tab
- **Close** a single tab, a whole category, or all duplicate tabs
- **Reopen** any of the last 10 closed tabs
- **Group tabs** into real, named and coloured Chrome tab groups, and ungroup them again
- **Keyboard shortcut**: `Ctrl+Shift+K` (`Cmd+Shift+K` on macOS)

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select this folder.

It also works in other Chromium browsers that support tab groups, such as Edge and Brave.

## Permissions

| Permission  | Why it is needed                                  |
| ----------- | ------------------------------------------------- |
| `tabs`      | Read tab titles and URLs to list and sort them    |
| `tabGroups` | Name and colour the tab groups it creates         |
| `sessions`  | Show and restore recently closed tabs             |

Nothing is stored and nothing leaves your browser.

## Adding your own sites

Categories are plain lists of domains in [src/categories/sites.js](src/categories/sites.js). Add a domain to the list under the category you want and reload the extension. Subdomains are matched automatically, so `github.com` also covers `gist.github.com`.

## Project layout

```
manifest.json            extension manifest (Manifest V3)
icons/                   toolbar and store icons
src/
  categories/
    sites.js             the categories and the sites in each (edit this one)
    categorize.js        works out a tab's category from its URL
  popup/
    popup.html, popup.css
    main.js              loads the tabs, keeps the list fresh, wires up the controls
    view.js              draws the grouped list
    actions.js           switch, close duplicates, group, ungroup
    state.js             what the popup is showing, and the search match
    dom.js               the popup's elements and small helpers
```

There is no build step and there are no dependencies.

## License

[MIT](LICENSE)

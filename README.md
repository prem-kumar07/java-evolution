# Java Evolution

An offline, self-contained HTML reference for every Java feature since **Java 8** — kept
up to date every release — organised by version and by deep-dive topic, with concise
**before → after** code snippets.

## How to open

Just open `index.html` in any browser — no server, no build step, no internet required.

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

## What's inside

```
index.html            Overview + release timeline + links to everything
quickstart.html       Install JDKs, switch versions, JShell, preview/incubator, single-file launch
features.html         A–Z filterable feature index (feature → version → status → link)
print.html            All-in-one, print/PDF-friendly build (generated)

versions/             One page per stepping-stone release (5 sections + before/after each)
  java-8.html   (LTS) lambdas, streams, default methods, Optional, java.time, CompletableFuture
  java-9.html         Modules, JShell, collection factories, Flow
  java-11.html  (LTS) var in lambda params (11; var for locals is Java 10), HttpClient, single-file launch, String/Files APIs
  java-17.html  (LTS) records, sealed, switch expressions, text blocks, patterns  (folds in 12–16)
  java-21.html  (LTS) virtual threads, switch patterns, record patterns, sequenced collections  (18–20)
  java-25.html  (LTS) scoped values, gatherers, FFM, compact source files, module imports  (22–24)
  java-26.html        HTTP/3, AOT object caching, faster G1, "final means final"

topics/               Deep-dive pages
  var, records, sealed-classes, pattern-matching-switch, text-blocks-strings, modules-jpms,
  stream-api, virtual-threads, structured-concurrency, scoped-values, streams-gatherers,
  ffm-api, jvm-memory-gc, reflection, generics, annotations, aot-cache

assets/
  style.css           Light/dark theme, responsive layout
  nav.js              Sidebar/topbar, theme toggle, global content search, copy buttons,
                      back-to-top, '/' shortcut (all built from one sitemap)
  highlight.js        Tiny self-contained Java syntax highlighter (no CDN)
  search-index.js     Generated content index for offline search

build.py              Regenerates search-index.js + print.html from the pages
```

## Rebuilding the generated files

After editing any page, regenerate the search index and the print bundle:

```bash
python3 build.py     # stdlib only, no dependencies
```

## Extra features

- **Global search** — the top-bar box searches all page content (titles, headings, code).
  Press <kbd>/</kbd> to focus it; use ↑/↓ and Enter to navigate results.
- **Copy buttons** appear on every code block (hover to reveal).
- **Migration watch-outs** — each version page flags real upgrade breakage.
- **Back-to-top** button appears once you scroll.

## Conventions

- Skipped releases (10, 12–16, 18–20, 22–24) are folded into the next LTS page, each feature
  tagged with the version that introduced it, e.g. **Added in 14**.
- Badges: **LTS**, **Added in N**, **Preview**, **Removed**, **JEP nnn**.
- JEP lists were verified against the OpenJDK project pages.

Use the **☾ Dark** toggle (top-right) and the sidebar **filter** box to navigate quickly.

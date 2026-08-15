/* ============================================================
   nav.js — builds the persistent sidebar + topbar chrome from a
   single SITEMAP, handles active-link highlighting, breadcrumbs,
   light/dark theme (persisted), sidebar search filter, and the
   mobile menu. No fetch() — works over file://.

   Each page only needs:
     <body data-root="../" data-page="versions/java-9.html" data-title="Java 9">
       <main> ...content... </main>
       <script src="../assets/nav.js"></script>
       <script src="../assets/highlight.js"></script>
     </body>
   ============================================================ */
(function () {
  var SITEMAP = [
    { title: "Start here", items: [
      { href: "index.html", label: "Home / Overview" },
      { href: "quickstart.html", label: "Quick start & tooling" },
      { href: "features.html", label: "Feature index (A–Z)" },
      { href: "print.html", label: "Print / all-in-one" }
    ]},
    { title: "By version", items: [
      { href: "versions/java-8.html",  label: "Java 8  · LTS" },
      { href: "versions/java-9.html",  label: "Java 9" },
      { href: "versions/java-11.html", label: "Java 11  (+10)  · LTS" },
      { href: "versions/java-17.html", label: "Java 17  (+12–16)  · LTS" },
      { href: "versions/java-21.html", label: "Java 21  (+18–20)  · LTS" },
      { href: "versions/java-25.html", label: "Java 25  (+22–24)  · LTS" },
      { href: "versions/java-26.html", label: "Java 26" }
    ]},
    { title: "Deep dives — core Java", items: [
      { href: "topics/generics.html",               label: "Generics" },
      { href: "topics/reflection.html",             label: "Reflection API" },
      { href: "topics/annotations.html",            label: "Annotations" }
    ]},
    { title: "Deep dives — language", items: [
      { href: "topics/var.html",                    label: "var — local-variable type inference" },
      { href: "topics/records.html",                label: "Records" },
      { href: "topics/sealed-classes.html",         label: "Sealed classes" },
      { href: "topics/pattern-matching-switch.html", label: "Pattern matching & switch" },
      { href: "topics/text-blocks-strings.html",    label: "Text blocks & String APIs" },
      { href: "topics/modules-jpms.html",           label: "Modules (JPMS)" }
    ]},
    { title: "Deep dives — concurrency & APIs", items: [
      { href: "topics/stream-api.html",             label: "Stream API (Java 8+)" },
      { href: "topics/virtual-threads.html",        label: "Virtual threads" },
      { href: "topics/structured-concurrency.html", label: "Structured concurrency" },
      { href: "topics/scoped-values.html",          label: "Scoped values" },
      { href: "topics/streams-gatherers.html",      label: "Streams & Gatherers" },
      { href: "topics/ffm-api.html",                label: "Foreign Function & Memory API" }
    ]},
    { title: "Deep dives — JVM & memory", items: [
      { href: "topics/jvm-memory-gc.html",          label: "JVM Memory Model & GC" },
      { href: "topics/aot-cache.html",               label: "AOT Cache" }
    ]},
    { title: "Deep dives — tooling", items: [
      { href: "topics/jshell.html",                 label: "JShell (REPL)" },
      { href: "topics/jlink-jpackage.html",         label: "Custom runtime & packaging (jlink)" },
      { href: "topics/jfr.html",                    label: "JFR & Mission Control" },
      { href: "topics/jwebserver.html",             label: "Simple Web Server" }
    ]}
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "index.html";
  var title = body.getAttribute("data-title") || document.title;

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("java-doc-theme", t); } catch (e) {}
  }
  var saved;
  try { saved = localStorage.getItem("java-doc-theme"); } catch (e) {}
  if (!saved) {
    saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  applyTheme(saved);

  /* ---------- sidebar collapse (desktop only, persisted) ---------- */
  var collapsed;
  try { collapsed = localStorage.getItem("java-doc-sidebar-collapsed") === "1"; } catch (e) { collapsed = false; }
  if (collapsed) document.documentElement.classList.add("sidebar-collapsed");

  /* ---------- build sidebar ---------- */
  var sidebar = document.createElement("aside");
  sidebar.id = "sidebar";

  var brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML = '<img src="' + root + 'assets/favicon.svg" alt="" class="brand-logo">' +
                     '<span>Java Evolution</span>';
  brand.style.cursor = "pointer";
  brand.onclick = function () { location.href = root + "index.html"; };
  sidebar.appendChild(brand);

  var search = document.createElement("input");
  search.className = "nav-search";
  search.type = "search";
  search.placeholder = "Filter pages…";
  sidebar.appendChild(search);

  var nav = document.createElement("nav");
  SITEMAP.forEach(function (group) {
    var gt = document.createElement("div");
    gt.className = "nav-group-title";
    gt.textContent = group.title;
    nav.appendChild(gt);
    group.items.forEach(function (it) {
      var a = document.createElement("a");
      a.href = root + it.href;
      a.textContent = it.label;
      a.setAttribute("data-key", it.href);
      if (it.href === page) a.className = "active";
      nav.appendChild(a);
    });
  });
  sidebar.appendChild(nav);

  /* ---------- search filter ---------- */
  search.addEventListener("input", function () {
    var q = search.value.toLowerCase();
    nav.querySelectorAll("a").forEach(function (a) {
      a.style.display = a.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
    });
    nav.querySelectorAll(".nav-group-title").forEach(function (gt) {
      var n = gt.nextElementSibling, any = false;
      while (n && n.tagName === "A") { if (n.style.display !== "none") any = true; n = n.nextElementSibling; }
      gt.style.display = any ? "" : "none";
    });
  });

  /* ---------- topbar ---------- */
  var topbar = document.createElement("div");
  topbar.className = "topbar";

  var left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "12px";

  var menuBtn = document.createElement("button");
  menuBtn.className = "menu-toggle";
  menuBtn.setAttribute("aria-label", "Toggle menu");
  menuBtn.textContent = "☰";
  menuBtn.onclick = function () { sidebar.classList.toggle("open"); };
  left.appendChild(menuBtn);

  var collapseBtn = document.createElement("button");
  collapseBtn.className = "sidebar-collapse-toggle";
  collapseBtn.setAttribute("aria-label", "Toggle sidebar");
  function collapseLabel() {
    return document.documentElement.classList.contains("sidebar-collapsed") ? "☰" : "⟨";
  }
  collapseBtn.textContent = collapseLabel();
  collapseBtn.title = "Toggle sidebar";
  collapseBtn.onclick = function () {
    var isCollapsed = document.documentElement.classList.toggle("sidebar-collapsed");
    try { localStorage.setItem("java-doc-sidebar-collapsed", isCollapsed ? "1" : "0"); } catch (e) {}
    collapseBtn.textContent = collapseLabel();
  };
  left.appendChild(collapseBtn);

  var crumbs = document.createElement("div");
  crumbs.className = "crumbs";
  crumbs.innerHTML = (page === "index.html")
    ? "Home"
    : '<a href="' + root + 'index.html">Home</a> › ' + title;
  left.appendChild(crumbs);
  topbar.appendChild(left);

  /* ---------- global content search (topbar) ---------- */
  var searchWrap = document.createElement("div");
  searchWrap.className = "gsearch-wrap";
  var gsearch = document.createElement("input");
  gsearch.className = "gsearch";
  gsearch.type = "search";
  gsearch.placeholder = "Search all pages…  ( / )";
  gsearch.setAttribute("aria-label", "Search all pages");
  var results = document.createElement("div");
  results.className = "gsearch-results";
  results.style.display = "none";
  searchWrap.appendChild(gsearch);
  searchWrap.appendChild(results);
  topbar.appendChild(searchWrap);

  var themeBtn = document.createElement("button");
  themeBtn.className = "theme-toggle";
  function themeLabel() {
    return (document.documentElement.getAttribute("data-theme") === "dark") ? "☀︎ Light" : "☾ Dark";
  }
  themeBtn.textContent = themeLabel();
  themeBtn.onclick = function () {
    var cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
    themeBtn.textContent = themeLabel();
  };
  topbar.appendChild(themeBtn);

  /* ---------- restructure DOM ---------- */
  var main = document.querySelector("main");
  var layout = document.createElement("div");
  layout.className = "layout";
  var mainWrap = document.createElement("div");
  mainWrap.className = "main-wrap";
  mainWrap.appendChild(topbar);
  if (main) mainWrap.appendChild(main);
  layout.appendChild(sidebar);
  layout.appendChild(mainWrap);
  body.insertBefore(layout, body.firstChild);

  /* close mobile sidebar on nav click */
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") sidebar.classList.remove("open");
  });

  /* ---------- load the search index (offline-safe, no fetch) ---------- */
  var idxScript = document.createElement("script");
  idxScript.src = root + "assets/search-index.js";
  document.head.appendChild(idxScript);

  /* ---------- content search behaviour ---------- */
  var activeIdx = -1;

  function scoreEntry(e, terms) {
    var hay = (e.title + " " + e.headings.join(" ") + " " + e.text).toLowerCase();
    var score = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) continue;
      if (e.title.toLowerCase().indexOf(t) >= 0) score += 10;
      if (e.headings.join(" ").toLowerCase().indexOf(t) >= 0) score += 4;
      var pos = hay.indexOf(t);
      if (pos < 0) return -1;         // every term must appear somewhere
      score += 1;
    }
    return score;
  }

  function snippet(e, term) {
    var text = e.text, low = text.toLowerCase(), pos = term ? low.indexOf(term) : -1;
    if (pos < 0) return text.slice(0, 90) + "…";
    var start = Math.max(0, pos - 35);
    var frag = (start > 0 ? "…" : "") + text.slice(start, pos + 55) + "…";
    return frag;
  }

  function renderResults(q) {
    var idx = window.SEARCH_INDEX || [];
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    results.innerHTML = "";
    activeIdx = -1;
    if (!terms.length) { results.style.display = "none"; return; }
    var scored = [];
    idx.forEach(function (e) {
      var s = scoreEntry(e, terms);
      if (s >= 0) scored.push({ e: e, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    scored = scored.slice(0, 12);
    if (!scored.length) {
      results.innerHTML = '<div class="gsearch-empty">No matches</div>';
      results.style.display = "block";
      return;
    }
    scored.forEach(function (item, i) {
      var a = document.createElement("a");
      a.href = root + item.e.url;
      a.className = "gsearch-item";
      a.setAttribute("data-i", i);
      a.innerHTML = '<span class="gsearch-title">' + escapeHtml(item.e.title) + "</span>" +
                    '<span class="gsearch-snip">' + escapeHtml(snippet(item.e, terms[0])) + "</span>";
      results.appendChild(a);
    });
    results.style.display = "block";
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function moveActive(delta) {
    var items = results.querySelectorAll(".gsearch-item");
    if (!items.length) return;
    if (activeIdx >= 0) items[activeIdx].classList.remove("active");
    activeIdx = (activeIdx + delta + items.length) % items.length;
    items[activeIdx].classList.add("active");
    items[activeIdx].scrollIntoView({ block: "nearest" });
  }

  gsearch.addEventListener("input", function () { renderResults(gsearch.value); });
  gsearch.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Enter") {
      var items = results.querySelectorAll(".gsearch-item");
      var pick = items[activeIdx >= 0 ? activeIdx : 0];
      if (pick) location.href = pick.href;
    } else if (e.key === "Escape") { gsearch.value = ""; renderResults(""); gsearch.blur(); }
  });
  document.addEventListener("click", function (e) {
    if (!searchWrap.contains(e.target)) results.style.display = "none";
  });

  /* '/' focuses search (unless already typing in a field) */
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      gsearch.focus();
    }
  });

  /* ---------- copy-to-clipboard buttons on code blocks ---------- */
  (main ? main.querySelectorAll("pre") : []).forEach(function (pre) {
    pre.classList.add("has-copy");
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.textContent : pre.textContent;
      var done = function () { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy"; }, 1200); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
    pre.appendChild(btn);
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- back-to-top button ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = "↑";
  toTop.style.display = "none";
  toTop.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };
  document.body.appendChild(toTop);
  window.addEventListener("scroll", function () {
    var y = window.scrollY || document.documentElement.scrollTop;
    toTop.style.display = y > 400 ? "block" : "none";
  }, { passive: true });

  /* prev / next footer navigation — two cards, matching the site's .card look */
  var flat = [];
  SITEMAP.forEach(function (g) { g.items.forEach(function (it) { flat.push(it); }); });
  var idx = flat.findIndex(function (it) { return it.href === page; });
  if (idx >= 0 && main) {
    var footer = document.createElement("div");
    footer.className = "page-nav";
    var prev = flat[idx - 1], next = flat[idx + 1];
    var prevHtml = prev
      ? '<a class="page-nav-link page-nav-prev" href="' + root + prev.href + '">' +
          '<span class="page-nav-label">← Previous</span>' +
          '<span class="page-nav-title">' + prev.label + '</span></a>'
      : '<span class="page-nav-spacer"></span>';
    var nextHtml = next
      ? '<a class="page-nav-link page-nav-next" href="' + root + next.href + '">' +
          '<span class="page-nav-label">Next →</span>' +
          '<span class="page-nav-title">' + next.label + '</span></a>'
      : '<span class="page-nav-spacer"></span>';
    footer.innerHTML = prevHtml + nextHtml;
    main.appendChild(footer);
  }
})();

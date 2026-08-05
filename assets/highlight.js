/* ============================================================
   Tiny self-contained Java syntax highlighter (no dependencies).
   Highlights <pre><code class="java"> blocks. Single-pass tokenizer:
   comments & strings are matched first so keywords inside them
   are never re-highlighted.
   ============================================================ */
(function () {
  var KEYWORDS = new Set((
    "abstract assert boolean break byte case catch char class const continue default do double " +
    "else enum extends final finally float for goto if implements import instanceof int interface " +
    "long native new package private protected public return short static strictfp super switch " +
    "synchronized this throw throws transient try void volatile while " +
    // contextual / newer keywords
    "var yield record sealed permits non-sealed value when open module requires exports opens uses provides to with " +
    "true false null"
  ).split(" "));

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Ordered alternation. Groups:
  // 1 block/line comment | 2 text block | 3 string | 4 char | 5 annotation | 6 number | 7 word
  var TOKEN = new RegExp(
    "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)" +          // comments
    "|(\"\"\"[\\s\\S]*?\"\"\")" +                        // text block
    "|(\"(?:\\\\.|[^\"\\\\])*\")" +                     // string
    "|('(?:\\\\.|[^'\\\\])')" +                          // char
    "|(@[A-Za-z_][A-Za-z0-9_.]*)" +                      // annotation
    "|(\\b\\d[\\d_]*(?:\\.[\\d_]+)?(?:[eE][+-]?\\d+)?[fFdDlL]?\\b|\\b0x[0-9a-fA-F_]+[lL]?\\b)" + // number
    "|([A-Za-z_$][A-Za-z0-9_$]*)",                       // word
    "g"
  );

  function highlight(src) {
    var out = "";
    var last = 0;
    var m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      last = TOKEN.lastIndex;
      if (m[1]) out += '<span class="tok-comment">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-string">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-string">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-string">' + esc(m[4]) + "</span>";
      else if (m[5]) out += '<span class="tok-annot">' + esc(m[5]) + "</span>";
      else if (m[6]) out += '<span class="tok-number">' + esc(m[6]) + "</span>";
      else if (m[7]) {
        var w = m[7];
        if (KEYWORDS.has(w)) out += '<span class="tok-keyword">' + esc(w) + "</span>";
        else if (/^[A-Z]/.test(w)) out += '<span class="tok-type">' + esc(w) + "</span>";
        else out += esc(w);
      }
    }
    out += esc(src.slice(last));
    return out;
  }

  function run() {
    var blocks = document.querySelectorAll("pre code");
    blocks.forEach(function (el) {
      if (el.dataset.hl) return;
      el.dataset.hl = "1";
      el.innerHTML = highlight(el.textContent);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.__rehighlight = run;
})();

/* token colors */
(function () {
  var css = ".tok-keyword{color:var(--tok-keyword);font-weight:600}" +
            ".tok-type{color:var(--tok-type)}" +
            ".tok-string{color:var(--tok-string)}" +
            ".tok-comment{color:var(--tok-comment);font-style:italic}" +
            ".tok-number{color:var(--tok-number)}" +
            ".tok-annot{color:var(--tok-annot)}";
  var s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
})();

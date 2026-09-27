/* =============================================================
   Live GitHub data for the portfolio.
   - Fetches profile + repos from the public API (no token needed)
   - Renders filterable repo cards
   - Falls back to a baked-in snapshot if the network or rate limit fails
   ============================================================= */
(function () {
  "use strict";

  var OWNER = "hashini-desilva7";
  var API = "https://api.github.com/users/" + OWNER;
  var grid = document.getElementById("repo-grid");
  if (!grid) return;

  /* Repos to never show (GitHub's own profile README repo). */
  var EXCLUDE = { "hashini-desilva7": 1 };

  /* Explicit overrides where the keyword rules would guess wrong. */
  var CATEGORY_OVERRIDE = { "portfolio": "web" };

  /* Category map — matched against name + description. */
  var CATEGORY = [
    { key: "security", re: /vuln|ctf|exploit|hack|forensic|security|write-?up|sqli|sql-?inject|pentest|metasploitable|cyber|thm|burp/i },
    { key: "web",      re: /website|web|pwa|front-?end|frontend|html|css|javascript|design|ui\b|greenbite|station/i },
    { key: "code",     re: /library|management|system|oop|c#|dotnet|app|automation|tool|script/i }
  ];

  /* Language dot colours (GitHub linguist-ish). */
  var LANG_COLOR = {
    "C#": "#9b4f96", "HTML": "#e34c26", "CSS": "#563d7c",
    "JavaScript": "#f1e05a", "Python": "#3572A5", "C": "#555555",
    "C++": "#f34b7d", "Java": "#b07219", "TypeScript": "#3178c6",
    "Shell": "#89e051", "PowerShell": "#012456", "Markdown": "#083fa1"
  };

  /* ---------------------------------------------------------- snapshot
     Used when the API is unreachable or rate-limited. Values were read
     from the GitHub API on 2026-09-27. */
  var SNAPSHOT_PROFILE = { public_repos: 6, followers: 0, following: 0 };
  var SNAPSHOT_REPOS = [
    { name: "Vulnhub", description: "Hands-on VulnHub write-ups documenting enumeration, vulnerability exploitation, privilege escalation, and post-exploitation techniques.", language: "Markdown", stargazers_count: 0, forks_count: 0, updated_at: "2026-08-09T06:20:53Z", fork: false },
    { name: "Hackstation.io", description: "SQL Injection (SQLi) - VulnHub Write-up. UNION, boolean-blind, time-based blind and error-based SQLi, from column counting to admin flag.", language: "Markdown", stargazers_count: 0, forks_count: 0, updated_at: "2026-08-08T12:00:58Z", fork: false },
    { name: "Library-Management-System", description: "Oaktown Library Management System - desktop app for books, members, borrowing and returns. OOP inheritance hierarchy with unit tests.", language: "C#", stargazers_count: 0, forks_count: 0, updated_at: "2026-08-08T12:17:39Z", fork: false },
    { name: "GreenBite-Website", description: "GreenBite wellness PWA - recipes, workouts, equipment and mindfulness pages, with a service worker and offline support.", language: "HTML", stargazers_count: 0, forks_count: 0, updated_at: "2026-08-08T12:20:19Z", fork: false },
    { name: "portfolio", description: "Portfolio of Hashini Vihanga - BSc (Hons) Cyber Security. Digital forensics, penetration testing, Linux security.", language: "CSS", stargazers_count: 0, forks_count: 0, updated_at: "2026-09-27T11:00:47Z", fork: false }
  ];

  var categories = (function () {
    var r = {};
    for (var i = 0; i < CATEGORY.length; i++) r[CATEGORY[i].key] = CATEGORY[i].re;
    return r;
  })();

  function categorise(repo) {
    if (CATEGORY_OVERRIDE[repo.name]) return CATEGORY_OVERRIDE[repo.name];
    var hay = (repo.name || "") + " " + (repo.description || "");
    if (categories.security.test(hay)) return "security";
    if (categories.web.test(hay)) return "web";
    return "code";
  }

  /* ---------------------------------------------------------- helpers */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function relTime(iso) {
    if (!iso) return "";
    var then = new Date(iso).getTime();
    if (isNaN(then)) return "";
    var secs = Math.max(0, (Date.now() - then) / 1000);
    var units = [[31536000, "yr"], [2592000, "mo"], [604800, "wk"], [86400, "d"], [3600, "h"], [60, "m"]];
    for (var i = 0; i < units.length; i++) {
      if (secs >= units[i][0]) return Math.floor(secs / units[i][0]) + units[i][1] + " ago";
    }
    return "just now";
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------------------------------------------------------- render */
  var state = { filter: "all", repos: [] };

  function repoCard(repo) {
    var cat = categorise(repo);
    var href = "https://github.com/" + OWNER + "/" + encodeURIComponent(repo.name);
    var lang = repo.language;
    var langColor = LANG_COLOR[lang] || "#8b949e";

    var card = el("a", "repo-card");
    card.href = repo.html_url || href;
    card.target = "_blank";
    card.rel = "noopener";
    card.setAttribute("data-cat", cat);

    var top = el("div", "repo-top");
    top.appendChild(el("span", "repo-name", esc(repo.name)));
    if (repo.fork) top.appendChild(el("span", "repo-fork", "fork"));
    card.appendChild(top);

    var desc = repo.description && repo.description.trim();
    var d = el("p", "repo-desc" + (desc ? "" : " is-muted"), desc ? esc(desc) : "No description provided.");
    card.appendChild(d);

    var foot = el("div", "repo-foot");
    if (lang) {
      foot.appendChild(el("span", "repo-lang",
        '<i class="swatch" style="background:' + esc(langColor) + '"></i>' + esc(lang)));
    }
    foot.appendChild(el("span", "repo-meta",
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>' +
      (repo.stargazers_count || 0)));
    foot.appendChild(el("span", "repo-meta",
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2.4"/><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="9" r="2.4"/><path d="M6 7.4v9.2M18 11.4c0 3-4 3.2-8 3.4"/></svg>' +
      (repo.forks_count || 0)));
    foot.appendChild(el("span", "repo-updated", esc(relTime(repo.updated_at))));
    card.appendChild(foot);

    return card;
  }

  function render() {
    grid.innerHTML = "";
    var list = state.repos.filter(function (r) {
      return state.filter === "all" || categorise(r) === state.filter;
    });

    if (!list.length) {
      grid.appendChild(el("p", "repo-note", "No repositories in this category yet."));
      return;
    }

    list.forEach(function (r, i) {
      var card = repoCard(r);
      card.style.animationDelay = Math.min(i, 8) * 45 + "ms";
      grid.appendChild(card);
    });
  }

  function skeleton() {
    grid.innerHTML = "";
    for (var i = 0; i < 4; i++) grid.appendChild(el("div", "repo-skeleton"));
  }

  /* ---------------------------------------------------------- status */
  function setState(stateName, text) {
    var nodes = document.querySelectorAll("[data-gh-state]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute("data-gh-state", stateName);
      var t = nodes[i].querySelector ? nodes[i].querySelector(".repo-state-text") : null;
      if (t && text) t.textContent = text;
    }
  }

  function setStat(name, value) {
    var nodes = document.querySelectorAll('[data-gh-stat="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = String(value);
  }

  /* ---------------------------------------------------------- filters */
  var filters = document.querySelectorAll(".filter");
  Array.prototype.forEach.call(filters, function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(filters, function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.filter = btn.getAttribute("data-filter");
      render();
    });
  });

  /* ---------------------------------------------------------- load */
  function applyProfile(p) {
    if (!p) return;
    setStat("repos", p.public_repos != null ? p.public_repos : 0);
    setStat("followers", p.followers != null ? p.followers : 0);
    setStat("following", p.following != null ? p.following : 0);
  }

  function useSnapshot() {
    state.repos = SNAPSHOT_REPOS.slice();
    applyProfile(SNAPSHOT_PROFILE);
    render();
    setState("error", "offline — cached snapshot");
  }

  function load() {
    skeleton();
    setState("loading", "fetching from api.github.com…");

    if (typeof fetch !== "function") { useSnapshot(); return; }

    fetch(API + "/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error("bad payload");
        var clean = list.filter(function (r) {
          return !EXCLUDE[r.name] && !r.archived;
        });
        if (!clean.length) throw new Error("no repos");

        state.repos = clean;
        render();
        setState("live", "live from github api");

        return fetch(API, { headers: { Accept: "application/vnd.github+json" } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(applyProfile)
          .catch(function () { /* stats are optional */ });
      })
      .catch(function () { useSnapshot(); });
  }

  load();

  /* relative times go stale — refresh them once a minute */
  setInterval(function () { if (state.repos.length) render(); }, 60000);
})();

/* =============================================================
   Hashini Vihanga — portfolio
   Cyber layer: matrix canvas, typewriter, HUD clock, scan progress,
   theme, nav, reveal, counters.  No dependencies.
   ============================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------ theme */
  var THEME_KEY = "hv-theme";
  var toggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#05090d" : "#f4f7f8");
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* blocked */ }
  applyTheme(stored === "paper" || stored === "dark" ? stored : "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "paper" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ------------------------------------------------------ header shadow + progress */
  var header = document.querySelector(".site-header");
  var bootbar = document.querySelector(".bootbar i");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (bootbar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bootbar.style.width = (pct * 100).toFixed(2) + "%";
    }
  }
  onScroll();

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  /* ------------------------------------------------------ mobile nav */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("nav-toggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
  document.addEventListener("click", function (e) {
    if (!nav || !nav.classList.contains("open")) return;
    if (nav.contains(e.target) || (navToggle && navToggle.contains(e.target))) return;
    closeNav();
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1000) closeNav();
  });

  /* ------------------------------------------------------ HUD clock */
  var clock = document.getElementById("hdr-clock");
  if (clock) {
    var tick = function () {
      var d = new Date();
      var p = function (n) { return String(n).padStart(2, "0"); };
      clock.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------ typewriter */
  var typed = document.getElementById("typed");
  var ROLES = [
    "digital forensics",
    "penetration testing",
    "linux & network security",
    "secure web development",
    "ctf: enumeration → root",
  ];

  if (typed) {
    if (reduced) {
      typed.textContent = ROLES[0];
    } else {
      var r = 0, c = 0, deleting = false;
      var type = function () {
        var word = ROLES[r];
        typed.textContent = deleting ? word.slice(0, --c) : word.slice(0, ++c);

        var delay = deleting ? 34 : 58;
        if (!deleting && c === word.length) { deleting = true; delay = 1900; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % ROLES.length; delay = 380; }
        setTimeout(type, delay);
      };
      setTimeout(type, 700);
    }
  }

  /* ------------------------------------------------------ matrix canvas */
  var canvas = document.getElementById("matrix");
  if (canvas && !reduced) {
    var ctx = canvas.getContext("2d", { alpha: true });
    var GLYPHS = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>/\\[]{}$#@%&*+=";
    var cols = 0, drops = [], fontSize = 15, last = 0, running = true, DPR = 1;

    function readColors() {
      var cs = getComputedStyle(root);
      return {
        head: (cs.getPropertyValue("--grn") || "#00ffa3").trim(),
        tail: (cs.getPropertyValue("--cy-dim") || "#0e7490").trim()
      };
    }
    var cols_ = readColors();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * DPR));
      canvas.height = Math.max(1, Math.floor(rect.height * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      fontSize = rect.width < 620 ? 12 : 15;
      cols = Math.ceil(rect.width / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.random() * -60);
    }

    function draw(ts) {
      if (!running) return;
      if (ts - last < 55) { requestAnimationFrame(draw); return; }   /* ~18fps, cheap */
      last = ts;

      var rect = canvas.getBoundingClientRect();
      var w = rect.width, h = rect.height;

      ctx.fillStyle = "rgba(5, 9, 13, 0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + "px " + getComputedStyle(root).getPropertyValue("--mono");
      ctx.textBaseline = "top";

      for (var i = 0; i < cols; i++) {
        var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        var y = drops[i] * fontSize;

        if (y > 0 && y < h + fontSize) {
          ctx.fillStyle = cols_.head;
          ctx.fillText(ch, i * fontSize, y);
          ctx.fillStyle = cols_.tail;
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * fontSize, y - fontSize * 3);
        }
        if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -20;
        drops[i] += 0.55;
      }
      requestAnimationFrame(draw);
    }

    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);

    window.addEventListener("resize", function () {
      cols_ = readColors();
      resize();
    });

    /* pause when the tab is hidden or the hero is off-screen */
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { last = 0; requestAnimationFrame(draw); }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!running) { running = true; last = 0; requestAnimationFrame(draw); } }
          else running = false;
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ------------------------------------------------------ reveal */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        ro.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 5, 4) * 70 + "ms";
      ro.observe(el);
    });
  }

  /* ------------------------------------------------------ meters */
  if ("IntersectionObserver" in window && !reduced) {
    var meters = Array.prototype.slice.call(document.querySelectorAll(".meter i"));
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.animation = "none";
        void e.target.offsetWidth;
        e.target.style.animation = "";
        mo.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    meters.forEach(function (m) { mo.observe(m); });
  }

  /* ------------------------------------------------------ counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function fmt(el, v) {
    if (el.hasAttribute("data-plain")) return String(v);
    return v.toLocaleString() + (el.getAttribute("data-suffix") || "");
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (!target && target !== 0) return;
    if (reduced) { el.textContent = fmt(el, target); return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (reduced || !("IntersectionObserver" in window)) counters.forEach(runCounter);
    else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          runCounter(e.target);
          co.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ------------------------------------------------------ active nav */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ------------------------------------------------------ footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------ misc polish */
  /* light "typewriter write" shimmer across code chips on hover is CSS-only;
     here we just make the boot bar start from the top on load */
  bootbar && window.addEventListener("load", onScroll);
})();

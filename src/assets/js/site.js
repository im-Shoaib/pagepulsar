/* PagePulsar — shared page behaviour: header, menu, reveal animations, scan form, consent + analytics. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var cfg = window.PP_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  var nav = document.querySelector(".nav");
  var menuBtn = document.querySelector(".menu-btn");
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav-links a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
  }

  /* Reveal on scroll + animated bars and rings */
  function activate(el) {
    el.classList.add("is-in");
    el.querySelectorAll("[data-w]").forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; });
    el.querySelectorAll("[data-ring]").forEach(function (c) {
      var r = parseFloat(c.getAttribute("r")), len = 2 * Math.PI * r, v = parseFloat(c.getAttribute("data-ring"));
      c.style.strokeDasharray = len; c.style.strokeDashoffset = len;
      requestAnimationFrame(function () { c.style.strokeDashoffset = len * (1 - v / 100); });
    });
  }
  var targets = document.querySelectorAll(".reveal, [data-animate]");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    targets.forEach(activate);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* Scan form: normalise the URL, then open the report page */
  function normaliseUrl(raw) {
    var v = (raw || "").trim().replace(/\s+/g, "");
    if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try {
      var u = new URL(v);
      if (!/^https?:$/.test(u.protocol)) return null;
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) return null;
      return u.origin + (u.pathname === "/" ? "" : u.pathname);
    } catch (e) { return null; }
  }
  window.PP_normaliseUrl = normaliseUrl;
  document.querySelectorAll("form[data-scan]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[name=url]");
      var type = form.querySelector("select[name=type]");
      var err = form.querySelector(".form-error");
      var url = normaliseUrl(input.value);
      if (!url) {
        if (err) err.textContent = "Please enter a website address, like yourbusiness.com";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      track("scan_start", { business_type: type ? type.value : "" });
      var q = "?url=" + encodeURIComponent(url) + "&type=" + encodeURIComponent(type ? type.value : "general");
      var focus = form.getAttribute("data-focus");
      if (focus) q += "&focus=" + encodeURIComponent(focus);
      window.location.href = "/report/" + q;
    });
    var input = form.querySelector("input[name=url]");
    if (input) input.addEventListener("input", function () { var err = form.querySelector(".form-error"); if (err) err.textContent = ""; });
  });

  /* Year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* WhatsApp links get the configured number */
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-wa") || "Hi Shoaib, I'd like help with my website.";
    a.href = "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(msg);
    a.addEventListener("click", function () { track("cta_whatsapp_click", { position: a.getAttribute("data-pos") || "inline" }); });
  });

  /* Consent + Google Analytics (loads only after Accept) */
  var KEY = "pp_consent";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function loadGA() {
    if (!cfg.gaId || window.gtag) return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.gaId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.gaId, { anonymize_ip: true });
  }
  function track(name, params) { if (window.gtag) window.gtag("event", name, params || {}); }
  window.PP_track = track;
  var banner = document.querySelector(".consent");
  if (cfg.gaId && banner) {
    var choice = store(KEY);
    if (choice === "yes") loadGA();
    else if (choice !== "no") {
      banner.hidden = false;
      banner.querySelector("[data-consent=yes]").addEventListener("click", function () { store(KEY, "yes"); banner.hidden = true; loadGA(); });
      banner.querySelector("[data-consent=no]").addEventListener("click", function () { store(KEY, "no"); banner.hidden = true; });
    }
  }
  // Blog: highlight the current section in the table of contents.
  var tocLinks = document.querySelectorAll(".toc-side a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove("is-active"); });
          map[e.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) tio.observe(h); });
  }
})();

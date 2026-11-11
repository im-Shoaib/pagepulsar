/* PagePulsar — report page: runs the scan through the Worker and renders the result. */
(function () {
  "use strict";
  var cfg = window.PP_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var rawUrl = params.get("url") || "";
  var type = params.get("type") || "general";
  var focus = params.get("focus") || "";
  var url = window.PP_normaliseUrl ? window.PP_normaliseUrl(rawUrl) : rawUrl;
  var $ = function (id) { return document.getElementById(id); };
  var track = window.PP_track || function () {};

  var CAT_NAMES = { customers: "Customers", google: "Google", speed: "Speed", accessibility: "Accessibility", mobile: "Mobile", security: "Security", ai: "AI search" };
  var CAT_ORDER = ["customers", "google", "speed", "accessibility", "mobile", "security", "ai"];
  var FOCUS_CAT = { mobile: "mobile", accessibility: "accessibility", ai: "ai" };
  var SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  var GRADE_TEXT = { A: "Great", B: "Good", C: "Needs work", D: "Losing customers", F: "Urgent fixes needed" };
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
  var WA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>';

  var SEV_LABEL = { critical: "Urgent", high: "High impact", medium: "Medium", low: "Low" };
  var VERDICT = { A: "Your site is working hard for you", B: "Good, with a few gaps", C: "Needs some work", D: "Losing customers", F: "Urgent fixes needed" };
  var GRADE_COLOR = { A: "#2fbf71", B: "#9bd431", C: "#f2b705", D: "#ff8a5c", F: "#ff5a4e" };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
  var PRINT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></svg>';
  var AGAIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>';

  var BAND_WORD = { great: "Great", good: "Good", fair: "Fair", poor: "Poor", na: "Not tested" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
  function waLink(msg) { return "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(msg); }

  if (!url) { showError("invalid_url", "Please go back and enter a website address, like yourbusiness.com."); return; }
  $("r-domain").textContent = host(url);
  document.title = "Checking " + host(url) + " | PagePulsar";

  /* Progress animation while waiting */
  var steps = document.querySelectorAll(".progress-steps li");
  var stepIdx = 0;
  function setStep(i) {
    steps.forEach(function (li, n) { li.classList.toggle("is-done", n < i); li.classList.toggle("is-active", n === i); });
  }
  setStep(0);
  var timer = setInterval(function () { if (stepIdx < 2) setStep(++stepIdx); }, 7000);

  function finish(fn) { clearInterval(timer); setStep(3); setTimeout(function () { setStep(4); fn(); }, 450); }

  if (!cfg.apiUrl) {
    setTimeout(function () { finish(function () { render(demoReport(), true); }); }, 2600);
    return;
  }

  function timed(ms) { var c = "AbortController" in window ? new AbortController() : null; var t = setTimeout(function () { if (c) c.abort(); }, ms); return { signal: c ? c.signal : undefined, clear: function () { clearTimeout(t); } }; }

  // 1) Our Worker fetches the page (browsers can't read other sites directly).
  var t1 = timed(30000);
  var pagePromise = fetch(cfg.apiUrl.replace(/\/$/, "") + "/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url, fresh: params.get("fresh") === "1" }),
    signal: t1.signal
  }).then(function (res) {
    t1.clear();
    return res.json().catch(function () { return { error: "server" }; }).then(function (data) { if (!res.ok || data.error) { var e = new Error(data.message || ""); e.code = data.error || "server"; throw e; } return data; });
  }, function () { t1.clear(); var e = new Error(""); e.code = "timeout"; throw e; });

  // 2) Google PageSpeed Insights runs in parallel, straight from the browser.
  function runPsi(withFields) {
    var t = timed(60000);
    return fetch(window.PPEngine.psiUrl(url, cfg.psiKey || "", withFields), { signal: t.signal }).then(function (res) {
      t.clear();
      if (res.status === 400 && withFields) return runPsi(false);
      return res.ok ? res.json() : null;
    }, function () { t.clear(); return null; });
  }
  var psiPromise = runPsi(true);

  pagePromise.then(function (page) {
    if (stepIdx < 1) setStep(stepIdx = 1);
    return psiPromise.then(function (psiRaw) {
      setStep(2);
      var report = window.PPEngine.buildReport({ url: url, type: type, page: page, psiRaw: psiRaw });
      finish(function () { render(report, false); });
    });
  }).catch(function (e) {
    finish(function () { showError(e.code || "server", e.message); });
  });

  var ERRORS = {
    invalid_url: ["That doesn't look like a website address", "Enter your homepage address, like yourbusiness.com."],
    unreachable: ["We couldn't reach this website", "Check the address. If your site is down, that's problem number one — customers can't reach it either."],
    blocked: ["Your site blocked our automated check", "This is often a security setting. Message Shoaib and he'll check it by hand for free."],
    timeout: ["Your site took too long to respond", "It didn't answer within our time limit. Customers won't wait that long either. Try again in a minute."],
    not_html: ["That link isn't a web page", "Enter your homepage address instead of a file or image link."],
    rate_limited: ["You've run a lot of checks", "To keep the tool free for everyone, please try again in an hour."],
    server: ["Something went wrong on our side", "Please try again in a minute. If it keeps happening, message Shoaib."]
  };
  function showError(code, message) {
    var e = ERRORS[code] || ERRORS.server;
    $("r-progress").hidden = true;
    $("r-error").hidden = false;
    $("r-error-title").textContent = e[0];
    $("r-error-text").textContent = message || e[1];
    track("scan_error", { error_type: code });
  }

  function band(v) { return v == null ? "na" : v >= 90 ? "great" : v >= 75 ? "good" : v >= 50 ? "fair" : "poor"; }

  function rescore(d, ids) {
    try { return window.PPEngine && window.PPEngine.rescore ? window.PPEngine.rescore(d, ids) : null; } catch (e) { return null; }
  }

  function dialSvg(score, potential, color) {
    var r = 86, c = 2 * Math.PI * r;
    var cur = c * (score / 100), pot = c * (Math.max(potential, score) / 100);
    return '<svg class="dial-svg" viewBox="0 0 200 200" aria-hidden="true">' +
      '<circle cx="100" cy="100" r="' + r + '" class="dial-track"/>' +
      '<circle cx="100" cy="100" r="' + r + '" class="dial-pot" style="stroke-dasharray:' + pot.toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '<circle cx="100" cy="100" r="' + r + '" class="dial-cur" style="stroke:' + color + ';--len:' + cur.toFixed(1) + ';--c:' + c.toFixed(1) + ';stroke-dasharray:' + cur.toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '</svg>';
  }

  function countUp(el, to, ms) {
    if (!el) return;
    if (reduceMotion) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function render(d, demo) {
    $("r-progress").hidden = true;
    var box = $("r-result");
    var grade = (d.grade || "F").toUpperCase();
    var gColor = GRADE_COLOR[grade];
    var site = host(d.finalUrl || d.url || url);
    var checks = (d.checks || []).slice();
    var issues = checks.filter(function (c) { return (c.status === "fail" || c.status === "partial") && c.severity !== "info"; });
    var optional = checks.filter(function (c) { return c.status === "fail" && c.severity === "info"; });
    var passed = checks.filter(function (c) { return c.status === "pass"; });
    var unknown = checks.filter(function (c) { return c.status === "unknown"; });
    var focusCat = FOCUS_CAT[focus];
    issues.sort(function (a, b) {
      if (focusCat) { var fa = a.category === focusCat ? 0 : 1, fb = b.category === focusCat ? 0 : 1; if (fa !== fb) return fa - fb; }
      return (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) || ((d.categories[b.category] || {}).weight || 0) - ((d.categories[a.category] || {}).weight || 0);
    });
    var cats = CAT_ORDER.filter(function (k) { return d.categories && d.categories[k]; });
    if (focusCat && cats.indexOf(focusCat) > -1) { cats.splice(cats.indexOf(focusCat), 1); cats.unshift(focusCat); }
    var serious = issues.filter(function (c) { return c.severity === "critical" || c.severity === "high"; }).length;
    var summary = issues.length === 0 ? "We didn't find anything to fix. Your homepage is doing its job." :
      serious > 0 ? serious + (serious === 1 ? " problem is" : " problems are") + " likely costing you calls or bookings." :
      issues.length + " small " + (issues.length === 1 ? "fix" : "fixes") + " would make your site even better.";

    // Potential score and per-issue impact.
    var allIds = issues.map(function (c) { return c.id; });
    var critIds = issues.filter(function (c) { return c.severity === "critical" && c.status === "fail"; }).map(function (c) { return c.id; });
    var best = rescore(d, allIds);
    var potential = best ? best.score : d.score;
    var critBase = critIds.length ? rescore(d, critIds) : null;
    issues.forEach(function (c) {
      var isCrit = c.severity === "critical" && c.status === "fail";
      if (isCrit && d.cappedByCritical) { c._cap = true; }
      var base = isCrit || !critBase ? d.score : critBase.score;
      var withIt = rescore(d, isCrit || !critBase ? [c.id] : critIds.concat([c.id]));
      c._gain = withIt ? Math.max(0, withIt.score - base) : 0;
    });

    var storeKey = "pp-fixed:" + site;
    var fixed = {};
    try { (JSON.parse(localStorage.getItem(storeKey) || "[]") || []).forEach(function (id) { if (allIds.indexOf(id) > -1) fixed[id] = 1; }); } catch (e) {}

    var shot = d.psi && d.psi.screenshot ? '<div class="phone-frame"><img src="' + esc(d.psi.screenshot) + '" alt="How ' + esc(site) + ' looks on a phone" width="200" height="400" loading="lazy"></div>' : "";
    var checkedAt = new Date(d.scannedAt || Date.now()).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

    var html = "";
    if (demo) html += '<p class="notice">This is a sample report. The live scanner isn’t connected yet.</p>';

    // ---------- Hero ----------
    html += '<section class="rp-hero' + (shot ? " has-phone" : "") + '" aria-labelledby="r-title">';
    html += '<div class="rp-dial grade-' + grade.toLowerCase() + '">' +
      '<div class="dial">' + dialSvg(d.score, potential, gColor) +
      '<div class="dial-center"><span class="dial-num" id="r-num">' + (reduceMotion ? d.score : 0) + '</span><span class="dial-of">out of 100</span></div></div>' +
      '<svg class="pulse-line" viewBox="0 0 240 40" aria-hidden="true"><path d="M2 22h56l10-14 14 28 12-34 12 30 8-10h124"/></svg>' +
      '<p class="dial-grade"><b>Grade ' + grade + '</b> ' + esc(GRADE_TEXT[grade]) + '</p></div>';
    html += '<div class="rp-info">' +
      '<p class="rp-kind">' + esc(labelType(d.type)) + ' website report</p>' +
      '<h1 id="r-title">' + esc(site) + '</h1>' +
      '<p class="rp-verdict" style="--g:' + gColor + '">' + esc(VERDICT[grade]) + '</p>' +
      '<p class="rp-summary">' + esc(summary) + '</p>' +
      (issues.length && potential > d.score ? '<p class="rp-potential"><span class="pot-dot"></span><span>Fix everything below and your score could reach <b>' + potential + '</b></span></p>' : "") +
      '<div class="rp-actions no-print"><button class="pill-btn" type="button" id="r-share">' + SHARE + '<span>Copy link</span></button><button class="pill-btn" type="button" id="r-print">' + PRINT + '<span>Save PDF</span></button><a class="pill-btn" href="/#check">' + AGAIN + '<span>Check another site</span></a></div>' +
      '<p class="rp-time">Checked ' + esc(checkedAt) + (d.cached ? " (saved result from the last 24 hours)" : "") + '</p>' +
      '</div>';
    if (shot) html += '<div class="rp-phone">' + shot + '</div>';
    html += '</section>';

    // ---------- Vitals ----------
    html += '<section class="rp-vitals" aria-label="Scores by area">';
    cats.forEach(function (k, i) {
      var c = d.categories[k], v = c.score, b = band(v);
      var n = issues.filter(function (x) { return x.category === k; }).length;
      var sub = v == null ? "Not tested this time" : n ? n + (n === 1 ? " thing to fix" : " things to fix") : "Nothing to fix";
      html += '<button type="button" class="vital vital-' + b + '" data-filter="' + k + '" style="--v:' + (v == null ? 0 : v) + ';--i:' + i + '"' + (n ? "" : ' data-empty="1"') + '>' +
        '<span class="ring"><span>' + (v == null ? "–" : v) + '</span></span>' +
        '<span class="vital-text"><b>' + CAT_NAMES[k] + '</b><small>' + BAND_WORD[b] + '</small><small class="vital-sub">' + sub + '</small></span></button>';
    });
    html += '</section>';
    if (d.psi && d.psi.available === false) html += '<p class="notice">Google’s speed test didn’t finish this time, so Speed isn’t part of your score. Run the check again later for a full report.</p>';

    // ---------- Fix plan ----------
    if (issues.length) {
      html += '<section class="rp-plan" aria-labelledby="r-issues">';
      html += '<div class="plan-head"><h2 id="r-issues">Your fix plan</h2><p>Sorted by impact on calls, bookings and Google. Open any item to see why it matters and how to fix it.</p></div>';
      var chipCats = cats.filter(function (k) { return issues.some(function (x) { return x.category === k; }); });
      html += '<div class="plan-filters no-print" role="toolbar" aria-label="Filter fixes"><button type="button" class="fchip is-on" data-filter="all" aria-pressed="true">All <span>' + issues.length + '</span></button>';
      if (serious) html += '<button type="button" class="fchip" data-filter="serious" aria-pressed="false">Biggest problems <span>' + serious + '</span></button>';
      chipCats.forEach(function (k) { html += '<button type="button" class="fchip" data-filter="' + k + '" aria-pressed="false">' + CAT_NAMES[k] + ' <span>' + issues.filter(function (x) { return x.category === k; }).length + '</span></button>'; });
      html += '</div>';
      html += '<div class="plan-grid"><ol class="fixes" id="r-fixes">';
      issues.forEach(function (c, i) {
        var impact = c._cap ? '<span class="impact impact-cap" title="While this is broken your score can’t go above 59">Score capped</span>' : c._gain > 0 ? '<span class="impact">+' + c._gain + (c._gain === 1 ? " pt" : " pts") + '</span>' : "";
        html += '<li class="fix sev-' + c.severity + (fixed[c.id] ? " is-fixed" : "") + (i >= 8 ? " beyond" : "") + '" data-cat="' + c.category + '" data-sev="' + c.severity + '" data-id="' + esc(c.id) + '">' +
          '<details' + (i === 0 && !fixed[c.id] ? " open" : "") + '><summary>' +
          '<span class="fix-sev">' + SEV_LABEL[c.severity] + '</span>' +
          '<span class="fix-title">' + esc(c.title) + '</span>' +
          '<span class="fix-meta"><span class="fix-area">' + CAT_NAMES[c.category] + '</span>' + impact + '<span class="chev">' + CHEV + '</span></span>' +
          '</summary><div class="fix-body">' +
          '<p class="fix-why">' + esc(c.why) + '</p>' +
          '<div class="fix-how"><b>How to fix it</b><p>' + esc(c.fix) + '</p>' + (c.detail ? '<p class="fix-detail">' + esc(c.detail) + '</p>' : "") + '</div>' +
          (c._cap ? '<p class="fix-cap">While this is broken, your overall score can’t go above 59.</p>' : "") +
          '<button type="button" class="mark no-print" aria-pressed="' + (fixed[c.id] ? "true" : "false") + '"><span class="box">' + CHECK + '</span><span class="mark-text">' + (fixed[c.id] ? "Marked as fixed" : "Mark as fixed") + '</span></button>' +
          '</div></details></li>';
      });
      html += '</ol>';
      if (issues.length > 8) html += '<button type="button" class="more-fixes no-print" id="r-more-fixes">Show ' + (issues.length - 8) + ' more fixes</button>';
      html += '<aside class="planner no-print" aria-label="Score planner"><div class="planner-card">' +
        '<p class="planner-title">Score planner</p>' +
        '<p class="planner-help">Tick “Mark as fixed” on any item to see where your score could land.</p>' +
        '<div class="planner-nums"><span class="pn-now"><small>Now</small><b>' + d.score + '</b></span><span class="pn-arrow" aria-hidden="true"></span><span class="pn-next"><small>After fixes</small><b id="r-next" aria-live="polite">' + d.score + '</b></span></div>' +
        '<div class="planner-bar" aria-hidden="true"><span class="pb-now" style="width:' + d.score + '%;background:' + gColor + '"></span><span class="pb-gain" id="r-gain"></span><span class="pb-pot" style="left:' + potential + '%"></span></div>' +
        '<p class="planner-count" id="r-count"></p>' +
        '<div class="planner-tools"><button type="button" class="link-btn" id="r-all">Mark all</button><button type="button" class="link-btn" id="r-clear">Clear</button></div>' +
        '<a class="btn btn-lime planner-cta" id="r-planner-cta" href="#" data-pos="planner">' + WA + '<span>Get these fixed for me</span></a>' +
        '<p class="planner-note">An estimate using our scoring. Speed and accessibility fixes assume Google’s tests reach 90 or more.</p>' +
        '</div></aside></div></section>';
    } else {
      html += '<section class="rp-clean"><h2>Nothing to fix</h2><p>Every check we can run passed. Nice work.</p></section>';
    }

    // ---------- What's working ----------
    if (passed.length) {
      html += '<section class="rp-good" aria-labelledby="r-good"><div class="good-head"><h2 id="r-good">What’s already working</h2><span class="good-count">' + passed.length + ' checks passed</span></div><ul class="good-list">';
      passed.forEach(function (c, i) { html += '<li' + (i >= 9 ? ' class="more"' : "") + '>' + CHECK + '<span>' + esc(c.passTitle || c.title) + '</span></li>'; });
      html += '</ul>' + (passed.length > 9 ? '<button type="button" class="link-btn no-print" id="r-more">Show all ' + passed.length + '</button>' : "") + '</section>';
    }

    if (optional.length || unknown.length) {
      html += '<section class="rp-extra">';
      if (optional.length) {
        html += '<details class="extra"><summary>Optional extras <span>' + optional.length + '</span><small>Not counted in your score</small></summary><ul>';
        optional.forEach(function (c) { html += '<li><b>' + esc(c.title) + '.</b> ' + esc(c.fix) + '</li>'; });
        html += '</ul></details>';
      }
      if (unknown.length) {
        html += '<details class="extra"><summary>Couldn’t check <span>' + unknown.length + '</span><small>Not counted against you</small></summary><ul>';
        unknown.forEach(function (c) { html += '<li>' + esc(c.passTitle || c.title) + '</li>'; });
        html += '</ul></details>';
      }
      html += '</section>';
    }

    var good = d.score >= 90;
    var baseMsg = "Hi Shoaib, I checked " + site + " on PagePulsar. Score: " + d.score + "/100 (" + issues.length + " issues). Can you help fix it?";
    html += '<section class="section no-print"><div class="cta card-dark"><div class="cta-text"><h2>' + (good ? "Your site is in good shape." : "Want these fixed?") + '</h2><p>' + (good ? "Need a new feature, a redesign or ongoing care? Message Shoaib." : "Shoaib fixes sites like yours or builds a new one, from $50. Send your report on WhatsApp for a clear quote.") + '</p><a class="btn btn-lime" href="' + waLink(baseMsg) + '" data-pos="report">' + WA + (good ? "Message on WhatsApp" : "Fix these issues from $50") + '</a></div></div></section>';
    html += '<p class="rp-legal">Automated check of your public homepage. Not legal advice or an accessibility certification. <a href="/how-scoring-works/">How scoring works</a></p>';

    box.innerHTML = html;
    box.hidden = false;
    document.title = site + " scored " + d.score + " | PagePulsar";

    // ---------- Animate the dial once ----------
    var dialEl = box.querySelector(".rp-dial");
    requestAnimationFrame(function () { requestAnimationFrame(function () { dialEl.classList.add("is-in"); box.querySelector(".rp-vitals").classList.add("is-in"); }); });
    countUp($("r-num"), d.score, 1100);

    // ---------- Filters ----------
    var list = $("r-fixes");
    var moreFixes = $("r-more-fixes"), expanded = false;
    if (moreFixes) moreFixes.addEventListener("click", function () { expanded = true; applyFilter("all"); });
    function applyFilter(f) {
      if (!list) return;
      box.querySelectorAll(".fchip").forEach(function (b) { var on = b.getAttribute("data-filter") === f; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      list.querySelectorAll(".fix").forEach(function (li) {
        var cat = li.getAttribute("data-cat"), sev = li.getAttribute("data-sev");
        var show = f === "all" || f === cat || (f === "serious" && (sev === "critical" || sev === "high"));
        li.hidden = !show || (f === "all" && !expanded && li.classList.contains("beyond"));
      });
      if (moreFixes) moreFixes.hidden = f !== "all" || expanded;
    }
    box.querySelectorAll(".fchip").forEach(function (b) { b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); }); });
    applyFilter("all");
    box.querySelectorAll(".vital").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!list || b.getAttribute("data-empty")) return;
        applyFilter(b.getAttribute("data-filter"));
        var first = list.querySelector(".fix:not([hidden]) details");
        if (first) first.open = true;
        document.getElementById("r-issues").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });

    // ---------- Planner ----------
    var nextEl = $("r-next"), gainEl = $("r-gain"), countEl = $("r-count"), plannerCta = $("r-planner-cta");
    function selected() { return allIds.filter(function (id) { return fixed[id]; }); }
    function updatePlanner() {
      if (!nextEl) return;
      var ids = selected();
      var r = ids.length ? rescore(d, ids) : null;
      var next = r ? r.score : d.score;
      nextEl.textContent = next;
      nextEl.parentNode.classList.toggle("is-up", next > d.score);
      gainEl.style.left = d.score + "%";
      gainEl.style.width = Math.max(0, next - d.score) + "%";
      countEl.textContent = ids.length ? ids.length + " of " + allIds.length + " fixes marked" + (next > d.score ? ", +" + (next - d.score) + " points" : "") : "No fixes marked yet";
      var chosen = issues.filter(function (c) { return fixed[c.id]; });
      var msg = chosen.length ?
        "Hi Shoaib, I checked " + site + " on PagePulsar (score " + d.score + "/100). I'd like help with:\n" + chosen.map(function (c) { return "- " + c.title; }).join("\n") :
        baseMsg;
      plannerCta.href = waLink(msg);
      plannerCta.querySelector("span").textContent = chosen.length ? "Get " + chosen.length + (chosen.length === 1 ? " fix" : " fixes") + " done for me" : "Get these fixed for me";
      try { localStorage.setItem(storeKey, JSON.stringify(ids)); } catch (e) {}
    }
    function setFixed(li, on) {
      var id = li.getAttribute("data-id");
      if (on) fixed[id] = 1; else delete fixed[id];
      li.classList.toggle("is-fixed", on);
      var btn = li.querySelector(".mark");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.querySelector(".mark-text").textContent = on ? "Marked as fixed" : "Mark as fixed";
    }
    if (list) {
      list.querySelectorAll(".fix").forEach(function (li) {
        li.querySelector(".mark").addEventListener("click", function () { setFixed(li, !fixed[li.getAttribute("data-id")]); updatePlanner(); track("plan_toggle", { business_type: d.type }); });
      });
      $("r-all").addEventListener("click", function () { list.querySelectorAll(".fix").forEach(function (li) { setFixed(li, true); }); updatePlanner(); });
      $("r-clear").addEventListener("click", function () { list.querySelectorAll(".fix").forEach(function (li) { setFixed(li, false); }); updatePlanner(); });
      plannerCta.addEventListener("click", function () { track("cta_whatsapp_click", { position: "planner", score_band: grade, business_type: d.type, selected: selected().length }); });
      updatePlanner();
    }

    var more = $("r-more");
    if (more) more.addEventListener("click", function () { box.querySelector(".good-list").classList.add("show-all"); more.remove(); });

    window.addEventListener("beforeprint", function () { box.querySelectorAll("details").forEach(function (x) { x.open = true; }); box.querySelectorAll(".fix").forEach(function (li) { li.hidden = false; }); });

    var sticky = $("r-sticky");
    if (sticky && !good && issues.length) { sticky.href = waLink(baseMsg); sticky.hidden = false; sticky.addEventListener("click", function () { track("cta_whatsapp_click", { position: "sticky", score_band: grade }); }); }
    box.querySelectorAll("a[data-pos=report]").forEach(function (a) { a.addEventListener("click", function () { track("cta_whatsapp_click", { position: "inline", score_band: grade, business_type: d.type }); }); });
    $("r-print").addEventListener("click", function () { track("report_print", { business_type: d.type }); window.print(); });
    $("r-share").addEventListener("click", function (e) {
      var link = location.origin + "/report/?url=" + encodeURIComponent(url) + "&type=" + encodeURIComponent(type);
      var btn = e.currentTarget, label = btn.querySelector("span");
      var done = function () { label.textContent = "Link copied"; setTimeout(function () { label.textContent = "Copy link"; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, done); else done();
      track("report_share", { business_type: d.type });
    });
    track("scan_complete", { business_type: d.type, score_band: grade, issues_count: issues.length });
    box.setAttribute("tabindex", "-1");
    window.scrollTo(0, 0);
  }

  function labelType(t) { return { contractor: "Contractor / home services", restaurant: "Restaurant", dentist: "Dentist", salon: "Salon or spa", auto: "Auto repair" }[t] || "Local business"; }

  function demoReport() {
    var c = function (id, category, severity, status, title, why, fix, passTitle, detail) { return { id: id, category: category, severity: severity, status: status, title: title, why: why, fix: fix, passTitle: passTitle, detail: detail || "" }; };
    var d = {
      url: url, finalUrl: url, type: type, scannedAt: new Date().toISOString(), cached: false,
      psi: { available: true, performance: 41, accessibility: 77, field: null },
      checks: [
        c("click_to_call", "customers", "critical", "fail", "Customers on phones can't tap to call you", "Most local searches happen on phones, and every extra step loses calls.", "Make your phone number a tap-to-call link (tel:)."),
        c("booking", "customers", "high", "fail", "Customers can't book online", "People who search after hours book with whoever lets them pick a time.", "Add a booking button that links to your booking tool."),
        c("perf", "speed", "high", "fail", "Your site is slow on phones (41/100)", "Slow pages lose visitors before they see your offer.", "Compress large images and remove unused scripts.", "", "Google suggests: Properly size images, Serve images in modern formats"),
        c("copyright", "customers", "medium", "fail", "Your site says © 2019", "Customers may think you've closed.", "Update the year in your footer."),
        c("hours", "customers", "medium", "fail", "Opening hours aren't on your homepage", "Hours are one of the first things customers look for.", "Add your hours near your address."),
        c("meta_description", "google", "low", "partial", "Your Google description is too short", "This is the text under your link in search results.", "Write 50 to 160 characters about what you do and where."),
        c("https", "security", "critical", "pass", "", "", "", "Secure connection (HTTPS)"),
        c("viewport", "mobile", "critical", "pass", "", "", "", "Built for phones"),
        c("title", "google", "medium", "pass", "", "", "", "Clear page title"),
        c("h1", "google", "medium", "pass", "", "", "", "One clear main heading"),
        c("reviews", "customers", "medium", "pass", "", "", "", "Reviews shown on your page"),
        c("map", "customers", "low", "pass", "", "", "", "Map or directions link"),
        c("llms", "ai", "low", "pass", "", "", "", "AI search can read your page")
      ]
    };
    d.checks[2].display = true;
    var s = window.PPEngine && window.PPEngine.rescore ? window.PPEngine.rescore(d, []) : { score: 52, grade: "D", categories: {} };
    d.score = s.score; d.grade = s.grade; d.categories = s.categories; d.cappedByCritical = s.cappedByCritical;
    return d;
  }
})();

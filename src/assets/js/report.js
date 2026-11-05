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

  function render(d, demo) {
    $("r-progress").hidden = true;
    var box = $("r-result");
    var grade = (d.grade || "F").toUpperCase();
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
    var summary = issues.length === 0 ? "No problems found. Your site is in great shape." :
      serious > 0 ? serious + (serious === 1 ? " problem is" : " problems are") + " likely costing you calls or bookings." :
      issues.length + " small " + (issues.length === 1 ? "fix" : "fixes") + " would make your site even better.";
    var msg = "Hi Shoaib, I checked " + site + " on PagePulsar. Score: " + d.score + "/100 (" + issues.length + " issues). Can you help fix it?";
    var barColor = function (v) { return v >= 75 ? "var(--lime)" : v >= 50 ? "var(--sun)" : "#ff9f7a"; };
    var shot = d.psi && d.psi.screenshot ? '<img class="shot" src="' + esc(d.psi.screenshot) + '" alt="Screenshot of ' + esc(site) + ' on a phone" width="220" height="440" loading="lazy">' : "";

    var html = "";
    if (demo) html += '<p class="notice" style="margin-top:16px">Demo report — the live scanner isn’t connected yet, so this shows sample results.</p>';
    html += '<section class="report-top section" aria-labelledby="r-title">';
    html += '<div class="score-card grade-' + grade.toLowerCase() + '"><span style="font-weight:600">Overall score</span><div class="big">' + d.score + '<small>/100</small></div><span style="font-size:22px;font-weight:700">Grade ' + grade + ' — ' + GRADE_TEXT[grade] + '</span><p>' + esc(summary) + '</p></div>';
    html += '<div class="card site-meta"><div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;justify-content:space-between"><div style="flex:1 1 260px;min-width:0"><p class="muted" style="font-size:14px">Website report · ' + esc(labelType(d.type)) + '</p><h1 id="r-title" style="margin-top:6px">' + esc(site) + '</h1><p class="muted" style="margin-top:8px;font-size:14px">Checked ' + new Date(d.scannedAt || Date.now()).toLocaleString() + (d.cached ? " · saved result" : "") + '</p>';
    html += '<div class="chips no-print"><button class="btn btn-ghost" type="button" id="r-share">Copy share link</button><button class="btn btn-ghost" type="button" id="r-print">Save as PDF</button><a class="btn btn-ghost" href="/#check">Check another site</a></div></div>' + shot + '</div></div>';
    html += '</section>';

    html += '<section class="section" aria-label="Scores by area"><div class="cats">';
    cats.forEach(function (k) {
      var c = d.categories[k];
      if (c.score == null) { html += '<div class="cat"><small>' + CAT_NAMES[k] + '</small><b>–</b><small>Unavailable</small></div>'; return; }
      html += '<a class="cat" href="#cat-' + k + '"><small>' + CAT_NAMES[k] + '</small><b>' + c.score + '</b><span class="bar-track"><span class="bar-fill" style="width:' + c.score + '%;background:' + barColor(c.score) + '"></span></span></a>';
    });
    html += '</div>';
    if (d.psi && d.psi.available === false) html += '<p class="notice" style="margin-top:12px">The speed test didn’t finish this time, so Speed isn’t included in your score. Try again later for a full report.</p>';
    html += '</section>';

    html += '<section class="section" aria-labelledby="r-issues"><h2 id="r-issues" class="h2" style="margin:8px 8px 16px">' + (issues.length ? "What to fix, most important first" : "Nothing to fix") + '</h2><div class="issues">';
    var seen = {};
    issues.forEach(function (c) {
      var anchor = seen[c.category] ? "" : ' id="cat-' + c.category + '"'; seen[c.category] = 1;
      html += '<article class="issue-card"' + anchor + '><span class="sev sev-' + c.severity + '">' + c.severity + '</span><div><h3>' + esc(c.title) + '</h3><p>' + esc(c.why) + '</p><p class="fix"><b>Fix:</b> ' + esc(c.fix) + '</p>' + (c.detail ? '<p style="font-size:13px">' + esc(c.detail) + '</p>' : "") + '</div></article>';
    });
    html += '</div></section>';

    if (optional.length) {
      html += '<section class="section"><details class="passed"><summary>Optional extras (' + optional.length + ') — not counted in your score</summary><ul>';
      optional.forEach(function (c) { html += '<li><span><b>' + esc(c.title) + '.</b> ' + esc(c.fix) + '</span></li>'; });
      html += '</ul></details></section>';
    }
    if (unknown.length) {
      html += '<section class="section"><details class="passed"><summary>Couldn’t verify (' + unknown.length + ') — not counted against you</summary><ul>';
      unknown.forEach(function (c) { html += '<li>' + esc(c.passTitle || c.title) + '</li>'; });
      html += '</ul></details></section>';
    }
    if (passed.length) {
      html += '<section class="section"><details class="passed"><summary>What you’re doing right (' + passed.length + ')</summary><ul>';
      passed.forEach(function (c) { if (!seen[c.category]) { seen[c.category] = 1; } html += '<li>' + CHECK + '<span>' + esc(c.passTitle || c.title) + '</span></li>'; });
      html += '</ul></details></section>';
    }

    var good = d.score >= 90;
    html += '<section class="section no-print"><div class="cta card-dark"><div class="cta-text"><h2>' + (good ? "Your site is in good shape." : "Want these fixed?") + '</h2><p>' + (good ? "Need a new feature, a redesign or ongoing care? Message Shoaib." : "I fix sites like yours or build a new one — from $50. Send me your report on WhatsApp and you’ll get a clear quote.") + '</p><a class="btn btn-lime" href="' + waLink(msg) + '" data-pos="report">' + WA + (good ? "Message me on WhatsApp" : "Fix these issues — from $50") + '</a></div></div></section>';
    html += '<p class="muted" style="font-size:13px;padding:0 8px 24px">Automated check of your public homepage. Not legal advice or an accessibility certification. <a href="/how-scoring-works/">How scoring works</a></p>';

    box.innerHTML = html;
    box.hidden = false;
    document.title = site + " — score " + d.score + " | PagePulsar";

    var sticky = $("r-sticky");
    if (sticky && !good && issues.length) { sticky.href = waLink(msg); sticky.hidden = false; sticky.addEventListener("click", function () { track("cta_whatsapp_click", { position: "sticky", score_band: grade }); }); }
    box.querySelectorAll("a[data-pos=report]").forEach(function (a) { a.addEventListener("click", function () { track("cta_whatsapp_click", { position: "inline", score_band: grade, business_type: d.type }); }); });
    $("r-print").addEventListener("click", function () { track("report_print", { business_type: d.type }); window.print(); });
    $("r-share").addEventListener("click", function (e) {
      var link = location.origin + "/report/?url=" + encodeURIComponent(url) + "&type=" + encodeURIComponent(type);
      var btn = e.currentTarget;
      var done = function () { btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = "Copy share link"; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, done); else done();
      track("report_share", { business_type: d.type });
    });
    track("scan_complete", { business_type: d.type, score_band: grade, issues_count: issues.length });
    box.focus && box.setAttribute("tabindex", "-1");
    window.scrollTo(0, 0);
  }

  function labelType(t) { return { contractor: "Contractor / home services", restaurant: "Restaurant", dentist: "Dentist", salon: "Salon or spa", auto: "Auto repair" }[t] || "Local business"; }

  function demoReport() {
    var c = function (id, category, severity, status, title, why, fix, passTitle) { return { id: id, category: category, severity: severity, status: status, title: title, why: why, fix: fix, passTitle: passTitle }; };
    return {
      url: url, finalUrl: url, type: type, scannedAt: new Date().toISOString(), cached: false, score: 58, grade: "D",
      categories: { customers: { score: 48, weight: 35 }, google: { score: 72, weight: 20 }, speed: { score: 41, weight: 15 }, accessibility: { score: 77, weight: 15 }, mobile: { score: 100, weight: 10 }, security: { score: 100, weight: 3 }, ai: { score: 50, weight: 2 } },
      psi: { available: true },
      checks: [
        c("click_to_call", "customers", "critical", "fail", "Customers on phones can't tap to call you", "Most local searches happen on phones, and every extra step loses calls.", "Make your phone number a tap-to-call link (tel:)."),
        c("booking", "customers", "high", "fail", "Customers can't book online", "People who search after hours book with whoever lets them pick a time.", "Add a booking button that links to your booking tool."),
        c("perf", "speed", "high", "fail", "Your site is slow on phones (41/100)", "Slow pages lose visitors before they see your offer.", "Compress large images and remove unused scripts."),
        c("copyright", "customers", "medium", "fail", "Your site says © 2019", "Customers may think you've closed.", "Update the year in your footer."),
        c("hours", "customers", "medium", "fail", "Opening hours aren't on your homepage", "Hours are one of the first things customers look for.", "Add your hours near your address."),
        c("meta_description", "google", "low", "partial", "Your Google description is too short", "This is the text under your link in search results.", "Write 50–160 characters about what you do and where."),
        c("https", "mobile", "critical", "pass", "", "", "", "Secure connection (HTTPS)"),
        c("viewport", "mobile", "critical", "pass", "", "", "", "Built for phones"),
        c("title", "google", "medium", "pass", "", "", "", "Clear page title"),
        c("reviews", "customers", "medium", "pass", "", "", "", "Reviews shown on your page")
      ]
    };
  }
})();

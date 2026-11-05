import test from "node:test";
import assert from "node:assert/strict";
import { checkUrl } from "../src/guard.js";
import { analyzeHtml, robotsBlocks } from "../src/analyze.js";
import { runChecks, score } from "../src/score.js";
import { fetchBundle } from "../src/index.js";
import { buildReport } from "../src/engine.js";
const scan = async (url, type) => buildReport({ url, type, page: await fetchBundle(url), psiRaw: await (await fetch("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=x")).json() });

const GOOD = `<!doctype html><html lang="en"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bella Cucina | Italian Restaurant in Austin, TX</title>
<meta name="description" content="Family-run Italian restaurant in Austin serving handmade pasta, wood-fired pizza and wine. Order online or book a table.">
<meta property="og:title" content="Bella Cucina"><meta property="og:image" content="https://bella.example/og.jpg">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Restaurant","name":"Bella Cucina","address":{"@type":"PostalAddress","streetAddress":"120 Main Street"},"openingHours":"Mo-Su 11:00-22:00","aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"212"}}</script>
</head><body>
<header><a href="tel:+15125550100">(512) 555-0100</a><a class="btn" href="https://www.toasttab.com/bella">Order online</a><a href="/reserve">Book a table</a></header>
<h1>Handmade pasta in the heart of Austin</h1>
<p>${"Fresh pasta made every morning with local flour and eggs. ".repeat(20)}</p>
<section><h2>Menu</h2><ul><li>Margherita $14</li><li>Carbonara $18</li><li>Lasagna $19</li><li>Tiramisu $9</li><li>House salad $11</li></ul></section>
<section><h2>Hours</h2><p>Monday to Sunday 11am to 10pm</p><p>120 Main Street, Austin, TX 78701</p><a href="https://maps.app.goo.gl/abc">Directions</a></section>
<section><h2>What our customers say</h2><p>Best pasta in town — five stars.</p></section>
<form><input type="email" name="email"><textarea></textarea><button>Send</button></form>
<img src="a.jpg" alt="Pasta"><img src="b.jpg" alt="Pizza">
<footer><a href="https://instagram.com/bella">Instagram</a><a href="/privacy">Privacy policy</a> © 2026 Bella Cucina</footer>
</body></html>`;

const BAD = `<html><head><title>Home</title></head><body>
<h1>Welcome</h1><h1>Our company</h1>
<p>${"We do quality work for every customer and we care about doing a good job every time. ".repeat(12)}</p>
<p>Call 555 0100</p><img src="x.jpg"><img src="y.jpg"><img src="z.jpg">
<script src="/js/jquery-1.11.3.min.js"></script>
<footer>Copyright 2019 Acme</footer></body></html>`;

const baseCtx = (html, type, extra = {}) => ({ f: analyzeHtml(html, "https://site.example/"), type, psi: null, robots: robotsBlocks("", ["GPTBot"]), sitemapOk: true, llmsOk: false, finalUrl: "https://site.example/", httpRedirect: true, headers: {}, year: 2026, ...extra });
const byId = (rs, id) => rs.find((r) => r.id === id);

test("guard blocks private and odd addresses", () => {
  for (const bad of ["http://localhost", "http://127.0.0.1", "http://10.0.0.1", "http://192.168.1.1", "http://[::1]/", "ftp://x.com", "http://user:pw@x.com", "http://x.com:8080", "http://metadata.google.internal", "javascript:alert(1)", "http://169.254.169.254"]) {
    assert.throws(() => checkUrl(bad), (e) => e.code === "invalid_url", bad);
  }
  assert.equal(checkUrl("example.com"), "https://example.com/");
  assert.equal(checkUrl(" http://Example.com/menu#x "), "http://example.com/menu");
});

test("good restaurant passes the key checks", () => {
  const rs = runChecks(baseCtx(GOOD, "restaurant"));
  for (const id of ["click_to_call", "phone_visible", "contact_path", "cta", "location", "map", "hours", "reviews", "current", "social", "privacy", "title", "title_where", "meta_description", "h1", "schema", "share", "viewport", "https", "restaurant_menu_text", "restaurant_order", "restaurant_hours_address"]) {
    assert.equal(byId(rs, id)?.status, "pass", id);
  }
});

test("weak contractor site fails the right checks", () => {
  const rs = runChecks(baseCtx(BAD, "contractor"));
  for (const id of ["click_to_call", "viewport", "schema", "contractor_service_area", "contractor_estimate", "lang", "old_libs", "alt"]) {
    assert.equal(byId(rs, id)?.status, "fail", id);
  }
  assert.equal(byId(rs, "current").title, "Your site says © 2019");
  assert.equal(byId(rs, "h1").status, "partial");
  const s = score(rs, null);
  assert.ok(s.score <= 59, "critical failures cap the score");
  assert.equal(s.categories.speed.score, null);
});

test("thin JavaScript-only pages are not marked down", () => {
  const rs = runChecks(baseCtx(`<html lang="en"><head><meta name="viewport" content="width=device-width"><title>Shop</title></head><body><div id="root"></div></body></html>`, "salon"));
  assert.equal(byId(rs, "click_to_call").status, "unknown");
  assert.equal(byId(rs, "salon_booking").status, "unknown");
  assert.equal(byId(rs, "raw_text").status, "fail");
});

test("robots parser finds blocked AI crawlers", () => {
  const r = robotsBlocks("User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin\nSitemap: https://x.com/sitemap.xml", ["GPTBot", "ClaudeBot"]);
  assert.equal(r.GPTBot, true);
  assert.equal(r.ClaudeBot, false);
  assert.equal(r["*"], false);
  assert.equal(r.sitemapDeclared, true);
  assert.equal(robotsBlocks("User-agent: *\nDisallow: /", ["ClaudeBot"]).ClaudeBot, true);
});

test("PSI scores feed speed and accessibility", () => {
  const psi = { performance: 40, accessibility: 80, seo: 95, bestPractices: 90, field: { lcp: { ms: 4200, category: "SLOW" } }, a11yFailures: ["Low contrast"], speedFailures: ["Properly size images"] };
  const rs = runChecks(baseCtx(GOOD, "restaurant", { psi }));
  const s = score(rs, psi);
  assert.equal(s.categories.speed.score, 32);
  assert.equal(byId(rs, "perf").status, "fail");
  assert.equal(byId(rs, "perf").title, "Your site is slow on phones (40/100)");
  assert.match(byId(rs, "lh_a11y").detail, /Low contrast/);
  assert.ok(s.score > 60 && s.score < 100);
});

test("full scan works end to end with mocked network", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const u = String(input);
    if (u.startsWith("http://bella.example")) return new Response(null, { status: 301, headers: { location: "https://bella.example/" } });
    if (u === "https://bella.example/") return new Response(GOOD, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    if (u.endsWith("/robots.txt")) return new Response("User-agent: *\nAllow: /\nSitemap: https://bella.example/sitemap.xml", { status: 200 });
    if (u.endsWith("/sitemap.xml")) return new Response("<urlset></urlset>", { status: 200 });
    if (u.endsWith("/llms.txt")) return new Response("not found", { status: 404 });
    if (u.includes("pagespeedonline")) return new Response(JSON.stringify({ lighthouseResult: { categories: { performance: { score: 0.92 }, accessibility: { score: 0.95 }, seo: { score: 1 }, "best-practices": { score: 1 } }, audits: { "final-screenshot": { details: { data: "data:image/jpeg;base64,AAA" } } } }, loadingExperience: { metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 1800, category: "FAST" } } } }), { status: 200 });
    return new Response("", { status: 404 });
  };
  try {
    const r = await scan("http://bella.example", "restaurant", {});
    assert.equal(r.finalUrl, "https://bella.example/");
    assert.equal(r.psi.available, true);
    assert.ok(r.score >= 85, "good site scores high: " + r.score);
    assert.ok(["A", "B"].includes(r.grade));
    assert.ok(r.checks.every((c) => c.title && c.category && c.severity && c.status));
  } finally { globalThis.fetch = real; }
});

test("redirect to a private address is refused", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/admin" } });
  try { await assert.rejects(scan("https://evil.example", "general", {}), (e) => e.code === "invalid_url"); }
  finally { globalThis.fetch = real; }
});

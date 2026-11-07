// Builds the static site into /docs (GitHub Pages serves this folder).
// Run: npm run build
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import { minify } from "html-minifier-terser";
import { LANDINGS, HOME_FAQS } from "./content.mjs";
import { SITE, esc, ICONS, bizPhoto, BIZ_PHOTOS, head, header, footer, scanForm, ticks, phoneMock, cta, faqSection, faqSchema, breadcrumbSchema, crumbs, typesGrid, stepsRow, webAppSchema } from "./parts.mjs";
import { PAGES } from "./pages.mjs";
import { buildBlog } from "./blog.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "docs");
const TODAY = new Date().toISOString().slice(0, 10);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- Assets ----------
const cssRaw = fs.readFileSync(path.join(SRC, "assets/css/site.css"), "utf8").replace(/\.\.\/fonts\//g, "/assets/fonts/");
const css = (await esbuild.transform(cssRaw, { loader: "css", minify: true })).code.trim();

const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
copy(path.join(ROOT, "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2"), path.join(OUT, "assets/fonts/outfit-latin-wght-normal.woff2"));
copy(path.join(SRC, "assets/js/config.js"), path.join(OUT, "assets/js/config.js"));
for (const f of ["site.js", "report.js"]) {
  const js = fs.readFileSync(path.join(SRC, "assets/js", f), "utf8");
  const out = (await esbuild.transform(js, { loader: "js", minify: true, target: "es2017" })).code;
  fs.writeFileSync(path.join(OUT, "assets/js", f), out);
}
await esbuild.build({ entryPoints: [path.join(ROOT, "worker/src/engine.js")], bundle: true, minify: true, format: "iife", globalName: "PPEngine", target: "es2018", outfile: path.join(OUT, "assets/js/engine.js"), logLevel: "warning" });
for (const f of fs.readdirSync(path.join(SRC, "static"))) copy(path.join(SRC, "static", f), path.join(OUT, f));
fs.cpSync(path.join(SRC, "assets/img"), path.join(OUT, "assets/img"), { recursive: true });

// ---------- Page shell ----------
const sitemap = [];
async function page(p, { title, description, body, schema = [], noindex = false, scripts = [], bodyClass = "", priority = "0.7", ogImage, ogType, extraHead, lastmod }) {
  const html = `<!doctype html>
<html lang="en">
${head({ title, description, path: p, noindex, schema, css, preloadFont: true, ogImage, ogType, extraHead })}
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
${header(p)}
${body}
${footer()}
<script src="/assets/js/config.js" defer></script>
<script src="/assets/js/site.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join("")}
</body>
</html>`;
  const min = await minify(html, { collapseWhitespace: true, conservativeCollapse: false, removeComments: true, removeRedundantAttributes: true, useShortDoctype: true, minifyCSS: false, keepClosingSlash: false, sortAttributes: false });
  const file = p === "/404.html" ? path.join(OUT, "404.html") : path.join(OUT, p, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, min);
  if (!noindex) sitemap.push({ loc: SITE.url + p, priority, lastmod });
}

// ---------- Home ----------
const homeBody = `<main id="main">
<div class="wrap">
<section class="hero" id="check" aria-labelledby="hero-title">
<div class="hero-main">
<div class="card hero-card reveal">
<span class="eyebrow" style="align-self:flex-start"><span class="dot"></span>Free website health check for local businesses</span>
<h1 id="hero-title">Is your website winning <span class="mark">customers?</span></h1>
<p class="lead">See your site the way customers and Google do. Get a score in about 30 seconds and a plain-English fix list for everything costing you calls and bookings.</p>
${scanForm({ id: "hero" })}
${ticks()}
</div>
<div class="stats">
<div class="stat stat-dark reveal reveal-d1"><b>35+</b><span>checks per site</span></div>
<div class="stat stat-peach reveal reveal-d2"><b>30s</b><span>to your report</span></div>
<div class="stat stat-lime reveal reveal-d3"><b>$0</b><span>to check, always</span></div>
</div>
</div>
${phoneMock()}
</section>
</div>

<section class="section-lg" id="features" aria-labelledby="features-title">
<div class="wrap">
<div class="sec-head reveal"><h2 id="features-title">Everything customers and Google notice</h2><p>About 35 checks in seven areas, weighted by what really costs you business.</p></div>
<div class="grid-flex">
<div class="card card-lav lift reveal" style="flex:1.3 1 380px;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:18px;min-height:280px">
<span class="icon-tile">${ICONS.phone}</span>
<div><h3>More calls and bookings</h3><p style="color:var(--lav-ink)">The things that decide whether a visitor contacts you — or your competitor.</p>
<div class="chips"><span class="chip">Tap-to-call</span><span class="chip">Hours</span><span class="chip">Book now</span><span class="chip">Reviews</span><span class="chip">Map</span></div></div>
</div>
<div class="card reveal reveal-d1" style="flex:1 1 340px;min-width:0" data-animate>
<h3>Seven scores, one grade</h3>
<div class="bars" role="img" aria-label="Sample category scores: Customers 62, Google 84, Speed 45, Accessibility 78, Mobile 96">
<div class="bar-row"><span>Customers</span><span class="bar-track"><span class="bar-fill" style="background:var(--lav)" data-w="62"></span></span><b>62</b></div>
<div class="bar-row"><span>Google</span><span class="bar-track"><span class="bar-fill" style="background:var(--lime)" data-w="84"></span></span><b>84</b></div>
<div class="bar-row"><span>Speed</span><span class="bar-track"><span class="bar-fill" style="background:#ff9f7a" data-w="45"></span></span><b>45</b></div>
<div class="bar-row"><span>Accessibility</span><span class="bar-track"><span class="bar-fill" style="background:var(--lav)" data-w="78"></span></span><b>78</b></div>
<div class="bar-row"><span>Mobile</span><span class="bar-track"><span class="bar-fill" style="background:var(--lime)" data-w="96"></span></span><b>96</b></div>
</div>
</div>
<div class="card card-dark reveal reveal-d2" style="flex:1 1 340px;min-width:0">
<h3>Fix list, not jargon</h3>
<div class="issue"><span class="tag tag-bad">FIX FIRST</span>No tap-to-call on phones</div>
<div class="issue"><span class="tag tag-warn">QUICK WIN</span>Your site says © 2019</div>
<div class="issue"><span class="tag tag-good">GOOD</span>Reviews shown on homepage</div>
</div>
<div class="card card-peach lift reveal" style="flex:1 1 280px;min-width:0"><span class="icon-tile">${ICONS.bolt}</span><h3 style="margin-top:16px">Fast on every phone</h3><p style="color:var(--peach-ink)">A real mobile speed test from Google's PageSpeed data, with the files slowing you down.</p></div>
<div class="card lift reveal reveal-d1" style="flex:1 1 280px;min-width:0"><span class="icon-tile" style="background:var(--bg)">${ICONS.search}</span><h3 style="margin-top:16px">Found on Google and AI</h3><p class="muted">Titles, local business details, and whether ChatGPT-style search tools can read you.</p></div>
<div class="card card-sky lift reveal reveal-d2" style="flex:1 1 280px;min-width:0"><span class="icon-tile">${ICONS.person}</span><h3 style="margin-top:16px">Usable by everyone</h3><p style="color:var(--sky-ink)">Contrast, labels and image descriptions, so no customer gets stuck.</p></div>
</div>
</div>
</section>

<section class="section" id="types" aria-labelledby="types-title">
<div class="wrap">
<div class="card reveal">
<div class="sec-head" style="padding:0"><h2 id="types-title" class="h2">Checks made for your business</h2><p>Pick your type and get extra checks for what your customers care about.</p></div>
${typesGrid()}
<div class="chips" style="margin-top:20px"><span class="muted" style="align-self:center;margin-right:6px;font-size:15px">Focused tools:</span>
<a class="chip btn-ghost" style="text-decoration:none" href="/mobile-friendly-test/">Mobile friendly test</a>
<a class="chip btn-ghost" style="text-decoration:none" href="/website-accessibility-checker/">Accessibility checker</a>
<a class="chip btn-ghost" style="text-decoration:none" href="/ai-ready-website-checker/">AI-ready check</a></div>
</div>
</div>
</section>

<section class="section" id="how" aria-labelledby="how-title">
<div class="wrap">
<h2 class="sr-only" id="how-title">How it works</h2>
${stepsRow()}
</div>
</section>

<section class="section" aria-labelledby="why-title">
<div class="wrap">
<div class="card reveal" style="display:flex;flex-wrap:wrap;gap:32px">
<div style="flex:1 1 320px;min-width:0"><h2 id="why-title" class="h2">A website health check built for local businesses</h2></div>
<div style="flex:1.4 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px" class="muted">
<p>Most free website graders are built for marketers. They score keyword density and backlinks, then hand you a 40-page report. Local businesses need something simpler: can customers find you, trust you, and call or book in a few taps?</p>
<p>PagePulsar checks exactly that. It loads your homepage like a customer would, runs Google's mobile speed test, and looks for the details people need — phone, hours, location, booking, reviews — plus the basics Google and AI search tools rely on. You get one score, a grade, and a short list of fixes ordered by impact.</p>
<p>It works for any small business website, with extra checks for <a href="/restaurant-website-checker/">restaurants</a>, <a href="/dental-website-checker/">dentists</a>, <a href="/salon-website-checker/">salons and spas</a>, <a href="/contractor-website-checker/">contractors</a> and <a href="/auto-repair-website-checker/">auto repair shops</a>.</p>
</div>
</div>
</div>
</section>

${cta()}
${faqSection(HOME_FAQS)}
</main>`;

await page("/", {
  title: "Free Website Checker & Health Check for Small Business",
  description: "Free website checker for local businesses. A 30-second website health check: mobile speed, Google basics, accessibility and what brings in calls.",
  body: homeBody,
  priority: "1.0",
  schema: [
    { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: SITE.url + "/assets/img/icon-512.png", email: SITE.email, founder: { "@type": "Person", name: SITE.owner }, sameAs: [SITE.fiverr] },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url },
    webAppSchema("PagePulsar Website Checker", "/", "Free website health check for local businesses: speed, mobile, Google, accessibility and customer essentials."),
    faqSchema(HOME_FAQS)
  ]
});

// ---------- Landing pages ----------
for (const l of LANDINGS) {
  const p = `/${l.slug}/`;
  const parent = l.feature ? ["Free tools", "/#types"] : ["Businesses", "/#types"];
  const crumbItems = [["Home", "/"], parent, [l.nav, p]];
  const others = LANDINGS.filter((o) => o.slug !== l.slug && o.feature === l.feature);
  const colorVar = { sun: "var(--sun)", sky: "var(--sky)", rose: "var(--rose)", mint: "var(--mint)", violet: "var(--violet)", peach: "var(--peach)", lime: "var(--lime)" }[l.color];
  const body = `<main id="main">
<div class="wrap">
<section class="hero" id="check" aria-labelledby="hero-title">
<div class="hero-main">
<div class="card hero-card reveal">
${crumbs(crumbItems)}
<h1 id="hero-title">${esc(l.h1)}</h1>
<p class="lead">${esc(l.lead)}</p>
${scanForm({ id: "hero", type: l.type, focus: l.focus || "" })}
${ticks()}
</div>
</div>
<div class="card reveal reveal-d2" style="flex:2 1 360px;min-width:0;background:${colorVar};box-shadow:none;display:flex;flex-direction:column;gap:18px">
${l.feature ? "" : bizPhoto(l.type, { cls: "side-photo", sizes: "(max-width: 900px) 92vw, 460px", lazy: false, alt: BIZ_PHOTOS[l.type] })}
<span class="icon-tile${l.feature ? "" : " icon-tile-over"}">${ICONS[l.focus === "mobile" ? "mobile" : l.focus === "accessibility" ? "person" : l.focus === "ai" ? "spark" : l.type]}</span>
<h2 style="font-size:28px">What we check${l.feature ? "" : ` for ${esc(l.nav.toLowerCase())}`}</h2>
<ul class="ticks" style="flex-direction:column;gap:12px;font-size:17px;color:var(--ink)">${l.quick.map((q) => `<li>${ICONS.check}${esc(q)}</li>`).join("")}</ul>
<p style="font-size:15px">Plus every standard check: speed, mobile, Google basics, accessibility and security.</p>
</div>
</section>
</div>

<section class="section-lg" aria-labelledby="list-title">
<div class="wrap">
<div class="card reveal">
<h2 id="list-title" class="h2">${esc(l.checklistTitle)}</h2>
<p class="muted" style="margin:12px 0 20px;max-width:640px">${esc(l.checklistIntro)}</p>
<ol class="checklist">
${l.checklist.map(([t, d]) => `<li>${ICONS.check}<div><b>${esc(t)}</b><span>${esc(d)}</span></div></li>`).join("\n")}
</ol>
</div>
</div>
</section>

<section class="section" aria-labelledby="mistakes-title">
<div class="wrap">
<div class="sec-head reveal"><h2 id="mistakes-title">Common mistakes we see</h2><p>Each one quietly sends customers to a competitor.</p></div>
<div class="grid-flex">
${l.mistakes.map(([t, d], i) => `<div class="card ${["card-dark", "card-lav", "card-peach", ""][i % 4]} lift reveal reveal-d${i % 3}" style="flex:1 1 260px;min-width:0"><h3>${esc(t)}</h3><p${i === 0 ? ' class="muted"' : ""}>${esc(d)}</p></div>`).join("\n")}
</div>
</div>
</section>

<section class="section" aria-labelledby="how-title">
<div class="wrap">
<h2 class="sr-only" id="how-title">How it works</h2>
${stepsRow()}
</div>
</section>

${cta()}
${faqSection(l.faqs)}

<section class="section" aria-labelledby="more-title">
<div class="wrap">
<div class="card reveal">
<h2 id="more-title" style="font-size:24px">${l.feature ? "More free tools" : "Checkers for other businesses"}</h2>
<div class="chips">${others.map((o) => `<a class="chip btn-ghost" style="text-decoration:none" href="/${o.slug}/">${esc(o.h1)}</a>`).join("")}<a class="chip btn-ghost" style="text-decoration:none" href="/">Free website checker</a></div>
</div>
</div>
</section>
</main>`;
  await page(p, {
    title: l.title,
    description: l.description,
    body,
    priority: "0.9",
    schema: [webAppSchema(l.h1.replace(/^Free /, "").replace(/^./, (c) => c.toUpperCase()), p, l.description), faqSchema(l.faqs), breadcrumbSchema(crumbItems)]
  });
}

// ---------- Other pages ----------
for (const pg of PAGES) {
  await page(pg.path, { ...pg, body: pg.body({ esc, ICONS, SITE, crumbs, scanForm, cta, ticks }), schema: pg.schema ? pg.schema({ SITE, breadcrumbSchema }) : [] });
}

// ---------- Blog ----------
await buildBlog({ page, OUT, parts: { SITE, esc, ICONS, crumbs, scanForm, cta, breadcrumbSchema } });

// ---------- SEO files ----------
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((s) => `  <url><loc>${s.loc}</loc><lastmod>${s.lastmod || TODAY}</lastmod><priority>${s.priority}</priority></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *
Allow: /
Disallow: /report/

Sitemap: ${SITE.url}/sitemap.xml
`);
fs.writeFileSync(path.join(OUT, "CNAME"), "pagepulsar.online\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`Built ${sitemap.length} indexed pages + report + 404 into /docs`);

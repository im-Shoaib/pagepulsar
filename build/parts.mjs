// Shared HTML pieces: icons, head, header, footer, scan form, phone mockup, CTA, FAQ.
import { TYPES, LANDINGS } from "./content.mjs";

export const SITE = {
  name: "PagePulsar",
  url: "https://pagepulsar.online",
  email: "contact@pagepulsar.online",
  whatsapp: "923070098919",
  fiverr: "https://www.fiverr.com/s/P44E56L",
  owner: "Shoaib Ahmad"
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const P = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
export const ICONS = {
  check: `<svg viewBox="0 0 24 24" ${P} stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>`,
  x: `<svg viewBox="0 0 24 24" ${P} stroke-width="2.8"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" ${P} stroke-width="2.8"><path d="M12 7v6M12 17h.01"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
  person: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></svg>`,
  mobile: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.9"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" ${P} stroke-width="2.2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" ${P} stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>`,
  restaurant: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 6h3v12"/></svg>`,
  dentist: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7 .4 2 .8 6.5 2.5 6.5s1.5-5 3-5 1.3 5 3 5 2.1-4.5 2.5-6.5c.5-2.5 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>`,
  salon: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>`,
  contractor: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>`,
  auto: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><path d="M3 17v-4l2-5h14l2 5v4z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>`,
  general: `<svg viewBox="0 0 24 24" ${P} stroke-width="1.8"><path d="M3 10l2-6h14l2 6"/><path d="M4 10v10h16V10"/><path d="M9 20v-6h6v6"/></svg>`
};

export const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#111114"/><path d="M5 17h5l3-7 4 13 3-8 2 2h5" fill="none" stroke="#C8F169" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function head({ title, description, path, noindex = false, schema = [], ogImage = "/assets/img/og-default.png", css, preloadFont }) {
  const url = SITE.url + path;
  const ld = schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("");
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#F2F2F5">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.url}${ogImage}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${preloadFont ? `<link rel="preload" href="/assets/fonts/outfit-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>` : ""}
<style>${css}</style>
${ld}
</head>`;
}

export function header(path) {
  const links = [
    ["/#features", "Features"],
    ["/#types", "Businesses"],
    ["/how-scoring-works/", "How it works"],
    ["/about/", "About"],
    ["/contact/", "Contact"]
  ];
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap">
<nav class="nav" aria-label="Main">
<a class="brand" href="/" aria-label="PagePulsar home">${BRAND_MARK}<span>PagePulsar</span></a>
<ul class="nav-links" id="nav-links">
${links.map(([h, t]) => `<li><a href="${h}"${h === path ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}
</ul>
<div class="nav-cta">
<a class="btn btn-dark" href="/#check">Check my site</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">${ICONS.menu}</button>
</div>
</nav>
</div>
</header>`;
}

export function footer() {
  const biz = LANDINGS.filter((l) => !l.feature);
  const feat = LANDINGS.filter((l) => l.feature);
  return `<footer class="site-footer">
<div class="wrap">
<div class="card foot">
<div class="foot-brand">
<a class="brand" href="/">${BRAND_MARK}<span>PagePulsar</span></a>
<p>Free website checkups for local businesses in the US, UK, Canada and Australia.</p>
<p>Automated check — not legal advice or an accessibility certification.</p>
</div>
<nav aria-label="Business checkers"><b>For your business</b>${biz.map((l) => `<a href="/${l.slug}/">${esc(l.nav)}</a>`).join("")}</nav>
<nav aria-label="Free tools"><b>Free tools</b><a href="/">Website checker</a>${feat.map((l) => `<a href="/${l.slug}/">${esc(l.footer)}</a>`).join("")}</nav>
<nav aria-label="Company"><b>Company</b><a href="/about/">About</a><a href="/how-scoring-works/">How scoring works</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
<div class="foot-base"><span>© <span data-year>2026</span> PagePulsar</span><a href="mailto:${SITE.email}">${SITE.email}</a></div>
</div>
</div>
</footer>
<div class="consent" role="dialog" aria-live="polite" aria-label="Cookie choice" hidden>
<p>We'd like to use Google Analytics cookies to see which pages help people. No ads, no selling data. <a href="/privacy/">Privacy</a></p>
<div><button class="btn btn-dark" type="button" data-consent="yes">Accept</button><button class="btn btn-ghost" type="button" data-consent="no">No thanks</button></div>
</div>`;
}

export function scanForm({ id = "scan", type = "general", focus = "", button = "Check it →" } = {}) {
  return `<form class="scan-form" data-scan${focus ? ` data-focus="${focus}"` : ""} novalidate>
<div class="field"><label for="${id}-url">Website</label><input id="${id}-url" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="yourbusiness.com" required></div>
<div class="field field-sm"><label for="${id}-type">Business</label><select id="${id}-type" name="type">${TYPES.map((t) => `<option value="${t.key}"${t.key === type ? " selected" : ""}>${esc(t.label)}</option>`).join("")}</select></div>
<button class="btn btn-dark" type="submit">${button}</button>
<p class="form-error" role="alert"></p>
</form>`;
}

export function ticks(items = ["Free forever", "No signup", "Plain-English report"]) {
  return `<ul class="ticks">${items.map((t) => `<li>${ICONS.check}${esc(t)}</li>`).join("")}</ul>`;
}

export function phoneMock() {
  return `<div class="phone-card reveal reveal-d2">
<div class="phone-head"><span>Your report, on your phone</span><span>Sample</span></div>
<div class="phone" role="img" aria-label="Phone showing a sample report for Glow Spa: score 74, grade C, with two issues and one pass">
<div class="phone-screen">
<div class="notch"></div>
<div class="ph-top">Your report <span>glowspa.com</span></div>
<div class="ph-score" data-animate><div><small>Score</small><b>74</b><small>Grade C · Good start</small></div>
<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="track" cx="32" cy="32" r="25"/><circle class="bar" cx="32" cy="32" r="25" data-ring="74"/></svg></div>
<div class="ph-row"><span class="ph-ico ico-bad">${ICONS.x}</span><div><b>No "Book now" button</b><br><small>Fix first</small></div></div>
<div class="ph-row"><span class="ph-ico ico-warn">${ICONS.alert}</span><div><b>Prices not listed</b><br><small>Quick win</small></div></div>
<div class="ph-row"><span class="ph-ico ico-good">${ICONS.check}</span><div><b>Fast on phones</b><br><small>Great</small></div></div>
</div>
</div>
<div class="float" style="left:16px;bottom:120px" aria-hidden="true"><span class="ph-ico ico-good">${ICONS.check}</span>Report ready</div>
<div class="float float-dark" style="right:16px;top:300px" aria-hidden="true">Fix list included</div>
</div>`;
}

export function cta({ title = "Got issues? <em>Fixed from $50.</em>", text = "I fix sites like yours or build a new one. One tap sends me a message on WhatsApp — you'll get a clear quote, no pressure." } = {}) {
  return `<section class="section" id="fix" aria-labelledby="cta-title">
<div class="wrap">
<div class="cta card-dark reveal">
<div class="cta-text">
<div class="person"><span class="avatar" aria-hidden="true">SA</span><span><b>Shoaib Ahmad</b><br><span class="muted">Web developer behind PagePulsar</span></span></div>
<h2 id="cta-title">${title}</h2>
<p>${text}</p>
<a class="btn btn-lime" href="https://wa.me/${SITE.whatsapp}" data-wa="Hi Shoaib, I found PagePulsar and I'd like help with my website." data-pos="cta">${ICONS.wa}Chat on WhatsApp</a>
</div>
<div class="chat" role="img" aria-label="Example WhatsApp conversation about fixing a website">
<div class="chat-head"><span class="avatar" style="width:34px;height:34px;font-size:12px" aria-hidden="true">SA</span><span><b>Shoaib</b><br><small>usually replies within a day</small></span></div>
<div class="bubble bubble-me">Hi Shoaib, I checked glowspa.com. Score: 74/100 (3 issues). Can you help fix it?</div>
<div class="bubble bubble-them">Sure! I'll look at your report and tell you exactly what it takes and what it costs.</div>
</div>
</div>
</div>
</section>`;
}

export function faqSection(faqs, title = "Questions") {
  return `<section class="section" id="faq" aria-labelledby="faq-title">
<div class="wrap grid-flex">
<div style="flex:1 1 300px;min-width:0;padding:24px 8px">
<h2 class="h2" id="faq-title">${title}</h2>
<p class="muted" style="margin-top:10px">Still unsure? Email <a href="mailto:${SITE.email}">${SITE.email}</a> or message on WhatsApp.</p>
</div>
<div class="faq">
${faqs.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
</div>
</div>
</section>`;
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }))
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.url + path }))
  };
}

export function crumbs(items) {
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${items.map(([n, p], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${p}">${esc(n)}</a></li>`)).join("")}</ol></nav>`;
}

export function typesGrid() {
  const biz = LANDINGS.filter((l) => !l.feature);
  const blurbs = { restaurant: "Menu, ordering, hours", dentist: "Booking, insurance", salon: "Book now, prices", contractor: "Service area, estimates", auto: "Services, appointments" };
  return `<div class="types">${biz.map((l) => `<a class="type type-${l.color}" href="/${l.slug}/">${ICONS[l.type]}<b>${esc(l.nav)}</b><span>${blurbs[l.type]}</span></a>`).join("")}</div>`;
}

export function stepsRow() {
  return `<div class="grid-flex">
<div class="card step lift reveal"><span class="step-num">1</span><h3>Paste your link</h3><p class="muted">Pick your business type. That's it — no signup.</p></div>
<div class="card step lift reveal reveal-d1"><span class="step-num">2</span><h3>We scan it live</h3><p class="muted">About 35 checks in around 30 seconds, using the same speed data Google uses.</p></div>
<div class="card card-lime step reveal reveal-d2"><span class="step-num">3</span><h3>Fix and grow</h3><p style="color:var(--lime-ink)">Biggest problems first, in plain English. Fix them yourself or get help.</p></div>
</div>`;
}

export function webAppSchema(name, path, description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: SITE.url + path,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url }
  };
}

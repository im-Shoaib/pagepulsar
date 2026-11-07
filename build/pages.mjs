// Report, trust and legal pages.
const UPDATED = "November 5, 2026";

export const PAGES = [
  {
    path: "/report/",
    title: "Your Website Report | PagePulsar",
    description: "Your PagePulsar website checkup report: score, grade and a plain-English fix list.",
    noindex: true,
    bodyClass: "has-sticky",
    scripts: ["/assets/js/engine.js", "/assets/js/report.js"],
    body: ({ ICONS, SITE }) => `<main id="main">
<div class="wrap">
<section id="r-progress" class="progress" aria-live="polite">
<span class="eyebrow"><span class="dot"></span>Checking <span id="r-domain">your website</span></span>
<h1 style="margin-top:18px">Running your checkup…</h1>
<p class="lead" style="margin:14px auto 0">This takes about 30 seconds. The mobile speed test is the slow part.</p>
<ol class="progress-steps">
<li data-step="0"><i></i>Loading your homepage</li>
<li data-step="1"><i></i>Checking mobile and speed</li>
<li data-step="2"><i></i>Checking what customers need</li>
<li data-step="3"><i></i>Building your report</li>
</ol>
</section>

<section id="r-error" class="progress" hidden aria-live="assertive">
<h1 id="r-error-title">We couldn't check that website</h1>
<p class="lead" id="r-error-text" style="margin:14px auto 0"></p>
<div class="chips" style="justify-content:center;margin-top:24px">
<a class="btn btn-dark" href="/#check">Try another address</a>
<a class="btn btn-lime" href="https://wa.me/${SITE.whatsapp}" data-wa="Hi Shoaib, PagePulsar couldn't check my website. Can you take a look?" data-pos="error">${ICONS.wa}Ask Shoaib to check by hand</a>
</div>
</section>

<div id="r-result" hidden></div>
</div>
</main>
<a class="btn btn-lime sticky-cta no-print" id="r-sticky" href="https://wa.me/${SITE.whatsapp}" data-pos="sticky" hidden>${ICONS.wa}Fix these issues — from $50</a>`
  },
  {
    path: "/how-scoring-works/",
    title: "How Scoring Works — Website Audit Checklist | PagePulsar",
    description: "How PagePulsar scores websites: the full website audit checklist, category weights, severity levels, grades and the limits of automated checks.",
    priority: "0.6",
    schema: ({ breadcrumbSchema }) => [breadcrumbSchema([["Home", "/"], ["How scoring works", "/how-scoring-works/"]])],
    body: ({ crumbs }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px">
${crumbs([["Home", "/"], ["How scoring works", "/how-scoring-works/"]])}
<h1>How your score is worked out</h1>
<p class="lead">One number from 0 to 100, built from about 35 checks in seven areas. Here's exactly what we check and how much each part counts.</p>
</section>
<section class="section"><div class="card prose" style="max-width:none"><div class="prose">
<h2>The seven areas and their weights</h2>
<div class="table-box"><table>
<thead><tr><th>Area</th><th>Weight</th><th>What it covers</th></tr></thead>
<tbody>
<tr><td>Customers</td><td>35%</td><td>Tap-to-call, visible phone, contact form, call to action, location, map, opening hours, reviews, looking current, social links, privacy policy, plus your business-type checks</td></tr>
<tr><td>Google</td><td>20%</td><td>Page title, title mentions what and where, meta description, one main heading, not hidden from Google, local business structured data, sitemap and robots.txt, share preview, Lighthouse SEO score</td></tr>
<tr><td>Speed</td><td>15%</td><td>Google PageSpeed mobile performance score (80%) and real-user speed data when Google has it (20%)</td></tr>
<tr><td>Accessibility</td><td>15%</td><td>Lighthouse accessibility score (70%) plus image descriptions and page language (30%)</td></tr>
<tr><td>Mobile and basics</td><td>10%</td><td>Site loads, HTTPS, mobile viewport</td></tr>
<tr><td>Security</td><td>3%</td><td>No mixed content, no very old libraries</td></tr>
<tr><td>AI search</td><td>2%</td><td>AI crawlers allowed in robots.txt, text readable without JavaScript, llms.txt (information only)</td></tr>
</tbody></table></div>
<h2>Severity and points</h2>
<p>Each check has a severity. A failed check loses its points; a partial pass keeps half.</p>
<div class="table-box"><table>
<thead><tr><th>Severity</th><th>Points</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Critical</td><td>10</td><td>No tap-to-call link, no HTTPS, hidden from Google</td></tr>
<tr><td>High</td><td>6</td><td>No contact form, no online booking for a dentist or salon</td></tr>
<tr><td>Medium</td><td>3</td><td>Missing opening hours, footer says © 2019</td></tr>
<tr><td>Low</td><td>1</td><td>No share preview image, no map link</td></tr>
<tr><td>Info</td><td>0</td><td>llms.txt — shown for interest, never scored</td></tr>
</tbody></table></div>
<p>Any critical failure caps your overall score at 59, because a critical problem costs customers no matter how good the rest is.</p>
<h2>Grades</h2>
<ul><li><b>A (90–100):</b> great</li><li><b>B (75–89):</b> good</li><li><b>C (60–74):</b> needs work</li><li><b>D (40–59):</b> losing customers</li><li><b>F (0–39):</b> urgent fixes needed</li></ul>
<h2>"Couldn't verify" is never held against you</h2>
<p>Some site builders load text with JavaScript after the page opens. When we can't read enough text in your page's HTML, text-based checks show "couldn't verify" and are removed from the score instead of counted as failures.</p>
<h2>What automated checks can't do</h2>
<p>PagePulsar reads your public homepage only. It doesn't log in, submit forms, test keyboard navigation fully, or judge how good your writing and photos are. It's not legal advice, and it can't certify ADA, WCAG or any other compliance. Use it as a fast, honest first look.</p>
<h2>Where the data comes from</h2>
<p>Speed, accessibility and SEO scores come from Google's PageSpeed Insights (Lighthouse), run on a simulated mobile device. Everything else comes from reading your homepage's HTML, robots.txt and sitemap the way a search engine would.</p>
</div></div></section>
</div>
</main>`
  },
  {
    path: "/about/",
    title: "About PagePulsar — Free Website Checkups for Local Businesses",
    description: "PagePulsar is a free website checker for local businesses, built by independent web developer Shoaib Ahmad. Honest reports, plain English, fixes from $50.",
    priority: "0.5",
    schema: ({ SITE, breadcrumbSchema }) => [
      { "@context": "https://schema.org", "@type": "AboutPage", name: "About PagePulsar", url: SITE.url + "/about/", mainEntity: { "@type": "Person", name: SITE.owner, jobTitle: "Web developer", image: SITE.url + "/assets/img/shoaib-ahmad.webp", url: SITE.url + "/about/", sameAs: [SITE.fiverr] } },
      breadcrumbSchema([["Home", "/"], ["About", "/about/"]])
    ],
    body: ({ crumbs, SITE, ICONS }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px">
${crumbs([["Home", "/"], ["About", "/about/"]])}
<h1>Honest website checkups for the businesses that keep towns running</h1>
<p class="lead">PagePulsar gives restaurants, dentists, salons, contractors and repair shops a clear, free answer to one question: is my website helping or hurting?</p>
</section>
<section class="section grid-flex">
<div class="card prose" style="flex:2 1 520px;min-width:0">
<h2 style="margin-top:0">Why PagePulsar exists</h2>
<p>Most website reports are written for marketers. Local business owners get a long PDF full of terms like "canonical tags" and "render-blocking resources", and no idea what to do first.</p>
<p>PagePulsar takes a different view. A local business website has a few simple jobs: show up on Google, look trustworthy, load fast on a phone, and make it easy to call, book or visit. So that's what we check, in plain English, with the most important fixes first.</p>
<h2>Who's behind it</h2>
<p>PagePulsar is built and run by ${SITE.owner}, an independent web developer who has spent about three years building and fixing websites for clients around the world through <a href="${SITE.fiverr}" rel="noopener">Fiverr</a>. The checker is free. If you'd like help fixing what it finds, you can message Shoaib directly — fixes start from $50.</p>
<h2>Our promises</h2>
<ul><li>The checkup is free, with no signup.</li><li>We only read your public homepage — never logins or private data.</li><li>We say what we can't check, instead of pretending.</li><li>No pushy sales calls. You message us if you want help.</li></ul>
</div>
<div class="card card-dark" style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:14px;align-self:flex-start">
<img class="portrait" src="/assets/img/shoaib-ahmad.webp" width="480" height="600" alt="Shoaib Ahmad, web developer and founder of PagePulsar" decoding="async">
<h2 style="font-size:28px">${SITE.owner}</h2>
<p class="muted">Web developer · HTML, CSS, JavaScript, PHP, Laravel</p>
<a class="btn btn-lime" href="https://wa.me/${SITE.whatsapp}" data-wa="Hi Shoaib, I'd like help with my website." data-pos="about">${ICONS.wa}Chat on WhatsApp</a>
<a class="btn btn-white" href="mailto:${SITE.email}">Email ${SITE.email}</a>
</div>
</section>
</div>
</main>`
  },
  {
    path: "/contact/",
    title: "Contact PagePulsar — Get Help Fixing Your Website",
    description: "Contact PagePulsar by WhatsApp or email. Send your website report and get a clear quote for fixes, starting from $50.",
    priority: "0.5",
    schema: ({ SITE, breadcrumbSchema }) => [
      { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact PagePulsar", url: SITE.url + "/contact/" },
      breadcrumbSchema([["Home", "/"], ["Contact", "/contact/"]])
    ],
    body: ({ crumbs, SITE, ICONS }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px">
${crumbs([["Home", "/"], ["Contact", "/contact/"]])}
<h1>Let's fix your website</h1>
<p class="lead">Send your PagePulsar report or just your website address. You'll get a clear quote — fixes start from $50 — and an honest answer if your site doesn't need work.</p>
</section>
<section class="section grid-flex">
<a class="card card-lime lift" href="https://wa.me/${SITE.whatsapp}" data-wa="Hi Shoaib, I'd like help with my website." data-pos="contact" style="flex:1 1 320px;min-width:0;text-decoration:none;display:flex;flex-direction:column;gap:12px">
<span class="icon-tile">${ICONS.wa}</span><h2 style="font-size:30px">WhatsApp</h2><p style="color:var(--lime-ink)">Fastest way to reach Shoaib. Usually replies within a day.</p><b>+92 307 0098919</b></a>
<a class="card card-lav lift" href="mailto:${SITE.email}" style="flex:1 1 320px;min-width:0;text-decoration:none;display:flex;flex-direction:column;gap:12px">
<span class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span><h2 style="font-size:30px">Email</h2><p style="color:var(--lav-ink)">Good for longer questions or sending files.</p><b>${SITE.email}</b></a>
<div class="card" style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:12px">
<h2 style="font-size:30px">What to send</h2>
<ul class="ticks" style="flex-direction:column;gap:10px;font-size:16px;color:var(--ink)"><li>${ICONS.check}Your website address</li><li>${ICONS.check}Your PagePulsar report link, if you ran one</li><li>${ICONS.check}What you'd like to improve most</li></ul>
<p class="muted" style="font-size:15px">Shoaib works with clients worldwide and replies in English.</p>
</div>
</section>
</div>
</main>`
  },
  {
    path: "/privacy/",
    title: "Privacy Policy | PagePulsar",
    description: "How PagePulsar handles data: what we read when we check a website, what we store, analytics cookies and your choices.",
    priority: "0.3",
    body: ({ crumbs, SITE }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px">${crumbs([["Home", "/"], ["Privacy", "/privacy/"]])}<h1>Privacy policy</h1><p class="lead">Last updated ${UPDATED}. Short version: we check public websites, keep almost nothing, and never sell data.</p></section>
<section class="section"><div class="card"><div class="prose">
<h2 style="margin-top:0">Who we are</h2>
<p>PagePulsar (pagepulsar.online) is run by ${SITE.owner}. Contact: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>What happens when you run a checkup</h2>
<p>When you enter a website address, our scanner loads that website's public homepage, robots.txt, sitemap.xml and llms.txt, and sends the address to Google PageSpeed Insights to measure speed and accessibility. We don't log in to any website or submit any forms.</p>
<h2>What we store</h2>
<ul><li><b>Scan results:</b> kept in a short-term cache for up to 24 hours so repeat checks are fast.</li><li><b>Basic logs:</b> the domain checked, business type, score and time, used to keep the service running and improve it.</li><li><b>Rate limiting:</b> a temporary count per IP address to stop abuse, deleted automatically within a day.</li></ul>
<p>We don't ask for your name or email to run a checkup.</p>
<h2>Cookies and analytics</h2>
<p>If you accept, we use Google Analytics to understand which pages are useful. It sets cookies and is provided by Google. If you choose "No thanks", analytics doesn't load. We remember your choice in your browser's local storage. We don't use advertising cookies.</p>
<h2>When you contact us</h2>
<p>If you message us on WhatsApp or by email, we use your details only to reply and, if you hire us, to do the work. WhatsApp's own privacy policy applies to messages sent there.</p>
<h2>Sharing</h2>
<p>We don't sell or rent personal data. We use these services to run the site: GitHub Pages (hosting), Cloudflare (scanner), Google PageSpeed Insights (speed tests) and, with consent, Google Analytics.</p>
<h2>Your rights</h2>
<p>Depending on where you live (for example the UK, EU, California, Canada or Australia), you may have the right to access, correct or delete data about you, or to object to how it's used. Email <a href="mailto:${SITE.email}">${SITE.email}</a> and we'll respond within 30 days.</p>
<h2>Website owners</h2>
<p>If you own a website someone checked with PagePulsar and want its cached result removed, email us with the domain.</p>
<h2>Changes</h2>
<p>We'll update this page if anything changes and change the date at the top.</p>
</div></div></section>
</div>
</main>`
  },
  {
    path: "/terms/",
    title: "Terms of Use | PagePulsar",
    description: "Terms for using the PagePulsar free website checker and related services.",
    priority: "0.3",
    body: ({ crumbs, SITE }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px">${crumbs([["Home", "/"], ["Terms", "/terms/"]])}<h1>Terms of use</h1><p class="lead">Last updated ${UPDATED}.</p></section>
<section class="section"><div class="card"><div class="prose">
<h2 style="margin-top:0">Using the checker</h2>
<p>PagePulsar is a free tool for checking public websites. Please only check websites you own or have a legitimate reason to review, and don't use the tool to overload, attack or scrape any website. We may limit or block use that looks automated or abusive.</p>
<h2>Reports are automated</h2>
<p>Reports are generated automatically and may contain mistakes. They are general information, not professional, legal or compliance advice. A report can't certify accessibility, ADA, WCAG, privacy or security compliance. You're responsible for decisions you make based on a report.</p>
<h2>Third-party data</h2>
<p>Some results come from third parties such as Google PageSpeed Insights. We don't control their availability or accuracy.</p>
<h2>Paid help</h2>
<p>If you hire ${SITE.owner} to fix or build a website, the scope, price and timing are agreed separately before work starts.</p>
<h2>No warranty</h2>
<p>The service is provided "as is", without warranties of any kind. To the extent the law allows, PagePulsar isn't liable for indirect or consequential losses from using the service.</p>
<h2>Changes and contact</h2>
<p>We may update these terms and will change the date above when we do. Questions: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</div></div></section>
</div>
</main>`
  },
  {
    path: "/404.html",
    title: "Page Not Found | PagePulsar",
    description: "This page doesn't exist. Run a free website checkup instead.",
    noindex: true,
    body: ({ scanForm }) => `<main id="main">
<div class="wrap">
<section class="card page-hero" style="margin-top:16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px">
<span class="mark" style="font-size:72px;font-weight:800;letter-spacing:-0.05em;padding:0 18px">404</span>
<h1>This page took the day off</h1>
<p class="lead">The page you're looking for doesn't exist. While you're here, check how your own website is doing.</p>
<div style="width:100%;max-width:720px">${scanForm({ id: "nf" })}</div>
<a href="/" class="btn btn-ghost">Back to home</a>
</section>
</div>
</main>`
  }
];

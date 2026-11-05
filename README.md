# PagePulsar — pagepulsar.online

Free website checker for local businesses. Static site (GitHub Pages) + a tiny Cloudflare Worker that fetches pages. Everything runs on free plans.

```
docs/      ← the finished website. GitHub Pages serves this folder. Don't edit by hand except docs/assets/js/config.js
src/       ← CSS, JS, images, static files (source)
build/     ← page templates and content (build.mjs, content.mjs, pages.mjs, parts.mjs)
worker/    ← Cloudflare Worker (fetcher) + the shared report engine + tests
notes/     ← keyword research
```

## How a scan works

1. Visitor enters a URL → `/report/?url=…&type=…`
2. The browser asks the Worker (`POST /fetch`) for the page HTML, robots.txt, sitemap and llms.txt. The Worker blocks private addresses, follows redirects safely, rate-limits (10/hour, 40/day per IP) and caches for 24 hours.
3. At the same time the browser calls Google PageSpeed Insights (mobile).
4. The browser builds the report with the shared engine (`worker/src/engine.js`, bundled to `docs/assets/js/engine.js`). Doing the heavy work in the browser keeps the Worker inside Cloudflare's free-plan CPU limit.

With no Worker configured, the report page shows a clearly labelled demo report.

## Go live — step by step

### 1. Put the site on GitHub Pages
1. Create a new GitHub repo, e.g. `pagepulsar`, and upload this whole folder (the `.gitignore` skips `node_modules`).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`, folder **/docs** → Save.
3. Custom domain: `pagepulsar.online` (the `docs/CNAME` file already says this). Tick **Enforce HTTPS** once it's available.

### 2. Point the domain (Hostinger → DNS)
- `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www` → `im-Shoaib.github.io`
- **Don't touch the MX / email records** — they keep contact@pagepulsar.online working.

### 3. Deploy the Worker (free Cloudflare account)
```bash
cd worker
npx wrangler login
npx wrangler deploy
```
It prints a URL like `https://pagepulsar-api.<you>.workers.dev`. Check `https://…workers.dev/health` says `ok`.

### 4. Get a PageSpeed Insights API key (free)
Google Cloud Console → new project → **APIs & Services → Library → PageSpeed Insights API → Enable** → **Credentials → Create API key**.
Restrict it: **Application restrictions → Websites** → `https://pagepulsar.online/*` and `https://www.pagepulsar.online/*`; **API restrictions → PageSpeed Insights API**.
(It works without a key too, but the shared quota runs out fast.)

### 5. Fill in settings
Edit `docs/assets/js/config.js` (and `src/assets/js/config.js` so rebuilds keep it):
```js
apiUrl: "https://pagepulsar-api.<you>.workers.dev",
psiKey: "<your PageSpeed key>",
gaId: "G-XXXXXXX",          // optional — Google Analytics 4
whatsapp: "923070098919"
```
Commit and push. Done — run a real scan on the live site.

### 6. Search engines and analytics
- Google Search Console → add `pagepulsar.online` → submit `https://pagepulsar.online/sitemap.xml`.
- Bing Webmaster Tools → import from Search Console.
- GA4 (optional): mark the `cta_whatsapp_click` event as a key event. Other events: `scan_start`, `scan_complete`, `scan_error`, `report_print`, `report_share`. Analytics only loads after the visitor clicks Accept on the cookie banner.

## Editing the site
```bash
npm install
npm run build   # rebuilds docs/
npm test        # scanner tests
```
- Business-type and tool pages: `build/content.mjs`
- Homepage: `build/build.mjs` · Other pages: `build/pages.mjs` · Header/footer/forms: `build/parts.mjs`
- Styles: `src/assets/css/site.css` (inlined into every page at build time)
- Checks, wording and severities: `worker/src/checks.js` · Scoring: `worker/src/score.js`
- After changing anything in `worker/src/`, run `npm run build` (browser engine) **and** `npx wrangler deploy` in `worker/` if `index.js`, `fetchers.js` or `guard.js` changed.

## Limits on the free plans
- Cloudflare Workers free: 100,000 requests/day. Rate limits and cache are per Cloudflare data centre.
- PageSpeed Insights with a key: 25,000 queries/day.
- The Worker reads at most 1 MB of HTML per page.

## Quality checks done before handover
- Lighthouse (mobile run, local server): Performance 99–100, Accessibility 100, Best Practices 100, SEO 100 on the homepage, a business page and About.
- 8 scanner tests pass (SSRF guard, checks, scoring, robots parsing, end-to-end with mocked network).
- All internal links resolve; all JSON-LD parses; no horizontal scroll at 390px.

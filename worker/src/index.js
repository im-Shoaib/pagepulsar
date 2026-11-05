// PagePulsar fetcher — Cloudflare Worker (free plan friendly: network only, almost no CPU).
// POST /fetch { url, fresh } → { finalUrl, html, headers, robotsText, sitemapOk, llmsOk, httpRedirect, fetchedAt }
// GET /health → "ok"
// The report itself is built in the visitor's browser by the shared engine (src/engine.js).
import { checkUrl } from "./guard.js";
import { fetchPage, fetchSmall, httpRedirectsToHttps } from "./fetchers.js";

const HOUR_LIMIT = 10;
const DAY_LIMIT = 40;
const CACHE_TTL = 86400;

const FRIENDLY = {
  invalid_url: "That doesn't look like a website address. Enter your homepage, like yourbusiness.com.",
  unreachable: "We couldn't reach this website. Check the address — if your site is down, that's problem number one.",
  blocked: "Your site blocked our automated check (often a security setting). Message us and we'll check it by hand.",
  timeout: "Your site took more than 10 seconds to respond — customers won't wait that long either.",
  not_html: "That link isn't a web page. Enter your homepage address.",
  rate_limited: "You've run a lot of checks. Please try again in an hour.",
  server: "Something went wrong on our side. Please try again in a minute."
};
const STATUS = { invalid_url: 400, not_html: 422, unreachable: 422, blocked: 422, timeout: 504, rate_limited: 429, server: 500 };

function allowedOrigin(req, env) {
  const origin = req.headers.get("Origin") || "";
  const list = String(env.ALLOWED_ORIGINS || "https://pagepulsar.online,https://www.pagepulsar.online").split(",").map((s) => s.trim());
  if (list.includes(origin)) return origin;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return list[0];
}
function json(req, env, body, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": allowedOrigin(req, env),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
const fail = (req, env, code, message) => json(req, env, { error: code, message: message || FRIENDLY[code] || FRIENDLY.server }, STATUS[code] || 500);

// Per-IP limits using the Cache API (free, per data centre — enough to stop casual abuse).
async function rateLimit(ip) {
  const cache = caches.default;
  const now = Date.now();
  const keys = [[`https://rl.pagepulsar.internal/h/${ip}/${Math.floor(now / 3600000)}`, HOUR_LIMIT, 3600], [`https://rl.pagepulsar.internal/d/${ip}/${Math.floor(now / 86400000)}`, DAY_LIMIT, 86400]];
  const counts = [];
  for (const [k, limit] of keys) {
    const hit = await cache.match(k);
    const n = hit ? Number(await hit.text()) || 0 : 0;
    if (n >= limit) return false;
    counts.push(n);
  }
  await Promise.all(keys.map(([k, , ttl], i) => cache.put(k, new Response(String(counts[i] + 1), { headers: { "Cache-Control": `max-age=${ttl}` } }))));
  return true;
}

export async function fetchBundle(url) {
  const page = await fetchPage(url);
  const origin = new URL(page.finalUrl).origin;
  const [robots, sitemap, llms, httpRedirect] = await Promise.all([
    fetchSmall(origin + "/robots.txt"),
    fetchSmall(origin + "/sitemap.xml"),
    fetchSmall(origin + "/llms.txt"),
    httpRedirectsToHttps(page.finalUrl)
  ]);
  let sitemapOk = sitemap.ok && /<(urlset|sitemapindex)\b/i.test(sitemap.text);
  if (!sitemapOk && !/^\s*sitemap\s*:/im.test(robots.text || "")) {
    const idx = await fetchSmall(origin + "/sitemap_index.xml");
    sitemapOk = idx.ok && /<(urlset|sitemapindex)\b/i.test(idx.text);
  }
  return {
    url,
    finalUrl: page.finalUrl,
    status: page.status,
    html: page.html,
    headers: { "x-robots-tag": page.headers["x-robots-tag"] || "" },
    robotsText: robots.ok ? robots.text.slice(0, 50000) : "",
    sitemapOk,
    llmsOk: llms.ok && !/<html/i.test(llms.text.slice(0, 500)) && llms.text.trim().length > 20,
    httpRedirect,
    fetchedAt: new Date().toISOString()
  };
}

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (req.method === "OPTIONS") return json(req, env, null, 204);
    if (u.pathname === "/health") return new Response("ok");
    if (u.pathname !== "/fetch" || req.method !== "POST") return fail(req, env, "invalid_url", "Not found.");

    let body;
    try { body = await req.json(); } catch { return fail(req, env, "invalid_url"); }
    let url;
    try { url = checkUrl(body.url); } catch { return fail(req, env, "invalid_url"); }

    const cache = caches.default;
    const key = new Request(`https://cache.pagepulsar.internal/fetch?u=${encodeURIComponent(url)}`);
    const cached = await cache.match(key);
    if (cached) {
      const data = await cached.json();
      const ageMs = Date.now() - Date.parse(data.fetchedAt);
      if (!body.fresh || ageMs < 3600000) return json(req, env, { ...data, cached: true });
    }

    const ip = req.headers.get("CF-Connecting-IP") || "unknown";
    if (!(await rateLimit(ip))) return fail(req, env, "rate_limited");

    try {
      const bundle = await fetchBundle(url);
      ctx.waitUntil(cache.put(key, new Response(JSON.stringify(bundle), { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${CACHE_TTL}` } })));
      console.log(JSON.stringify({ event: "fetch", domain: new URL(bundle.finalUrl).hostname }));
      return json(req, env, bundle);
    } catch (e) {
      const code = e && e.code ? e.code : "server";
      if (code === "server") console.log(JSON.stringify({ event: "error", message: String(e && e.message) }));
      return fail(req, env, code, e && e.code && e.message !== e.code ? e.message : undefined);
    }
  }
};

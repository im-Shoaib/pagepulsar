// Network helpers: safe page fetch with manual redirects, small file fetches, PageSpeed Insights.
import { checkUrl, codeError } from "./guard.js";

const UA = "Mozilla/5.0 (compatible; PagePulsarBot/1.0; +https://pagepulsar.online/about/)";
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 5;

async function readCapped(res, max = MAX_BYTES) {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    chunks.push(value);
    if (size >= max) { try { await reader.cancel(); } catch {} break; }
  }
  const buf = new Uint8Array(Math.min(size, max));
  let off = 0;
  for (const c of chunks) { const take = Math.min(c.byteLength, buf.length - off); buf.set(c.subarray(0, take), off); off += take; if (off >= buf.length) break; }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

function withTimeout(ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

// Fetches the homepage, following up to 5 redirects and re-checking every hop.
export async function fetchPage(startUrl, timeoutMs = 10000) {
  let url = checkUrl(startUrl);
  const redirects = [];
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const t = withTimeout(timeoutMs);
    let res;
    try {
      res = await fetch(url, { method: "GET", redirect: "manual", signal: t.signal, headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "Accept-Language": "en-US,en;q=0.8" } });
    } catch (e) {
      t.done();
      throw codeError(e && e.name === "AbortError" ? "timeout" : "unreachable");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      t.done();
      const next = new URL(res.headers.get("location"), url).toString();
      redirects.push(next);
      url = checkUrl(next);
      continue;
    }
    if (res.status === 403 || res.status === 429 || res.status === 503) { t.done(); throw codeError("blocked"); }
    if (res.status >= 400) { t.done(); throw codeError("unreachable", `The website answered with error ${res.status}.`); }
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type && !type.includes("html") && !type.includes("xml")) { t.done(); throw codeError("not_html"); }
    const html = await readCapped(res);
    t.done();
    if (/cf-browser-verification|challenge-platform|__cf_chl_|Attention Required! \| Cloudflare|captcha-delivery\.com/i.test(html.slice(0, 20000))) throw codeError("blocked");
    return { finalUrl: url, status: res.status, html, headers: Object.fromEntries(res.headers), redirects, startedHttp: startUrl.startsWith("http://") };
  }
  throw codeError("unreachable", "Too many redirects.");
}

// Small text files: robots.txt, sitemap.xml, llms.txt. Never throws.
export async function fetchSmall(url, timeoutMs = 6000) {
  const t = withTimeout(timeoutMs);
  try {
    checkUrl(url);
    const res = await fetch(url, { redirect: "follow", signal: t.signal, headers: { "User-Agent": UA } });
    if (!res.ok) return { ok: false, status: res.status, text: "" };
    const text = await readCapped(res, 200_000);
    const type = (res.headers.get("content-type") || "").toLowerCase();
    return { ok: true, status: res.status, text, type };
  } catch {
    return { ok: false, status: 0, text: "" };
  } finally { t.done(); }
}

// Does http:// redirect to https://? Never throws.
export async function httpRedirectsToHttps(finalUrl, timeoutMs = 6000) {
  const u = new URL(finalUrl);
  if (u.protocol !== "https:") return false;
  u.protocol = "http:";
  const t = withTimeout(timeoutMs);
  try {
    const res = await fetch(u.toString(), { redirect: "manual", signal: t.signal, headers: { "User-Agent": UA } });
    const loc = res.headers.get("location") || "";
    return res.status >= 300 && res.status < 400 && loc.startsWith("https://");
  } catch { return null; } finally { t.done(); }
}


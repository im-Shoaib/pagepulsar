// Renders blog cover images from POSTS: node build/make-cover.mjs [slug]
// Output: src/assets/img/blog/<slug>-1200.webp, -800.webp and -og.jpg
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { POSTS } from "./posts/index.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/assets/img/blog");
fs.mkdirSync(OUT, { recursive: true });
const font = fs.readFileSync(path.join(ROOT, "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2")).toString("base64");

const star = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="#f5b400" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4L1.5 9.6 9 8.9z"/></svg>`;
const stars = (n) => `<span class="stars">${star.repeat(n)}</span>`;

const html = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:Outfit,sans-serif;background:#b9b4ff;color:#111114;overflow:hidden;position:relative}
.blob{position:absolute;border-radius:50%;filter:blur(2px)}
.b1{width:520px;height:520px;background:#c8f169;right:-140px;bottom:-220px;opacity:.9}
.b2{width:260px;height:260px;background:#ffd9c7;left:-90px;top:-110px}
.left{position:absolute;left:56px;top:56px;width:560px;height:518px;background:#fff;border-radius:40px;padding:48px 46px;display:flex;flex-direction:column;box-shadow:0 30px 60px rgba(38,35,92,.18)}
.tag{align-self:flex-start;background:#c8f169;color:#2e3a10;font-weight:600;font-size:20px;padding:9px 16px;border-radius:12px}
h1{font-size:62px;line-height:1.02;letter-spacing:-.045em;font-weight:800;margin-top:28px}
h1 span{display:block}
.brand{margin-top:auto;display:flex;align-items:center;gap:12px;font-weight:700;font-size:24px}
.right{position:absolute;right:56px;top:56px;width:470px;height:518px;background:#fff;border-radius:40px;padding:26px;box-shadow:0 30px 60px rgba(38,35,92,.18);display:flex;flex-direction:column;gap:14px}
.search{display:flex;align-items:center;gap:12px;height:56px;border-radius:999px;background:#f2f2f5;padding:0 20px;font-size:21px;color:#55555e}
.map{height:150px;border-radius:22px;background:#e6f2e2;position:relative;overflow:hidden}
.map i{position:absolute;background:#fff;opacity:.9}
.pin{position:absolute;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#e5484d;box-shadow:0 4px 8px rgba(0,0,0,.2)}
.pin::after{content:"";position:absolute;inset:8px;border-radius:50%;background:#fff}
.row{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:18px;background:#f7f7f9}
.thumb{width:46px;height:46px;border-radius:12px;background:#d6d6de;flex:none}
.lines{flex:1;display:flex;flex-direction:column;gap:7px}
.l{height:11px;border-radius:6px;background:#d6d6de}
.stars{display:flex;gap:2px}
.missing{border:3px dashed #e5484d;background:#fff5f5;justify-content:center;color:#c62828;font-weight:700;font-size:22px;gap:10px;height:72px}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div>
<div class="left">
<span class="tag">${p.category}</span>
<h1>${p.coverLines.map((l) => `<span>${l}</span>`).join("")}</h1>
<div class="brand"><svg width="40" height="40" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#111114"/><path d="M5 17h5l3-7 4 13 3-8 2 2h5" fill="none" stroke="#C8F169" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>PagePulsar guide</div>
</div>
<div class="right">
<div class="search"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#55555e" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>plumber near me</div>
<div class="map">
<i style="left:0;right:0;top:58px;height:10px"></i><i style="left:0;right:0;top:112px;height:7px"></i>
<i style="top:0;bottom:0;left:120px;width:10px"></i><i style="top:0;bottom:0;left:300px;width:8px"></i>
<span class="pin" style="left:80px;top:28px"></span><span class="pin" style="left:230px;top:80px"></span><span class="pin" style="left:350px;top:36px"></span>
</div>
<div class="row"><span class="thumb"></span><span class="lines"><span class="l" style="width:70%"></span>${stars(5)}<span class="l" style="width:45%"></span></span></div>
<div class="row"><span class="thumb"></span><span class="lines"><span class="l" style="width:58%"></span>${stars(4)}<span class="l" style="width:52%"></span></span></div>
<div class="row missing"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c62828" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.6M12 17h.01"/></svg>Your business?</div>
</div>
</body></html>`;

const only = process.argv[2];
const browser = await chromium.launch();
const pageB = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of POSTS.filter((x) => !only || x.slug === only)) {
  await pageB.setContent(html(p), { waitUntil: "load" });
  await pageB.evaluate(() => document.fonts.ready);
  const png = path.join(OUT, `${p.slug}.png`);
  await pageB.screenshot({ path: png });
  console.log("rendered", png);
}
await browser.close();

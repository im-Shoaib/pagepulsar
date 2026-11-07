// Blog: index page, article pages, RSS feed. Articles are Markdown files in build/posts/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { POSTS } from "./posts/index.mjs";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "posts");

const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, "").replace(/&#?[a-z0-9]+;/gi, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function render(md) {
  const toc = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) toc.push({ id, text });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href) && !href.startsWith("https://pagepulsar.online");
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${ext ? ' rel="noopener" target="_blank"' : ""}>${text}</a>`;
      },
      table(token) {
        // Wrap tables so they scroll on small screens.
        const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join("");
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`).join("");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      }
    }
  });
  const html = marked.parse(md);
  const words = md.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return { html, toc, minutes: Math.max(1, Math.round(words / 230)) };
}

export async function buildBlog({ page, OUT, parts }) {
  const { SITE, esc, ICONS, crumbs, scanForm, cta, breadcrumbSchema } = parts;
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const author = { "@type": "Person", name: SITE.owner, url: SITE.url + "/about/", image: SITE.url + "/assets/img/shoaib-ahmad.webp", jobTitle: "Web developer" };
  const publisher = { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: SITE.url + "/assets/img/icon-512.png" } };
  const feedLink = `<link rel="alternate" type="application/rss+xml" title="PagePulsar Blog" href="/blog/feed.xml">`;

  const byline = (p, minutes) => `<div class="byline">
<img class="avatar" src="/assets/img/shoaib-avatar.webp" width="40" height="40" alt="" loading="lazy" decoding="async">
<span><a href="/about/" rel="author">${esc(SITE.owner)}</a><br><small>Updated <time datetime="${p.updated || p.date}">${fmtDate(p.updated || p.date)}</time> · ${minutes} min read</small></span>
</div>`;

  const cover = (p, { eager = false, sizes = "(max-width: 900px) 92vw, 760px" } = {}) =>
    `<img class="post-cover" src="/assets/img/blog/${p.slug}-800.webp" srcset="/assets/img/blog/${p.slug}-800.webp 800w, /assets/img/blog/${p.slug}-1200.webp 1200w" sizes="${sizes}" width="1200" height="630" alt="${esc(p.coverAlt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

  const rendered = Object.fromEntries(posts.map((p) => [p.slug, render(fs.readFileSync(path.join(DIR, p.file), "utf8"))]));

  // ---------- Article pages ----------
  for (const p of posts) {
    const { html, toc, minutes } = rendered[p.slug];
    const url = `/blog/${p.slug}/`;
    const items = [["Home", "/"], ["Blog", "/blog/"], [p.short || p.title, url]];
    const inline = `<aside class="post-cta" aria-label="Check your website">
<p class="post-cta-kicker">Free check · 30 seconds</p>
<p class="post-cta-title">See what Google and your customers see on your homepage.</p>
${scanForm({ id: "inline" })}
</aside>`;
    const body = html.replace(/<p>\[\[scan\]\]<\/p>/g, inline);
    const related = (p.related || []).map((r) => `<a class="chip btn-ghost" href="${r[1]}">${esc(r[0])}</a>`).join("");
    const tocHtml = `<ol>${toc.map((t) => `<li><a href="#${t.id}">${t.text}</a></li>`).join("")}</ol>`;
    const page_ = `<main id="main">
<div class="wrap">
<article class="post" itemscope itemtype="https://schema.org/BlogPosting">
<header class="card post-head reveal">
${crumbs(items)}
<span class="chip post-tag">${esc(p.category)}</span>
<h1 itemprop="headline">${esc(p.title)}</h1>
<p class="lead">${esc(p.dek)}</p>
${byline(p, minutes)}
</header>
<div class="post-grid">
<div class="card post-body">
${cover(p, { eager: true })}
<details class="toc toc-mobile"><summary>In this article</summary>${tocHtml}</details>
<div class="prose post-prose" itemprop="articleBody">
${body}
</div>
<div class="author-box">
<img src="/assets/img/shoaib-avatar.webp" width="64" height="64" alt="" loading="lazy" decoding="async">
<div><p class="author-name">Written by <a href="/about/">${esc(SITE.owner)}</a></p>
<p>Shoaib is a web developer who has spent about three years building and fixing websites for small businesses. He built PagePulsar so owners can see what's wrong with their site in plain English.</p></div>
</div>
${related ? `<nav class="post-related" aria-label="Related tools"><p>Related free checkers</p><div class="chips">${related}</div></nav>` : ""}
</div>
<aside class="post-side" aria-label="On this page">
<div class="card toc toc-side"><p class="toc-title">In this article</p>${tocHtml}</div>
<div class="card card-dark side-cta">
<p class="side-cta-title">Is your website helping or hurting?</p>
<p>Get a free score and a plain-English fix list in about 30 seconds.</p>
<a class="btn btn-lime" href="/#check">Check my site free</a>
</div>
</aside>
</div>
</article>
</div>
${cta()}
</main>`;
    await page(url, {
      title: p.seoTitle,
      description: p.description,
      body: page_,
      priority: "0.8",
      ogImage: `/assets/img/blog/${p.slug}-og.jpg`,
      ogType: "article",
      lastmod: p.updated || p.date,
      extraHead: `${feedLink}<meta property="article:published_time" content="${p.date}T09:00:00+00:00"><meta property="article:modified_time" content="${p.updated || p.date}T09:00:00+00:00"><meta property="article:author" content="${SITE.url}/about/">`,
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          image: [`${SITE.url}/assets/img/blog/${p.slug}-og.jpg`],
          datePublished: `${p.date}T09:00:00+00:00`,
          dateModified: `${p.updated || p.date}T09:00:00+00:00`,
          author,
          publisher,
          mainEntityOfPage: { "@type": "WebPage", "@id": SITE.url + url },
          wordCount: html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
          inLanguage: "en"
        },
        breadcrumbSchema(items)
      ]
    });
  }

  // ---------- Blog index ----------
  const [lead, ...rest] = posts;
  const card = (p) => `<a class="card post-card lift reveal" href="/blog/${p.slug}/">
${cover(p, { sizes: "(max-width: 900px) 92vw, 400px" })}
<span class="post-tag-sm">${esc(p.category)}</span>
<h3>${esc(p.title)}</h3>
<p>${esc(p.dek)}</p>
<small>${fmtDate(p.updated || p.date)} · ${rendered[p.slug].minutes} min read</small>
</a>`;
  const index = `<main id="main">
<div class="wrap">
<section class="card page-hero blog-hero reveal" aria-labelledby="blog-title">
${crumbs([["Home", "/"], ["Blog", "/blog/"]])}
<h1 id="blog-title">Website advice for local businesses</h1>
<p class="lead">Plain-English guides on getting found on Google, winning more calls and bookings, and fixing the website problems that cost you customers. No jargon, no fluff.</p>
</section>
${lead ? `<section class="section" aria-label="Latest article">
<a class="card post-feature lift reveal" href="/blog/${lead.slug}/">
${cover(lead, { eager: true, sizes: "(max-width: 900px) 92vw, 620px" })}
<div class="post-feature-text">
<span class="post-tag-sm">Latest · ${esc(lead.category)}</span>
<h2>${esc(lead.title)}</h2>
<p>${esc(lead.dek)}</p>
<small>${esc(SITE.owner)} · ${fmtDate(lead.updated || lead.date)} · ${rendered[lead.slug].minutes} min read</small>
<span class="btn btn-dark">Read the guide →</span>
</div>
</a>
</section>` : ""}
${rest.length ? `<section class="section" aria-label="More articles"><div class="post-list">${rest.map(card).join("")}</div></section>` : ""}
<section class="section" aria-labelledby="blog-check">
<div class="card card-lime blog-check reveal">
<div><h2 id="blog-check">Want answers for your own site?</h2><p>Run a free checkup and get a score with the fixes that matter most.</p></div>
${scanForm({ id: "blog" })}
</div>
</section>
</div>
</main>`;
  await page("/blog/", {
    title: "Blog: Website Tips for Local Businesses | PagePulsar",
    description: "Plain-English guides for small business owners: getting found on Google, fixing slow or broken websites, and turning visitors into calls and bookings.",
    body: index,
    priority: "0.8",
    lastmod: lead ? lead.updated || lead.date : undefined,
    extraHead: feedLink,
    schema: [
      { "@context": "https://schema.org", "@type": "Blog", name: "PagePulsar Blog", url: SITE.url + "/blog/", publisher, blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE.url}/blog/${p.slug}/`, datePublished: p.date, author: { "@type": "Person", name: SITE.owner } })) },
      breadcrumbSchema([["Home", "/"], ["Blog", "/blog/"]])
    ]
  });

  // ---------- RSS ----------
  const x = (s) => esc(s).replace(/'/g, "&apos;");
  fs.writeFileSync(path.join(OUT, "blog/feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>PagePulsar Blog</title>
<link>${SITE.url}/blog/</link>
<atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>Website advice for local businesses.</description>
<language>en</language>
${posts.map((p) => `<item><title>${x(p.title)}</title><link>${SITE.url}/blog/${p.slug}/</link><guid>${SITE.url}/blog/${p.slug}/</guid><pubDate>${new Date(p.date + "T09:00:00Z").toUTCString()}</pubDate><description>${x(p.description)}</description></item>`).join("\n")}
</channel>
</rss>
`);
}

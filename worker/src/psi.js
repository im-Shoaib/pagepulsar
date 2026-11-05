// PageSpeed Insights helpers shared by the browser engine and tests (no network code here).

const A11Y_AUDITS = ["color-contrast", "image-alt", "label", "link-name", "button-name", "html-has-lang", "heading-order", "document-title", "list", "listitem", "frame-title", "input-image-alt", "select-name", "meta-viewport", "aria-allowed-attr", "aria-required-attr", "duplicate-id-aria", "tabindex"];
const OTHER_AUDITS = ["final-screenshot", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "uses-optimized-images", "modern-image-formats", "render-blocking-resources", "unused-javascript", "uses-responsive-images", "total-byte-weight"];

// Google PageSpeed Insights (mobile) request URL. Uses a partial response to keep the payload small.
export function psiUrl(url, key, withFields = true) {
  const q = new URLSearchParams({ url, strategy: "mobile" });
  for (const c of ["performance", "accessibility", "seo", "best-practices"]) q.append("category", c);
  if (key) q.set("key", key);
  if (withFields) q.set("fields", `loadingExperience(metrics,overall_category),lighthouseResult(categories(performance(score),accessibility(score),seo(score),best-practices(score)),audits(${A11Y_AUDITS.concat(OTHER_AUDITS).join(",")}))`);
  return "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" + q.toString();
}

export function extractPsi(d) {
  if (!d || !d.lighthouseResult) return null;
  const lh = d.lighthouseResult || {};
  const cat = lh.categories || {};
  const audits = lh.audits || {};
  const pct = (c) => (c && typeof c.score === "number" ? Math.round(c.score * 100) : null);
  const failed = (ids) => ids.filter((id) => audits[id] && typeof audits[id].score === "number" && audits[id].score < 0.9).map((id) => audits[id].title);
  const m = (d.loadingExperience && d.loadingExperience.metrics) || {};
  const field = {};
  if (m.LARGEST_CONTENTFUL_PAINT_MS) field.lcp = { ms: m.LARGEST_CONTENTFUL_PAINT_MS.percentile, category: m.LARGEST_CONTENTFUL_PAINT_MS.category };
  if (m.INTERACTION_TO_NEXT_PAINT) field.inp = { ms: m.INTERACTION_TO_NEXT_PAINT.percentile, category: m.INTERACTION_TO_NEXT_PAINT.category };
  if (m.CUMULATIVE_LAYOUT_SHIFT_SCORE) field.cls = { value: m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100, category: m.CUMULATIVE_LAYOUT_SHIFT_SCORE.category };
  const shot = audits["final-screenshot"] && audits["final-screenshot"].details && audits["final-screenshot"].details.data;
  return {
    available: true,
    performance: pct(cat.performance),
    accessibility: pct(cat.accessibility),
    seo: pct(cat.seo),
    bestPractices: pct(cat["best-practices"]),
    lcpLabMs: audits["largest-contentful-paint"] ? Math.round(audits["largest-contentful-paint"].numericValue || 0) : null,
    a11yFailures: failed(A11Y_AUDITS).slice(0, 5),
    speedFailures: failed(["uses-optimized-images", "modern-image-formats", "render-blocking-resources", "unused-javascript", "uses-responsive-images", "total-byte-weight"]).slice(0, 4),
    field: Object.keys(field).length ? field : null,
    screenshot: typeof shot === "string" && shot.length < 300000 ? shot : null
  };
}

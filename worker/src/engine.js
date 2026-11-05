// The report engine: turns fetched page data + PageSpeed data into a scored report.
// Runs in the visitor's browser (bundled into /assets/js/engine.js) so the Worker stays within the free CPU limit.
import { analyzeHtml, robotsBlocks } from "./analyze.js";
import { runChecks, score } from "./score.js";
import { AI_BOTS } from "./checks.js";
import { extractPsi, psiUrl } from "./psi.js";

export { psiUrl };

// input: { url, type, page: <Worker /fetch response>, psiRaw: <PageSpeed JSON or null> }
export function buildReport({ url, type, page, psiRaw }) {
  const psi = extractPsi(psiRaw);
  const f = analyzeHtml(page.html, page.finalUrl);
  const robots = robotsBlocks(page.robotsText || "", AI_BOTS);
  const ctx = {
    f,
    type,
    psi,
    robots,
    sitemapOk: !!page.sitemapOk || robots.sitemapDeclared,
    llmsOk: !!page.llmsOk,
    finalUrl: page.finalUrl,
    httpRedirect: page.httpRedirect,
    headers: page.headers || {},
    year: new Date().getUTCFullYear()
  };
  const checks = runChecks(ctx);
  const s = score(checks, psi);
  return {
    url,
    finalUrl: page.finalUrl,
    type,
    scannedAt: page.fetchedAt || new Date().toISOString(),
    cached: !!page.cached,
    ...s,
    checks: checks.map(({ display, ...rest }) => rest),
    psi: psi ? { available: true, performance: psi.performance, accessibility: psi.accessibility, seo: psi.seo, bestPractices: psi.bestPractices, screenshot: psi.screenshot, field: psi.field } : { available: false },
    page: { title: f.title, rawTextWords: f.words }
  };
}

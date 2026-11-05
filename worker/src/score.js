// Runs the checks and turns results into category scores, an overall score and a grade.
import { CHECKS, TYPE_CHECKS } from "./checks.js";

export const POINTS = { critical: 10, high: 6, medium: 3, low: 1, info: 0 };
export const WEIGHTS = { customers: 35, google: 20, speed: 15, accessibility: 15, mobile: 10, security: 3, ai: 2 };

export function runChecks(ctx) {
  const thin = ctx.f.words < 150;
  const defs = CHECKS.concat((TYPE_CHECKS[ctx.type] || []).map((d) => ({ ...d, id: `${ctx.type}_${d.id}`, category: "customers" })));
  const out = [];
  for (const d of defs) {
    let status;
    try { status = d.evaluate(ctx); } catch { status = "unknown"; }
    if (status === "skip") continue;
    if (thin && d.textBased && status === "fail") status = "unknown";
    let severity = d.severity;
    if (d.severityByType && d.severityByType[ctx.type]) severity = d.severityByType[ctx.type];
    if (d.severityIfForm && ctx.f.contactForm) severity = d.severityIfForm;
    let title = d.title;
    if (status === "partial" && d.partialTitle) title = d.partialTitle;
    else if (d.dynamicTitle && status !== "unknown") { try { title = d.dynamicTitle(ctx); } catch {} }
    let detail = "";
    if (d.dynamicDetail && status !== "unknown" && status !== "pass") { try { detail = d.dynamicDetail(ctx) || ""; } catch {} }
    out.push({ id: d.id, category: d.category, severity, status, title, passTitle: d.passTitle, why: d.why, fix: d.fix, detail, display: !!d.display });
  }
  return out;
}

const pointsFor = (r) => (r.status === "pass" ? 1 : r.status === "partial" ? 0.5 : 0);

function pointScore(results) {
  let earned = 0, possible = 0;
  for (const r of results) {
    if (r.status === "unknown") continue;
    const p = POINTS[r.severity] || 0;
    possible += p;
    earned += p * pointsFor(r);
  }
  return possible ? Math.round((earned / possible) * 100) : null;
}

export function score(results, psi) {
  const by = (cat) => results.filter((r) => r.category === cat && !r.display);
  const cats = {};

  cats.customers = pointScore(by("customers"));
  cats.google = pointScore(by("google"));
  cats.mobile = pointScore(by("mobile"));
  cats.security = pointScore(by("security"));
  cats.ai = pointScore(by("ai"));

  // Speed: PSI lab score 80% + real-user LCP 20% when present.
  if (psi && psi.performance != null) {
    const lcp = psi.field && psi.field.lcp;
    const fieldScore = lcp ? { FAST: 100, AVERAGE: 50, SLOW: 0 }[lcp.category] : null;
    cats.speed = fieldScore == null ? psi.performance : Math.round(psi.performance * 0.8 + fieldScore * 0.2);
  } else cats.speed = null;

  // Accessibility: Lighthouse 70% + own checks 30%.
  const ownA11y = pointScore(by("accessibility"));
  if (psi && psi.accessibility != null) cats.accessibility = ownA11y == null ? psi.accessibility : Math.round(psi.accessibility * 0.7 + ownA11y * 0.3);
  else cats.accessibility = ownA11y;

  let total = 0, weight = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    if (cats[k] == null) continue;
    total += cats[k] * w;
    weight += w;
  }
  const raw = weight ? Math.round(total / weight) : 0;
  const criticalFail = results.some((r) => r.severity === "critical" && r.status === "fail");
  const overall = criticalFail ? Math.min(raw, 59) : raw;

  const categories = {};
  for (const [k, w] of Object.entries(WEIGHTS)) categories[k] = { score: cats[k], weight: w };
  return { score: overall, grade: grade(overall), cappedByCritical: criticalFail && raw > 59, categories };
}

export function grade(s) {
  return s >= 90 ? "A" : s >= 75 ? "B" : s >= 60 ? "C" : s >= 40 ? "D" : "F";
}

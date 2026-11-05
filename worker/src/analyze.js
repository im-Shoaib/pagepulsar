// Turns raw homepage HTML (plus robots.txt etc.) into simple facts the checks can use.
// Regex-based on purpose: no dependencies, fast, and identical in Workers and Node tests.

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©", reg: "®", ndash: "–", mdash: "—", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', hellip: "…" };
export function decode(s) {
  return String(s || "")
    .replace(/&#(\d+);/g, (_, n) => { const c = Number(n); return c > 0 && c < 0x10ffff ? String.fromCodePoint(c) : " "; })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { const c = parseInt(h, 16); return c > 0 && c < 0x10ffff ? String.fromCodePoint(c) : " "; })
    .replace(/&([a-z]+);/gi, (m, n) => (ENT[n.toLowerCase()] !== undefined ? ENT[n.toLowerCase()] : m));
}
const stripTags = (s) => decode(String(s || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const ATTR_RE = {};
function attr(tag, name) {
  const re = ATTR_RE[name] || (ATTR_RE[name] = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  const m = tag.match(re);
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? "") : null;
}
function metaContent(html, key, val) {
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const t = m[0];
    const k = attr(t, key);
    if (k && k.toLowerCase() === val) return attr(t, "content");
  }
  return null;
}

function collectJsonLd(html) {
  const out = [];
  const re = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1].trim())); } catch { /* invalid JSON-LD is ignored */ }
  }
  const nodes = [];
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) { x.forEach(walk); return; }
    if (x["@type"]) nodes.push(x);
    if (x["@graph"]) walk(x["@graph"]);
  };
  out.forEach(walk);
  return nodes;
}

export const LOCAL_TYPES = new Set(["LocalBusiness", "Restaurant", "FoodEstablishment", "CafeOrCoffeeShop", "Bakery", "BarOrPub", "FastFoodRestaurant", "Dentist", "MedicalBusiness", "MedicalClinic", "Physician", "HealthAndBeautyBusiness", "BeautySalon", "HairSalon", "NailSalon", "DaySpa", "AutoRepair", "AutomotiveBusiness", "AutoBodyShop", "HomeAndConstructionBusiness", "Plumber", "Electrician", "RoofingContractor", "HVACBusiness", "GeneralContractor", "HousePainter", "Locksmith", "MovingCompany", "ProfessionalService", "Store", "LegalService", "Attorney", "AccountingService", "ExerciseGym", "HealthClub", "VeterinaryCare", "ChildCare", "EmergencyService", "LodgingBusiness", "Hotel", "RealEstateAgent", "TravelAgency", "SportsActivityLocation"]);

export function analyzeHtml(html, pageUrl) {
  const raw = String(html || "");
  const lower = raw.toLowerCase();
  const isHttps = String(pageUrl || "").startsWith("https://");

  const body = raw
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1>/gi, " ");
  const text = stripTags(body);
  const textLower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length : 0;

  const titleM = raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const htmlTag = (raw.match(/<html\b[^>]*>/i) || [""])[0];

  // Links
  const links = [];
  const aRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = aRe.exec(body))) {
    const href = attr(" " + m[1], "href") || "";
    const label = stripTags(m[2]) || attr(" " + m[1], "aria-label") || attr(" " + m[1], "title") || "";
    links.push({ href: href.trim(), hrefLower: href.trim().toLowerCase(), text: label.toLowerCase() });
  }
  const buttons = [];
  const bRe = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  while ((m = bRe.exec(body))) buttons.push(stripTags(m[1]).toLowerCase());
  const inputSubmits = (body.match(/<input\b[^>]*type\s*=\s*["']?submit[^>]*>/gi) || []).map((t) => (attr(t, "value") || "").toLowerCase());

  // Forms
  const forms = body.match(/<form\b[\s\S]*?<\/form>/gi) || [];
  const contactForm = forms.some((f) => /type\s*=\s*["']?(email|tel)|name\s*=\s*["'][^"']*(email|phone|message)/i.test(f) || /<textarea/i.test(f));

  // Images
  const imgs = raw.match(/<img\b[^>]*>/gi) || [];
  const imgNoAlt = imgs.filter((t) => attr(t, "alt") === null && !/aria-hidden\s*=\s*["']?true|role\s*=\s*["']?presentation/i.test(t)).length;

  // Iframes (maps, booking widgets)
  const iframes = (raw.match(/<iframe\b[^>]*>/gi) || []).map((t) => (attr(t, "src") || attr(t, "data-src") || "").toLowerCase());

  // Scripts
  const scriptSrcs = (raw.match(/<script\b[^>]*\bsrc\s*=[^>]*>/gi) || []).map((t) => (attr(t, "src") || "").toLowerCase());
  const jqm = scriptSrcs.join(" ").match(/jquery[.-]?(\d+)\.(\d+)/) || lower.match(/jquery v(\d+)\.(\d+)/);
  const jqueryMajor = jqm ? Number(jqm[1]) : null;

  // Mixed content on HTTPS pages
  let mixed = 0;
  if (isHttps) {
    const res = raw.match(/<(script|img|iframe|source|video|audio)\b[^>]*\ssrc\s*=\s*["']http:\/\/[^"']+/gi) || [];
    const css = raw.match(/<link\b[^>]*rel\s*=\s*["']?stylesheet[^>]*href\s*=\s*["']http:\/\/[^"']+/gi) || [];
    mixed = res.length + css.length;
  }

  // Structured data
  const ld = collectJsonLd(raw);
  const ldTypes = new Set();
  ld.forEach((n) => [].concat(n["@type"]).forEach((t) => ldTypes.add(String(t).replace(/^https?:\/\/schema\.org\//, ""))));
  const localNode = ld.find((n) => [].concat(n["@type"]).some((t) => LOCAL_TYPES.has(String(t).replace(/^https?:\/\/schema\.org\//, ""))));
  const ldHasHours = ld.some((n) => n.openingHours || n.openingHoursSpecification);
  const ldHasAddress = ld.some((n) => n.address);
  const ldHasRating = ld.some((n) => n.aggregateRating || n.review);

  // Copyright year
  const years = [];
  const yRe = /(?:©|&copy;|\(c\)|copyright)\s*(?:[^0-9<]{0,30})?((?:19|20)\d{2})(?:\s*[-–—]\s*((?:19|20)\d{2}))?/gi;
  const yText = text + " " + raw.slice(-30000);
  while ((m = yRe.exec(yText))) years.push(Number(m[2] || m[1]));
  const copyrightYear = years.length ? Math.max(...years) : null;
  const dynamicYear = /new Date\(\)\.getFullYear\(\)|\{\{\s*year\s*\}\}|<\?php\s+echo\s+date/i.test(raw);

  const all = links.map((l) => l.hrefLower).concat(iframes, scriptSrcs).join(" ");
  const ctaText = links.map((l) => l.text).concat(buttons, inputSubmits).join(" | ");

  return {
    words,
    text: textLower,
    title: titleM ? stripTags(titleM[1]) : "",
    metaDescription: (metaContent(raw, "name", "description") || "").trim(),
    metaRobots: (metaContent(raw, "name", "robots") || "").toLowerCase(),
    viewport: (metaContent(raw, "name", "viewport") || "").toLowerCase(),
    ogTitle: metaContent(raw, "property", "og:title"),
    ogImage: metaContent(raw, "property", "og:image"),
    lang: attr(htmlTag, "lang"),
    h1Count: (body.match(/<h1\b/gi) || []).length,
    links,
    allUrls: all,
    ctaText,
    telLinks: links.filter((l) => l.hrefLower.startsWith("tel:")).length,
    mailto: links.some((l) => l.hrefLower.startsWith("mailto:")),
    forms: forms.length,
    contactForm,
    imgCount: imgs.length,
    imgNoAlt,
    iframes,
    jqueryMajor,
    mixed,
    ldTypes: [...ldTypes],
    hasLocalSchema: !!localNode,
    ldHasHours,
    ldHasAddress,
    ldHasRating,
    copyrightYear,
    dynamicYear
  };
}

// Robots.txt: which of the given agents are fully blocked from "/".
export function robotsBlocks(robotsText, agents) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const line of String(robotsText || "").split(/\r?\n/)) {
    const l = line.replace(/#.*/, "").trim();
    if (!l) continue;
    const idx = l.indexOf(":");
    if (idx < 0) continue;
    const k = l.slice(0, idx).trim().toLowerCase();
    const v = l.slice(idx + 1).trim();
    if (k === "user-agent") {
      if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(v.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && (k === "disallow" || k === "allow")) cur.rules.push({ k, v });
    }
  }
  const blockedIn = (g) => g.rules.some((r) => r.k === "disallow" && r.v === "/") && !g.rules.some((r) => r.k === "allow" && r.v === "/");
  const result = {};
  for (const a of agents) {
    const own = groups.filter((g) => g.agents.includes(a.toLowerCase()));
    const star = groups.filter((g) => g.agents.includes("*"));
    const use = own.length ? own : star;
    result[a] = use.some(blockedIn);
  }
  result["*"] = groups.filter((g) => g.agents.includes("*")).some(blockedIn);
  result.sitemapDeclared = /^\s*sitemap\s*:/im.test(String(robotsText || ""));
  return result;
}

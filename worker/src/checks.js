// Every check: what it looks for, how bad a failure is, and the plain-English copy shown in the report.
// evaluate(ctx) returns "pass" | "partial" | "fail" | "unknown" | "skip".

const has = (text, words) => words.some((w) => text.includes(w));
const countHits = (text, words) => words.filter((w) => text.includes(w)).length;
const anyUrl = (ctx, parts) => parts.some((p) => ctx.f.allUrls.includes(p));
const PRICE = /(?:\$|£|€|a\$|c\$)\s?\d{1,4}(?:[.,]\d{2})?/g;
const priceCount = (ctx) => (ctx.f.text.match(PRICE) || []).length;

const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\+44\s?\d{2,4}\s?\d{3,4}\s?\d{3,4}|\b0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b|\+61\s?\d\s?\d{4}\s?\d{4}|\b1[38]00\s?\d{3}\s?\d{3}\b/;
const ADDRESS_RE = /\b\d{1,5}\s+[a-z0-9.'\- ]{2,40}\s(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|way|court|ct|place|pl|parkway|pkwy|highway|hwy|suite|ste|square|terrace|crescent|close)\b/;
const POSTCODE_RE = /\b[a-z]{2}\s\d{5}(?:-\d{4})?\b|\b[a-z]{1,2}\d[a-z\d]?\s?\d[a-z]{2}\b|\b(?:nsw|vic|qld|wa|sa|tas|act|nt)\s\d{4}\b|\b[a-z]\d[a-z]\s?\d[a-z]\d\b/;
const HOURS_RE = /\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\b[^.]{0,40}?\b\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)|\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\b[^.]{0,40}?\b\d{1,2}:\d{2}\b|open 24 hours|24\/7|opening hours|business hours|hours of operation/;

const TYPE_WORDS = ["restaurant", "cafe", "café", "pizza", "grill", "kitchen", "bistro", "diner", "bakery", "bar", "dental", "dentist", "dentistry", "orthodont", "salon", "spa", "hair", "nails", "barber", "beauty", "plumb", "roof", "hvac", "heating", "cooling", "air conditioning", "electric", "contractor", "construction", "remodel", "painting", "landscap", "cleaning", "auto", "repair", "mechanic", "tire", "tyre", "collision", "brake", "garage", "law", "attorney", "clinic", "vet", "gym", "fitness"];
const PLACE_HINT = /,\s?[a-z]{2}\b|\b(?:in|near|serving)\s[a-z]{3,}|\b(?:alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|london|manchester|birmingham|glasgow|leeds|liverpool|bristol|edinburgh|sydney|melbourne|brisbane|perth|adelaide|toronto|vancouver|calgary|ottawa|montreal|edmonton|winnipeg)\b/;

export const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];

export const CHECKS = [
  // ---------- Mobile and basics ----------
  { id: "https", category: "mobile", severity: "critical", title: "Your site isn't secure (no HTTPS)", passTitle: "Secure connection (HTTPS)",
    why: "Browsers show a \"Not secure\" warning, which scares customers away.", fix: "Turn on a free SSL certificate in your hosting panel and redirect http:// to https://.",
    evaluate: (c) => (!c.finalUrl.startsWith("https://") ? "fail" : c.httpRedirect === false ? "partial" : "pass"),
    partialTitle: "The http:// version of your site doesn't redirect to https://" },
  { id: "viewport", category: "mobile", severity: "critical", title: "Your site isn't built for phones", passTitle: "Built for phones",
    why: "Without a mobile viewport, phones show a tiny desktop page that people have to pinch and zoom.", fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> and use a responsive layout.",
    evaluate: (c) => (c.f.viewport.includes("width=device-width") ? "pass" : "fail") },
  { id: "loads", category: "mobile", severity: "critical", title: "Your homepage loads", passTitle: "Homepage loads", why: "", fix: "", evaluate: () => "pass" },

  // ---------- Customers ----------
  { id: "click_to_call", category: "customers", severity: "critical", textBased: true, title: "Customers on phones can't tap to call you", passTitle: "Tap-to-call phone link",
    why: "Most local searches happen on phones, and every extra step loses calls.", fix: "Make your phone number a tap-to-call link: <a href=\"tel:+15551234567\">.",
    evaluate: (c) => (c.f.telLinks > 0 ? "pass" : "fail") },
  { id: "phone_visible", category: "customers", severity: "high", textBased: true, title: "We couldn't find a phone number on your homepage", passTitle: "Phone number visible",
    why: "Many customers still prefer to call before they visit or book.", fix: "Show your phone number in the header and footer as text, not inside an image.",
    evaluate: (c) => (PHONE_RE.test(c.f.text) || c.f.telLinks > 0 ? "pass" : "fail") },
  { id: "contact_path", category: "customers", severity: "high", textBased: true, title: "There's no easy way to contact you", passTitle: "Contact form or email",
    why: "Some customers won't call. Without a form or email link, they leave.", fix: "Add a short contact or quote form, or at least an email link.",
    evaluate: (c) => (c.f.contactForm || c.f.mailto || c.f.links.some((l) => /contact|quote|estimate|book/.test(l.hrefLower)) ? "pass" : "fail") },
  { id: "cta", category: "customers", severity: "medium", textBased: true, title: "No clear call to action", passTitle: "Clear call to action",
    why: "Visitors need one obvious next step: call, book, order or get a quote.", fix: "Add a bold button near the top, like \"Book now\" or \"Get a free quote\".",
    evaluate: (c) => (/\b(call|book|quote|order|schedule|reserve|appointment|estimate|get started|contact us|request)\b/.test(c.f.ctaText) ? "pass" : "fail") },
  { id: "location", category: "customers", severity: "medium", textBased: true, title: "Your address or service area isn't on your homepage", passTitle: "Location shown",
    why: "Customers and Google both need to know where you are or where you work.", fix: "Add your full address, or the towns you serve, to the homepage and footer.",
    evaluate: (c) => (ADDRESS_RE.test(c.f.text) || POSTCODE_RE.test(c.f.text) || c.f.ldHasAddress || /\b(serving|service area|areas we serve|we serve)\b/.test(c.f.text) ? "pass" : "fail") },
  { id: "map", category: "customers", severity: "low", textBased: true, title: "No map or directions link", passTitle: "Map or directions link",
    why: "A map link gets people to your door without searching again.", fix: "Link to your Google Maps listing or embed a small map.",
    evaluate: (c) => (anyUrl(c, ["google.com/maps", "maps.google", "maps.app.goo.gl", "goo.gl/maps", "g.page", "maps.apple.com", "bing.com/maps", "google.com/maps/embed"]) ? "pass" : "fail") },
  { id: "hours", category: "customers", severity: "medium", textBased: true, severityByType: { restaurant: "high", salon: "high", auto: "high" }, title: "Opening hours aren't on your homepage", passTitle: "Opening hours shown",
    why: "Hours are one of the first things customers look for. If they can't see them, they assume you're closed.", fix: "Add your hours near your address, and keep holiday hours up to date.",
    evaluate: (c) => (HOURS_RE.test(c.f.text) || c.f.ldHasHours ? "pass" : "fail") },
  { id: "reviews", category: "customers", severity: "medium", textBased: true, title: "No reviews or testimonials on your homepage", passTitle: "Reviews shown",
    why: "People trust other customers more than they trust your ads.", fix: "Add three or four real reviews, or a Google reviews widget, near the top.",
    evaluate: (c) => (/\b(reviews?|testimonials?|what (our )?(customers|clients|patients) say|5[- ]star|five[- ]star|★)/.test(c.f.text) || c.f.ldHasRating || anyUrl(c, ["elfsight", "trustindex", "birdeye", "yelp.com", "trustpilot", "podium", "nicejob", "reviews.io", "google.com/maps/place"]) ? "pass" : "fail") },
  { id: "current", category: "customers", severity: "medium", title: "Your site says ©", passTitle: "Site looks current",
    why: "An old year in the footer makes customers wonder if you're still open.", fix: "Update the year in your footer, or set it to update automatically.",
    evaluate: (c) => {
      if (c.f.dynamicYear) return "pass";
      if (!c.f.copyrightYear) return c.f.words < 150 ? "unknown" : "skip";
      return c.f.copyrightYear >= c.year - 1 ? "pass" : "fail";
    },
    dynamicTitle: (c) => `Your site says © ${c.f.copyrightYear}` },
  { id: "social", category: "customers", severity: "low", textBased: true, title: "No links to your social or review profiles", passTitle: "Social profiles linked",
    why: "Active social profiles show you're a real, busy business.", fix: "Link your Facebook, Instagram or Google Business profile in the footer.",
    evaluate: (c) => (anyUrl(c, ["facebook.com", "instagram.com", "yelp.com", "g.page", "tiktok.com", "linkedin.com", "x.com/", "twitter.com", "youtube.com", "nextdoor.com", "houzz.com", "angi.com"]) ? "pass" : "fail") },
  { id: "privacy", category: "customers", severity: "low", severityIfForm: "medium", textBased: true, title: "No privacy policy link", passTitle: "Privacy policy linked",
    why: "If your site collects names or emails, customers (and the law in many places) expect a privacy policy.", fix: "Add a short privacy policy page and link it in your footer.",
    evaluate: (c) => (c.f.links.some((l) => /privacy/.test(l.text) || /privacy/.test(l.hrefLower)) ? "pass" : "fail") },

  // ---------- Google ----------
  { id: "title", category: "google", severity: "medium", title: "Your page title is missing or the wrong length", passTitle: "Good page title",
    why: "The title is the blue headline in Google results.", fix: "Write a 15–65 character title with your business type and town, like \"Smith Plumbing | Plumber in Austin, TX\".",
    evaluate: (c) => { const n = c.f.title.length; return n === 0 ? "fail" : n < 15 || n > 65 ? "partial" : "pass"; } },
  { id: "title_where", category: "google", severity: "medium", title: "Your title doesn't say what you do and where", passTitle: "Title says what and where",
    why: "People search for a service plus a place. Your title should match.", fix: "Include your main service and your town or region in the title.",
    evaluate: (c) => { const t = c.f.title.toLowerCase(); if (!t) return "fail"; const what = has(t, TYPE_WORDS), where = PLACE_HINT.test(t); return what && where ? "pass" : what || where ? "partial" : "fail"; } },
  { id: "meta_description", category: "google", severity: "low", title: "Your Google description is missing or the wrong length", passTitle: "Good Google description",
    why: "This is the text under your link in search results. A good one gets more clicks.", fix: "Write 50–160 characters saying what you do, where, and why people choose you.",
    evaluate: (c) => { const n = c.f.metaDescription.length; return n === 0 ? "fail" : n < 50 || n > 160 ? "partial" : "pass"; } },
  { id: "h1", category: "google", severity: "medium", textBased: true, title: "Your page needs one main heading", passTitle: "One main heading",
    why: "One clear H1 heading tells Google and visitors what the page is about.", fix: "Use exactly one <h1> near the top that says what you do.",
    evaluate: (c) => (c.f.h1Count === 1 ? "pass" : c.f.h1Count === 0 ? "fail" : "partial") },
  { id: "indexable", category: "google", severity: "critical", title: "Your homepage is hidden from Google", passTitle: "Visible to Google",
    why: "A noindex tag tells Google not to show your page at all.", fix: "Remove \"noindex\" from your robots meta tag or X-Robots-Tag header.",
    evaluate: (c) => (c.f.metaRobots.includes("noindex") || String(c.headers["x-robots-tag"] || "").toLowerCase().includes("noindex") ? "fail" : "pass") },
  { id: "schema", category: "google", severity: "medium", title: "Google doesn't get your business details as structured data", passTitle: "Local business structured data",
    why: "LocalBusiness structured data states your name, address, hours and type in a format Google reads directly.", fix: "Add LocalBusiness (or Restaurant, Dentist, etc.) JSON-LD with your name, address, phone and hours.",
    evaluate: (c) => (c.f.hasLocalSchema ? "pass" : "fail") },
  { id: "sitemap", category: "google", severity: "low", title: "No sitemap found", passTitle: "Sitemap and robots.txt",
    why: "A sitemap helps Google find all your pages, and robots.txt must not block everything.", fix: "Add /sitemap.xml (most site builders can do this automatically) and list it in robots.txt.",
    evaluate: (c) => (c.robots["*"] ? "fail" : c.sitemapOk ? "pass" : "partial"),
    partialTitle: "No sitemap found" },
  { id: "share", category: "google", severity: "low", title: "No share preview image", passTitle: "Share preview set up",
    why: "When someone shares your link, a good preview gets more clicks.", fix: "Add og:title and og:image tags with a 1200×630 image.",
    evaluate: (c) => (c.f.ogTitle && c.f.ogImage ? "pass" : c.f.ogTitle || c.f.ogImage ? "partial" : "fail") },
  { id: "lh_seo", category: "google", severity: "medium", title: "Google's SEO test found problems", passTitle: "Google SEO test",
    why: "Google's own Lighthouse test checks basics like crawlable links and readable text.", fix: "Fix the items your web developer sees in Lighthouse's SEO section.",
    evaluate: (c) => (!c.psi ? "unknown" : c.psi.seo >= 90 ? "pass" : c.psi.seo >= 70 ? "partial" : "fail"),
    dynamicTitle: (c) => `Google's SEO test scored ${c.psi.seo}/100` },

  // ---------- Speed (shown as issues; category score comes from PSI directly) ----------
  { id: "perf", category: "speed", severity: "high", display: true, title: "Your site is slow on phones", passTitle: "Fast on phones",
    why: "Slow pages lose visitors before they see your offer.", fix: "Compress large images, use modern formats like WebP, and remove scripts you don't need.",
    evaluate: (c) => (!c.psi || c.psi.performance == null ? "unknown" : c.psi.performance >= 90 ? "pass" : c.psi.performance >= 50 ? "partial" : "fail"),
    dynamicTitle: (c) => `Your site is ${c.psi.performance >= 50 ? "a bit slow" : "slow"} on phones (${c.psi.performance}/100)`,
    dynamicDetail: (c) => (c.psi.speedFailures.length ? "Google suggests: " + c.psi.speedFailures.join(" · ") : "") },
  { id: "field_speed", category: "speed", severity: "medium", display: true, title: "Real visitors see your main content slowly", passTitle: "Real-visitor speed is good",
    why: "This comes from Chrome users who actually visited your site.", fix: "Speed up your largest image or heading at the top of the page.",
    evaluate: (c) => { const l = c.psi && c.psi.field && c.psi.field.lcp; if (!l) return "skip"; return l.category === "FAST" ? "pass" : l.category === "AVERAGE" ? "partial" : "fail"; },
    dynamicDetail: (c) => `Main content appears in about ${(c.psi.field.lcp.ms / 1000).toFixed(1)}s for real visitors (2.5s or less is good).` },

  // ---------- Accessibility ----------
  { id: "lh_a11y", category: "accessibility", severity: "high", display: true, title: "Some visitors will struggle to use your site", passTitle: "Accessibility test passed",
    why: "Low contrast, unlabelled buttons and missing descriptions shut out customers with disabilities.", fix: "Fix the items listed below. Most are quick changes to colours, labels and image text.",
    evaluate: (c) => (!c.psi || c.psi.accessibility == null ? "unknown" : c.psi.accessibility >= 90 ? "pass" : c.psi.accessibility >= 70 ? "partial" : "fail"),
    dynamicTitle: (c) => `Accessibility test scored ${c.psi.accessibility}/100`,
    dynamicDetail: (c) => (c.psi.a11yFailures.length ? "Problems found: " + c.psi.a11yFailures.join(" · ") : "") },
  { id: "alt", category: "accessibility", severity: "medium", title: "Images are missing descriptions", passTitle: "Images have descriptions",
    why: "Screen readers can't describe images without alt text, and Google can't either.", fix: "Add a short alt description to every meaningful image.",
    evaluate: (c) => (c.f.imgCount === 0 ? "skip" : c.f.imgNoAlt === 0 ? "pass" : c.f.imgNoAlt <= 2 ? "partial" : "fail"),
    dynamicDetail: (c) => `${c.f.imgNoAlt} of ${c.f.imgCount} images have no alt text.` },
  { id: "lang", category: "accessibility", severity: "low", title: "Your page language isn't set", passTitle: "Page language set",
    why: "Screen readers use it to pronounce your content correctly.", fix: "Add lang=\"en\" to your <html> tag.",
    evaluate: (c) => (c.f.lang ? "pass" : "fail") },

  // ---------- Security ----------
  { id: "mixed", category: "security", severity: "medium", title: "Some files load over an insecure connection", passTitle: "No insecure files",
    why: "Insecure images or scripts on an HTTPS page can trigger browser warnings.", fix: "Change http:// links to images and scripts into https://.",
    evaluate: (c) => (!c.finalUrl.startsWith("https://") ? "skip" : c.f.mixed === 0 ? "pass" : "fail"),
    dynamicDetail: (c) => `${c.f.mixed} insecure file${c.f.mixed === 1 ? "" : "s"} found.` },
  { id: "old_libs", category: "security", severity: "low", title: "Your site uses a very old version of jQuery", passTitle: "No very old libraries",
    why: "Old libraries can have known security problems and slow the page.", fix: "Update jQuery to version 3 or later, or remove it if it isn't needed.",
    evaluate: (c) => (c.f.jqueryMajor !== null && c.f.jqueryMajor < 3 ? "fail" : "pass") },

  // ---------- AI search ----------
  { id: "ai_bots", category: "ai", severity: "low", title: "Your robots.txt blocks AI search tools", passTitle: "AI search tools allowed",
    why: "Blocked AI crawlers can't recommend you when people ask ChatGPT, Claude or Perplexity.", fix: "Remove the Disallow rules for AI crawlers in robots.txt, unless you blocked them on purpose.",
    evaluate: (c) => { const blocked = AI_BOTS.filter((b) => c.robots[b]); return blocked.length === 0 ? "pass" : blocked.length < AI_BOTS.length ? "partial" : "fail"; },
    dynamicDetail: (c) => { const blocked = AI_BOTS.filter((b) => c.robots[b]); return blocked.length ? "Blocked: " + blocked.join(", ") : ""; } },
  { id: "raw_text", category: "ai", severity: "medium", title: "Your words only appear after JavaScript runs", passTitle: "Readable without JavaScript",
    why: "Many AI crawlers read raw HTML. If your text needs scripts to appear, they may see an empty page.", fix: "Use server-rendered or static pages, or a site builder setting that pre-renders content.",
    evaluate: (c) => (c.f.words >= 150 ? "pass" : c.f.words >= 50 ? "partial" : "fail"),
    dynamicDetail: (c) => `We found ${c.f.words} words in your page's HTML.` },
  { id: "llms", category: "ai", severity: "info", title: "No llms.txt file", passTitle: "llms.txt file found",
    why: "An optional plain-text summary for AI tools. No major search engine has confirmed using it, so it doesn't affect your score.", fix: "Optional: add /llms.txt with a short description of your business and key pages.",
    evaluate: (c) => (c.llmsOk ? "pass" : "fail") }
];

// ---------- Business-type checks (all count toward Customers) ----------
const SERVICE_WORDS = {
  contractor: ["repair", "install", "replacement", "maintenance", "inspection", "emergency", "roof", "plumb", "drain", "water heater", "hvac", "furnace", "air condition", "electric", "wiring", "panel", "remodel", "renovation", "kitchen", "bathroom", "paint", "flooring", "landscap", "gutter", "siding", "deck", "fence", "concrete"],
  dentist: ["cleaning", "implant", "invisalign", "crown", "whitening", "emergency", "root canal", "veneer", "filling", "extraction", "orthodont", "braces", "dentures", "bridge", "periodont", "cosmetic", "pediatric", "children"],
  auto: ["brake", "oil change", "diagnostic", "tire", "tyre", "transmission", "inspection", "alignment", "engine", "battery", "suspension", "exhaust", "air conditioning", "a/c", "check engine", "tune-up", "mot", "service"]
};

export const TYPE_CHECKS = {
  contractor: [
    { id: "services", severity: "high", textBased: true, title: "Your services aren't clearly listed", passTitle: "Services listed", why: "Customers and Google match you to searches by the services you name.", fix: "List each service you offer, ideally with its own short section or page.", evaluate: (c) => (countHits(c.f.text, SERVICE_WORDS.contractor) >= 3 ? "pass" : countHits(c.f.text, SERVICE_WORDS.contractor) >= 1 ? "partial" : "fail") },
    { id: "service_area", severity: "high", textBased: true, title: "Your service area isn't on your homepage", passTitle: "Service area listed", why: "\"Near me\" searches depend on Google knowing where you work.", fix: "List the towns, cities or counties you serve.", evaluate: (c) => (/\b(serving|service area|areas we serve|we serve|proudly serving|surrounding areas|county|counties)\b/.test(c.f.text) ? "pass" : "fail") },
    { id: "licensed", severity: "medium", textBased: true, title: "You don't say you're licensed and insured", passTitle: "Licensed and insured", why: "Homeowners check this before letting anyone in.", fix: "Say \"Licensed & insured\" near the top, with your license number if your state requires it.", evaluate: (c) => (/\b(licensed|insured|bonded|license\s*#|lic\.?\s*#|accredited|certified)\b/.test(c.f.text) ? "pass" : "fail") },
    { id: "estimate", severity: "high", textBased: true, title: "No free estimate or quote button", passTitle: "Free estimate offered", why: "Most homeowners want a price before they commit.", fix: "Add a \"Get a free estimate\" button and a short quote form.", evaluate: (c) => (/\b(estimate|quote)\b/.test(c.f.ctaText) ? "pass" : /\b(free estimate|free quote|get a quote)\b/.test(c.f.text) ? "partial" : "fail") }
  ],
  restaurant: [
    { id: "menu_text", severity: "high", textBased: true, title: "Your menu isn't readable as text", passTitle: "Menu readable as text", why: "PDF and photo menus are slow on phones, need zooming, and Google can't read them well.", fix: "Put your menu on a normal web page with prices as text.",
      evaluate: (c) => {
        if (priceCount(c) >= 5) return "pass";
        const menuLinks = c.f.links.filter((l) => /menu/.test(l.text) || /menu/.test(l.hrefLower));
        if (!menuLinks.length) return "fail";
        return menuLinks.every((l) => /\.(pdf|jpe?g|png|webp)(\?|$)/.test(l.hrefLower)) ? "fail" : "partial";
      },
      partialTitle: "Your menu is on another page — make sure it's text, not a PDF" },
    { id: "order", severity: "high", textBased: true, title: "No way to order or reserve online", passTitle: "Order or reserve online", why: "Customers order from whoever makes it easiest.", fix: "Add an \"Order online\" or \"Reserve a table\" button at the top of the homepage.", evaluate: (c) => (anyUrl(c, ["opentable", "resy.com", "toasttab", "doordash", "ubereats", "grubhub", "chownow", "square.site", "squareup.com", "sevenrooms", "tock", "yelp.com/reservations", "deliveroo", "just-eat", "menulog", "skipthedishes", "slicelife", "bentobox", "owner.com", "clover.com"]) || /\b(order online|order now|order pickup|order delivery|reserve|reservation|book a table)\b/.test(c.f.ctaText) ? "pass" : "fail") },
    { id: "hours_address", severity: "high", textBased: true, title: "Hours and address aren't shown together", passTitle: "Hours and address shown", why: "Hungry customers want to know where you are and if you're open — right now.", fix: "Show your address and hours side by side, near the top or in the footer.", evaluate: (c) => { const h = HOURS_RE.test(c.f.text) || c.f.ldHasHours; const a = ADDRESS_RE.test(c.f.text) || POSTCODE_RE.test(c.f.text) || c.f.ldHasAddress; return h && a ? "pass" : h || a ? "partial" : "fail"; } }
  ],
  dentist: [
    { id: "booking", severity: "high", textBased: true, title: "Patients can't book online", passTitle: "Online booking", why: "Many patients book outside office hours, with whoever lets them pick a time.", fix: "Add a \"Book appointment\" button linked to your booking system.", evaluate: (c) => (anyUrl(c, ["zocdoc", "nexhealth", "localmed", "lighthouse360", "solutionreach", "flexbook", "doctible", "weave", "dentrix", "opendental", "patientpop", "sikka"]) || /\b(book|schedule|request)\b[^|]{0,20}\b(appointment|online|visit|now)\b/.test(c.f.ctaText) ? "pass" : "fail") },
    { id: "insurance", severity: "medium", textBased: true, title: "No insurance information", passTitle: "Insurance information", why: "\"Do you take my insurance?\" is the first question most new patients have.", fix: "List the insurance plans you accept, or explain your payment options.", evaluate: (c) => (/\b(insurance|ppo|hmo|delta dental|cigna|aetna|metlife|guardian|bupa|nhs|medicaid|financing|payment plan)\b/.test(c.f.text) ? "pass" : "fail") },
    { id: "services", severity: "medium", textBased: true, title: "Your dental services aren't clearly listed", passTitle: "Dental services listed", why: "Patients search for specific treatments.", fix: "List your main treatments, each with a short description or page.", evaluate: (c) => (countHits(c.f.text, SERVICE_WORDS.dentist) >= 3 ? "pass" : countHits(c.f.text, SERVICE_WORDS.dentist) >= 1 ? "partial" : "fail") },
    { id: "new_patients", severity: "low", textBased: true, title: "No new patient information", passTitle: "New patient information", why: "Knowing what to expect makes the first visit easier to book.", fix: "Add a short \"New patients\" section with forms and what to bring.", evaluate: (c) => (/\b(new patients?|first visit|patient forms|welcome new)\b/.test(c.f.text) ? "pass" : "fail") }
  ],
  salon: [
    { id: "booking", severity: "high", textBased: true, title: "Clients can't book online", passTitle: "Online booking", why: "Clients book where it's easiest, often late at night.", fix: "Add a \"Book now\" button linked to your booking app.", evaluate: (c) => (anyUrl(c, ["vagaro", "booksy", "fresha", "squareup.com/appointments", "square.site", "mindbody", "glossgenius", "schedulicity", "styleseat", "acuityscheduling", "setmore", "timely", "phorest", "boulevard", "zenoti", "salonbiz", "treatwell"]) || /\bbook\b/.test(c.f.ctaText) ? "pass" : "fail") },
    { id: "prices", severity: "medium", textBased: true, title: "Your prices aren't shown", passTitle: "Prices shown", why: "Hidden prices make people assume you're expensive.", fix: "Show starting prices for your main services.", evaluate: (c) => (priceCount(c) >= 3 ? "pass" : priceCount(c) >= 1 || /\b(prices|pricing|price list|menu of services)\b/.test(c.f.text) ? "partial" : "fail") },
    { id: "gallery", severity: "low", title: "No gallery of your work", passTitle: "Work gallery", why: "Clients choose a stylist by their work.", fix: "Add a small gallery or link your Instagram.", evaluate: (c) => (c.f.imgCount >= 6 || anyUrl(c, ["instagram.com"]) ? "pass" : "fail") }
  ],
  auto: [
    { id: "services", severity: "medium", textBased: true, title: "Your repair services aren't clearly listed", passTitle: "Services listed", why: "Drivers search for the repair they need.", fix: "List services like brakes, oil changes, diagnostics and tires.", evaluate: (c) => (countHits(c.f.text, SERVICE_WORDS.auto) >= 3 ? "pass" : countHits(c.f.text, SERVICE_WORDS.auto) >= 1 ? "partial" : "fail") },
    { id: "appointment", severity: "high", textBased: true, title: "No way to book an appointment or get a quote", passTitle: "Appointment or quote", why: "Many drivers would rather pick a time than wait on hold.", fix: "Add a \"Schedule service\" button or a short quote form.", evaluate: (c) => (/\b(appointment|schedule|book|quote|estimate)\b/.test(c.f.ctaText) || anyUrl(c, ["shopmonkey", "tekmetric", "autoops", "mechanicnet", "repairpal", "shop-ware", "autovitals"]) ? "pass" : "fail") },
    { id: "trust", severity: "low", textBased: true, title: "No certifications or warranty mentioned", passTitle: "Certifications or warranty", why: "Drivers comparing shops look for ASE certification and a warranty.", fix: "Mention certifications and your parts-and-labour warranty.", evaluate: (c) => (/\b(ase|certified|warranty|guarantee|napa autocare|aaa approved)\b/.test(c.f.text) ? "pass" : "fail") }
  ],
  general: []
};

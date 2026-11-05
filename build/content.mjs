// Page content for the business-type and feature landing pages.
// Each entry becomes /<slug>/index.html through build.mjs.

export const TYPES = [
  { key: "general", label: "Other business" },
  { key: "contractor", label: "Contractor / home services" },
  { key: "restaurant", label: "Restaurant or cafe" },
  { key: "dentist", label: "Dentist" },
  { key: "salon", label: "Salon or spa" },
  { key: "auto", label: "Auto repair" }
];

export const LANDINGS = [
  {
    slug: "restaurant-website-checker",
    type: "restaurant",
    nav: "Restaurants",
    color: "sun",
    title: "Restaurant Website Checker — Free Menu & Ordering Check",
    description: "Free restaurant website checker. See if your menu, online ordering, hours and mobile speed are costing you orders, with a plain-English fix list.",
    h1: "Free restaurant website checker",
    lead: "Hungry customers decide in seconds. Check if your menu is readable on phones, your order button is easy to find, and your hours are right — in about 30 seconds.",
    quick: ["Menu as real text, not a PDF", "Order online or reserve button", "Hours and address together", "Tap-to-call phone number", "Speed on a phone"],
    checklistTitle: "The restaurant website checklist",
    checklistIntro: "Every item below is something PagePulsar checks automatically. Run the checkup above to see which ones your site passes.",
    checklist: [
      ["Menu as real text", "A text menu with prices loads fast, reads well on phones and can be found by Google. A PDF or photo menu can't."],
      ["Order or reserve in one tap", "Put your online ordering or reservation button at the top of the homepage, not three clicks deep."],
      ["Hours you keep up to date", "Wrong holiday hours send customers to a locked door — and to a one-star review."],
      ["Address, map and parking", "Show the full address next to a map link so people can get directions without searching again."],
      ["Tap-to-call phone number", "On a phone, your number should start a call when tapped. Many sites still show it as plain text."],
      ["Fast on mobile data", "Big food photos are the usual reason restaurant sites are slow. Compress them and lazy-load the gallery."],
      ["Reviews on the page", "A few real reviews or a review widget near the top builds trust before people order."],
      ["Restaurant details for Google", "Restaurant structured data (cuisine, hours, menu link) helps Google show your info correctly."],
      ["A site that looks current", "An old © year or last season's specials make people wonder if you're still open."],
      ["Secure connection", "HTTPS is a must for any page that takes orders or reservations."]
    ],
    mistakes: [
      ["PDF-only menus", "Hard to read on a phone, slow to download and invisible to search engines."],
      ["Buried ordering links", "If your ordering partner link is hidden in the footer, customers order from the app next door."],
      ["Autoplay music or video", "It slows the page and makes people close the tab, especially at work."],
      ["Holiday hours never updated", "The fastest way to lose a regular is a wasted trip."]
    ],
    faqs: [
      ["Does PagePulsar check my menu?", "Yes. It looks for a menu written as text with prices, and flags menus that only exist as a PDF or image."],
      ["Do restaurants still need a website if they're on Google and delivery apps?", "Yes. Your own site is the one place you control your menu, hours and story, and orders placed there don't pay app commissions."],
      ["Why is a PDF menu bad for my restaurant?", "PDFs are slow on mobile data, need zooming to read, and search engines index them poorly. A text menu fixes all three."],
      ["Which ordering services does it recognise?", "Common ones such as OpenTable, Resy, Toast, DoorDash, Uber Eats, Grubhub, ChowNow and Square Online, plus any button that says order online."],
      ["Is the restaurant website checker free?", "Yes, completely free with no signup. You only pay if you want help fixing what it finds."]
    ]
  },
  {
    slug: "dental-website-checker",
    type: "dentist",
    nav: "Dentists",
    color: "sky",
    title: "Dental Website Checker — Free Dental Practice Website Audit",
    description: "Free dental website checker. See if patients can book online, find insurance info and reach you on mobile — plus speed and Google checks.",
    h1: "Free dental website checker",
    lead: "New patients compare practices on their phones. Check if yours makes booking easy, answers insurance questions and loads fast — in about 30 seconds.",
    quick: ["Online booking", "Insurance information", "Services listed", "New patient info", "Accessibility basics"],
    checklistTitle: "The dental website checklist",
    checklistIntro: "These are the things patients look for before they book. PagePulsar checks each one automatically.",
    checklist: [
      ["Online booking", "Many patients book outside office hours. A visible book appointment button wins those patients."],
      ["Insurance you accept", "Listing accepted plans answers the first question most new patients have."],
      ["Services clearly listed", "Cleanings, implants, Invisalign, crowns, whitening, emergencies — each with a sentence or a page."],
      ["New patient information", "What to expect, forms to fill in and what to bring make the first visit less stressful."],
      ["Emergency dental info", "If you see emergencies, say so near the top with a tap-to-call number."],
      ["Tap-to-call phone number", "Patients on phones should reach your front desk in one tap."],
      ["Hours and location", "Office hours, address and a map link, all on the homepage."],
      ["Reviews and credentials", "Patient reviews and your team's qualifications build trust before the first call."],
      ["Dentist details for Google", "Dentist structured data helps Google show your hours, address and reviews."],
      ["Accessible for every patient", "Readable contrast, labelled forms and image descriptions help older and disabled patients use your site."]
    ],
    mistakes: [
      ["Phone-only booking", "Patients who search at night book with the practice that lets them pick a time online."],
      ["No insurance information", "If patients can't tell whether you take their plan, they call someone who says it clearly."],
      ["Stock photos everywhere", "Real photos of your team and office build far more trust than generic smiles."],
      ["Slow, heavy pages", "Large sliders and videos make dental sites crawl on mobile."]
    ],
    faqs: [
      ["Does the checker look for online booking?", "Yes. It recognises common booking tools such as Zocdoc, NexHealth and LocalMed, plus any book appointment button."],
      ["Will it tell me if my dental site is ADA compliant?", "It runs automated accessibility checks that catch common problems, but no automated tool can confirm full compliance. Treat it as a starting point."],
      ["Do you store patient information?", "No. The checkup only reads your public homepage, like a visitor would. It never logs in or submits forms."],
      ["How long does a dental website audit take?", "About 30 seconds. The speed test is the slowest part."],
      ["Can you fix the issues for my practice?", "Yes. Send the report on WhatsApp and you'll get a clear quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "salon-website-checker",
    type: "salon",
    nav: "Salons & spas",
    color: "rose",
    title: "Salon & Spa Website Checker — Free Booking and Mobile Check",
    description: "Free salon and spa website checker. Check your book-now button, prices, gallery and mobile speed, and get a simple fix list for more bookings.",
    h1: "Free salon and spa website checker",
    lead: "Clients book where it's easiest. Check if your book-now button, prices and gallery are working for you — in about 30 seconds.",
    quick: ["Book now button", "Prices shown", "Gallery or Instagram", "Hours and location", "Speed on a phone"],
    checklistTitle: "The salon and spa website checklist",
    checklistIntro: "Everything here is checked automatically when you run the checkup.",
    checklist: [
      ["Book now, everywhere", "A clear booking button at the top of every page, linked to your booking app."],
      ["Prices people can see", "Service names with starting prices stop the \"how much?\" messages and pre-qualify clients."],
      ["A gallery of your work", "Real before-and-after photos or a linked Instagram feed sell your style."],
      ["Services described", "Cuts, colour, nails, massage, facials — each with a line about what's included."],
      ["Hours and location", "Opening hours, address and map link on the homepage."],
      ["Tap-to-call and message", "Some clients still prefer to call or text. Make both one tap."],
      ["Reviews that show", "A few reviews near the booking button help new clients commit."],
      ["Cancellation policy", "A short, friendly policy prevents no-shows and awkward conversations."],
      ["Fast image loading", "Galleries are heavy. Compressed images keep the site quick on mobile."],
      ["Salon details for Google", "Beauty salon or day spa structured data helps Google show your details."]
    ],
    mistakes: [
      ["Booking only through DMs", "Many clients won't message and wait. They'll book a salon with instant online booking."],
      ["No prices anywhere", "Hidden prices make people assume you're expensive and move on."],
      ["Huge uncompressed galleries", "Beautiful photos that take ten seconds to load don't get seen."],
      ["Out-of-date staff pages", "Clients ask for stylists who left last year."]
    ],
    faqs: [
      ["Which booking apps does it recognise?", "Common ones such as Vagaro, Booksy, Fresha, Square Appointments, Mindbody and GlossGenius, plus any book now button."],
      ["Should my salon website show prices?", "Yes, at least starting prices. It saves time for you and your clients and builds trust."],
      ["My salon uses Instagram for everything. Do I need a website?", "Instagram is great for discovery, but a website shows up in Google searches and gives clients one place to book, see prices and find you."],
      ["Is the salon website checker free?", "Yes, free with no signup."],
      ["Can you add online booking to my site?", "Yes. Send your report on WhatsApp and you'll get a quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "contractor-website-checker",
    type: "contractor",
    nav: "Contractors",
    color: "mint",
    title: "Contractor Website Checker — Free Audit for Plumbers & Roofers",
    description: "Free website checker for plumbers, roofers, electricians and HVAC pros. Check your service area, estimate button, licensing and mobile speed.",
    h1: "Free contractor website checker",
    lead: "For plumbers, roofers, electricians, HVAC, painters and builders. See if your site makes the phone ring — service area, free estimate, licensing and speed checked in about 30 seconds.",
    quick: ["Services listed", "Service area towns", "Free estimate button", "Licensed and insured", "Tap-to-call"],
    checklistTitle: "The contractor website checklist",
    checklistIntro: "Homeowners look for these before they call. PagePulsar checks each one.",
    checklist: [
      ["Services clearly listed", "Repairs, installs, replacements — name every service so Google and customers can match you."],
      ["Towns you serve", "List your service area cities or counties. It's one of the strongest local search signals you control."],
      ["Free estimate button", "A clear \"get a free estimate\" button or form, at the top of the page."],
      ["Licensed and insured", "Say it, and show your license number where your state requires it."],
      ["Tap-to-call phone number", "Most emergency calls come from phones. One tap should start the call."],
      ["Emergency service, if you offer it", "24/7 or same-day service is a big reason people pick you. Make it obvious."],
      ["Photos of real jobs", "Before-and-after photos of your own work beat stock images every time."],
      ["Reviews near the top", "Homeowners trust other homeowners. Show a few reviews early."],
      ["Contractor details for Google", "Plumber, Roofing Contractor, Electrician or HVAC structured data helps Google understand your business."],
      ["Fast on mobile", "A slow site loses the caller with a burst pipe to the next result."]
    ],
    mistakes: [
      ["No service area anywhere", "Without town names, Google has a hard time showing you to nearby customers."],
      ["Phone number as an image", "It can't be tapped, copied or read by search engines."],
      ["Contact form only on one page", "Put the estimate button where people decide — the homepage."],
      ["Outdated photos and © year", "Customers wonder if you're still in business."]
    ],
    faqs: [
      ["Does it work for plumbers, roofers and HVAC companies?", "Yes. Choose contractor / home services and the checker looks for the things homeowners need: services, service area, estimates, licensing and reviews."],
      ["Why does my service area matter?", "Local searches like \"plumber near me\" depend on Google knowing where you work. Listing your towns helps."],
      ["What if my site is on Wix or Squarespace?", "It still works. Some checks may show \"couldn't verify\" on those builders, and you're never marked down for that."],
      ["Is the contractor website audit free?", "Yes, free with no signup."],
      ["Can you fix my contractor website?", "Yes. Send your report on WhatsApp for a quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "auto-repair-website-checker",
    type: "auto",
    nav: "Auto repair",
    color: "violet",
    title: "Auto Repair Shop Website Checker — Free Mechanic Website Audit",
    description: "Free auto repair shop website checker. Check your services list, appointment button, hours and mobile speed — and see what's sending drivers to other shops.",
    h1: "Free auto repair shop website checker",
    lead: "Drivers with a warning light want answers fast. Check if your shop's site shows services, hours and an easy way to book — in about 30 seconds.",
    quick: ["Services listed", "Appointment or quote", "Hours", "Certifications", "Tap-to-call"],
    checklistTitle: "The auto repair website checklist",
    checklistIntro: "What drivers look for before they call a shop. PagePulsar checks each item automatically.",
    checklist: [
      ["Services listed", "Brakes, oil changes, diagnostics, tires, transmission, inspections — each named clearly."],
      ["Book an appointment", "An appointment or quote button at the top wins drivers who don't want to call."],
      ["Hours, including Saturdays", "Hours are the most-checked detail for repair shops. Keep them on the homepage."],
      ["Address and map", "Drivers need directions now. Make the map one tap away."],
      ["Tap-to-call phone number", "One tap from a phone should reach your service desk."],
      ["Certifications", "ASE certification and manufacturer training build trust fast."],
      ["Warranty on work", "A clear parts-and-labour warranty helps people choose you over a chain."],
      ["Makes you service", "List the makes you specialise in so the right drivers find you."],
      ["Reviews", "Honest reviews matter more in auto repair than almost anywhere else."],
      ["Auto repair details for Google", "AutoRepair structured data helps Google show your hours and location."]
    ],
    mistakes: [
      ["No hours on the homepage", "Drivers assume you're closed and call a chain instead."],
      ["Services hidden in a PDF", "Search engines can't match your services to searches."],
      ["No way to book online", "Many drivers would rather pick a slot than wait on hold."],
      ["Slow, heavy sliders", "Big rotating images slow the page and hide your phone number."]
    ],
    faqs: [
      ["Does it check for appointment booking?", "Yes. It looks for appointment, schedule and quote buttons or forms."],
      ["Why list certifications like ASE?", "They're a quick trust signal for drivers comparing shops they've never used."],
      ["Do I need a website if I'm on Google Maps?", "Your Google profile gets people to look; your website answers their questions and gets the booking."],
      ["Is the mechanic website checker free?", "Yes, free with no signup."],
      ["Can you improve my shop's website?", "Yes. Send your report on WhatsApp for a quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "mobile-friendly-test",
    type: "general",
    focus: "mobile",
    footer: "Mobile friendly test",
    nav: "Mobile test",
    color: "peach",
    feature: true,
    title: "Free Mobile Friendly Test — Check Your Website on Phones",
    description: "Free mobile friendly test. Google retired its own test in 2023 — check your phone layout, tap-to-call, text size and mobile speed here instead.",
    h1: "Free mobile friendly test",
    lead: "Google retired its own Mobile-Friendly Test in December 2023. Check how your website works on a phone — layout, tap-to-call, text size and mobile speed — in about 30 seconds.",
    quick: ["Mobile layout (viewport)", "Mobile speed score", "Tap-to-call", "Readable text", "Real-user speed data"],
    checklistTitle: "The mobile-friendly checklist",
    checklistIntro: "These are the mobile checks in every PagePulsar report.",
    checklist: [
      ["A mobile viewport", "The viewport tag tells phones to fit your page to the screen instead of shrinking a desktop page."],
      ["Fast on mobile data", "Google's own lab test runs on a simulated mid-range phone. We show you that score."],
      ["Main content loads quickly", "Google considers 2.5 seconds or less a good time for the main content to appear."],
      ["Buttons big enough to tap", "Small, crowded links frustrate thumbs and cause wrong taps."],
      ["Text you can read without zooming", "Body text that's too small sends visitors back to the search results."],
      ["Tap-to-call phone number", "Phone visitors want to call you, not copy and paste a number."],
      ["No sideways scrolling", "Content wider than the screen is a classic sign of a desktop-only design."],
      ["HTTPS everywhere", "Browsers warn phone users loudly about insecure pages."]
    ],
    mistakes: [
      ["Desktop-only design", "Tiny text and pinch-to-zoom pages lose most mobile visitors."],
      ["Huge images", "A 5 MB hero photo can take many seconds on mobile data."],
      ["Pop-ups that cover the page", "Hard-to-close pop-ups are worse on small screens."],
      ["Phone number as plain text", "Make it a tap-to-call link."]
    ],
    faqs: [
      ["Did Google really retire the Mobile-Friendly Test?", "Yes. Google retired the Mobile-Friendly Test tool, the Mobile Usability report and the API in December 2023. Lighthouse in Chrome is Google's suggested replacement."],
      ["How is this test different?", "It combines Google's mobile performance data with checks real customers notice, like tap-to-call and readable contact details."],
      ["What is a good mobile speed score?", "90 or above is good, 50 to 89 needs improvement, and below 50 is poor."],
      ["Is the mobile friendly test free?", "Yes, free with no signup."],
      ["Can you make my site mobile friendly?", "Yes. Send your report on WhatsApp for a quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "website-accessibility-checker",
    type: "general",
    focus: "accessibility",
    footer: "Accessibility checker",
    nav: "Accessibility",
    color: "sky",
    feature: true,
    title: "Free Website Accessibility Checker — WCAG & ADA Basics",
    description: "Free website accessibility checker for small businesses. Find common WCAG problems like low contrast and missing image text, with simple fixes.",
    h1: "Free website accessibility checker",
    lead: "Find the common accessibility problems that shut out customers with disabilities — low contrast, missing image descriptions, unlabelled forms — and how to fix them.",
    quick: ["Colour contrast", "Image descriptions", "Form labels", "Page language", "Link and button names"],
    checklistTitle: "The accessibility basics checklist",
    checklistIntro: "These are the automated accessibility checks in every PagePulsar report.",
    checklist: [
      ["Readable contrast", "Text needs enough contrast against its background (WCAG asks for 4.5:1 for normal text)."],
      ["Descriptions on images", "Alt text lets screen reader users know what an image shows."],
      ["Labelled form fields", "Every input needs a label so people know what to type."],
      ["Page language set", "The lang attribute helps screen readers pronounce your content correctly."],
      ["Links and buttons with names", "\"Click here\" and icon-only buttons with no label confuse assistive technology."],
      ["Headings in order", "Clear headings let people jump through the page."],
      ["Keyboard-friendly", "Everything should work without a mouse. Automated tools can only partly test this."],
      ["Captions on video", "Captions help deaf viewers and anyone watching without sound."]
    ],
    mistakes: [
      ["Light grey text", "It looks elegant and is unreadable for many people."],
      ["Menus as images", "Screen readers can't read them at all."],
      ["Placeholder-only forms", "Placeholder text disappears when typing starts and isn't a label."],
      ["Overlay widgets as a fix", "Accessibility overlays don't fix the underlying code."]
    ],
    faqs: [
      ["Will this tell me if my website is ADA compliant?", "No automated tool can confirm compliance. This checker finds common problems that are easy to fix. For legal questions, talk to a lawyer or an accessibility specialist."],
      ["What standard does it check against?", "It uses automated tests based on WCAG, the guidelines most accessibility laws point to."],
      ["How much of accessibility can be tested automatically?", "Only part of it. Things like keyboard use and how clear your content is need a human review."],
      ["Is the accessibility checker free?", "Yes, free with no signup."],
      ["Can you fix accessibility issues on my site?", "Yes. Send your report on WhatsApp for a quote, with fixes starting from $50."]
    ]
  },
  {
    slug: "ai-ready-website-checker",
    type: "general",
    focus: "ai",
    footer: "AI-ready check",
    nav: "AI ready",
    color: "lime",
    feature: true,
    title: "Is My Website AI Ready? Free AI Search Readiness Check",
    description: "Free AI-ready website check. See if ChatGPT, Claude, Perplexity and Google's AI can read your site: AI crawlers, raw text, structured data, llms.txt.",
    h1: "Is your website AI ready?",
    lead: "More customers ask AI assistants for recommendations. Check if AI search tools are allowed to read your site, and if they can understand what you offer.",
    quick: ["AI crawler access", "Text without JavaScript", "Business details (schema)", "llms.txt", "Clear contact info"],
    checklistTitle: "The AI-ready website checklist",
    checklistIntro: "These are the AI search checks in every PagePulsar report.",
    checklist: [
      ["AI crawlers allowed", "Your robots.txt shouldn't block GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot or Google-Extended unless you mean to."],
      ["Text that loads without JavaScript", "Many crawlers read raw HTML. If your words only appear after scripts run, they may see an empty page."],
      ["Business details as structured data", "LocalBusiness schema states your name, address, hours and services in a format machines read easily."],
      ["Clear name, address and phone", "Consistent contact details help AI tools match you to local questions."],
      ["Answers to common questions", "A short FAQ gives AI assistants clear answers to quote."],
      ["An llms.txt file (optional)", "A plain-text summary of your site for AI tools. No major search engine has confirmed using it yet, so we show it as information only."]
    ],
    mistakes: [
      ["Blocking every bot by accident", "A copied robots.txt can block AI crawlers you actually want."],
      ["Content locked in images", "Menus, prices and hours as images are invisible to AI and search."],
      ["JavaScript-only pages", "Some site builders render everything with scripts, which many crawlers skip."],
      ["Missing business details", "If your address and hours aren't on the page, AI tools guess — or skip you."]
    ],
    faqs: [
      ["Which AI crawlers do you check for?", "GPTBot and OAI-SearchBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot and Google-Extended."],
      ["Do I need an llms.txt file?", "It's optional. It does no harm, but no major search engine has confirmed using it, so it doesn't affect your score."],
      ["Should I block AI crawlers?", "It's your choice. Blocking them may keep your business out of AI answers; allowing them helps you get recommended."],
      ["Is the AI-ready check free?", "Yes, free with no signup."],
      ["Can you make my site AI ready?", "Yes. Send your report on WhatsApp for a quote, with fixes starting from $50."]
    ]
  }
];

export const HOME_FAQS = [
  ["Is PagePulsar really free?", "Yes. The checkup is free with no signup. You only pay if you want help fixing what it finds."],
  ["Do you need my login or password?", "No. PagePulsar only reads your public homepage, the same way a customer or Google does."],
  ["How is my score worked out?", "About 35 checks in seven areas, each weighted by how much it affects calls and bookings. Customer essentials count most. See how scoring works for the full details."],
  ["My site is on Wix, Squarespace or GoDaddy. Does it work?", "Yes. Some checks may show \"couldn't verify\" on site builders that load content with scripts, and you're never marked down for that."],
  ["Is this a legal accessibility audit?", "No. It's an automated check that finds common problems. It's not legal advice or an accessibility certification."],
  ["Who fixes the problems?", "You can fix them yourself using the plain-English tips, or send your report on WhatsApp and Shoaib will fix them, starting from $50."]
];

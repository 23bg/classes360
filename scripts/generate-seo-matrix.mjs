import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROGRAMMATIC_SOURCE_PATH = path.join(ROOT, "src", "lib", "seo", "programmatic.ts");
const OUTPUT_CSV = path.join(ROOT, "docs", "release", "SEO_PROGRAMMATIC_170_PAGES.csv");
const OUTPUT_MD = path.join(ROOT, "docs", "release", "SEO_PROGRAMMATIC_170_PAGES.md");

const LOCATION_KEYWORD = "admission crm";

const FEATURE_PAGES = [
    ["lead-management", "lead management software for coaching institutes"],
    ["student-records", "student records management software"],
    ["fee-management", "fee management software for coaching institutes"],
    ["installment-tracking", "installment tracking software for coaching"],
    ["student-portal", "student portal software for coaching institutes"],
    ["course-batch-management", "course and batch management software"],
    ["admission-pipeline", "admission pipeline management software"],
    ["enquiry-capture", "student enquiry capture software"],
    ["communication-tools", "communication tools for coaching institutes"],
    ["analytics-and-reports", "coaching institute analytics and reports"],
    ["attendance-tracking", "attendance tracking software for coaching"],
    ["exam-management", "exam management software for coaching"],
    ["progress-reports", "student progress report software"],
    ["teacher-management", "teacher management software for coaching"],
    ["sms-notifications", "sms notifications software for coaching"],
    ["mobile-app", "coaching mobile app for students"],
    ["online-admissions", "online admission software for coaching"],
    ["fee-reminders", "automated fee reminder software"],
    ["expense-tracking", "coaching institute expense tracking software"],
    ["time-table", "coaching timetable generator software"],
    ["library-management", "library management software for coaching"],
    ["mock-test", "mock test software for coaching institutes"],
    ["parent-app", "parent app software for coaching institutes"],
    ["multi-branch", "multi branch management software for coaching"],
    ["inventory", "inventory management software for coaching"],
    ["payroll", "payroll software for coaching institutes"],
    ["data-security", "student data security software for coaching"],
    ["custom-reports", "custom reports software for coaching"],
    ["website-integration", "website integration software for coaching"],
    ["whatsapp-integration", "whatsapp integration for coaching institutes"],
];

const INDUSTRY_PAGES = [
    ["crm-for-jeeneet-coaching", "crm for jee neet coaching"],
    ["crm-for-neet-coaching", "crm for neet coaching"],
    ["crm-for-upsc-coaching", "crm for upsc coaching"],
    ["crm-for-mpsc-coaching", "crm for mpsc coaching"],
    ["crm-for-gate-coaching", "crm for gate coaching"],
    ["crm-for-ssc-coaching", "crm for ssc coaching"],
    ["crm-for-banking-exam-coaching", "crm for banking exam coaching"],
    ["crm-for-foundation-course", "crm for foundation course coaching"],
    ["crm-for-engineering-coaching", "crm for engineering coaching"],
    ["crm-for-medical-coaching", "crm for medical coaching"],
    ["crm-for-commerce-coaching", "crm for commerce coaching"],
    ["crm-for-language-classes", "crm for language classes"],
    ["crm-for-competitive-exams", "crm for competitive exams"],
    ["crm-for-cat-coaching", "crm for cat coaching"],
    ["crm-for-clat-coaching", "crm for clat coaching"],
    ["crm-for-ca-cs-coaching", "crm for ca cs coaching"],
    ["crm-for-ielts-coaching", "crm for ielts coaching"],
    ["crm-for-pte-coaching", "crm for pte coaching"],
    ["crm-for-spoken-english", "crm for spoken english coaching"],
    ["crm-for-kids-coaching", "crm for kids coaching"],
];

const PROBLEM_PAGES = [
    ["track-coaching-enquiries", "track coaching enquiries"],
    ["manage-student-admissions", "manage student admissions for coaching"],
    ["automate-fee-collection", "automate fee collection for coaching"],
    ["reduce-student-dropouts", "reduce student dropouts in coaching"],
    ["manage-coaching-operations", "manage coaching institute operations"],
    ["handle-batch-conflicts", "handle batch conflicts in coaching"],
    ["improve-parent-communication", "improve parent communication in coaching"],
    ["digitize-student-records", "digitize student records for coaching"],
    ["why-coaching-needs-crm", "why coaching institutes need crm"],
    ["problems-with-manual-admission-process", "problems with manual admission process"],
    ["increase-coaching-enrollments", "increase coaching enrollments"],
    ["stop-manual-data-entry", "stop manual data entry in coaching"],
    ["track-coaching-finances", "track coaching institute finances"],
    ["manage-study-material", "manage study material for coaching"],
    ["conduct-online-tests", "conduct online tests for coaching"],
    ["improve-student-performance", "improve student performance in coaching"],
    ["automate-followups", "automate followups for coaching admissions"],
    ["handle-peak-admissions", "handle peak admission season"],
    ["manage-multiple-branches", "manage multiple coaching branches"],
    ["build-coaching-sales-pipeline", "build coaching admissions pipeline"],
];

const TIER1_PRIORITY = new Set([
    "delhi",
    "new delhi",
    "gurgaon",
    "noida",
    "mumbai",
    "pune",
    "kolkata",
    "chennai",
    "bangalore",
    "hyderabad",
    "ahmedabad",
]);

const TIER2_PRIORITY = new Set([
    "jaipur",
    "lucknow",
    "kanpur",
    "nagpur",
    "indore",
    "bhopal",
    "patna",
    "ranchi",
    "bhubaneswar",
    "chandigarh",
    "ludhiana",
    "amritsar",
    "guwahati",
    "kochi",
    "kozhikode",
    "thiruvananthapuram",
    "coimbatore",
    "madurai",
    "visakhapatnam",
    "vijayawada",
    "mysore",
    "nashik",
    "aurangabad",
    "vadodara",
    "surat",
    "rajkot",
    "kota",
    "udaipur",
    "tirupati",
    "warangal",
    "jabalpur",
    "gwalior",
    "jodhpur",
    "dehradun",
]);

function normalizeText(value) {
    return String(value || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function toSlug(value) {
    return normalizeText(value)
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function toTitleCase(value) {
    return normalizeText(value)
        .toLowerCase()
        .split(" ")
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(" ");
}

function cap(value, max) {
    return value.length <= max ? value : `${value.slice(0, max - 3).trim()}...`;
}

function seoTitle(keyword, suffix = "| Classes360") {
    return cap(`${toTitleCase(keyword)} ${suffix}`, 60);
}

function metaDescription(keyword, context) {
    return cap(
        `Classes360 helps coaching institutes ${context} with ${keyword}. Manage enquiries, admissions, students and fees. Book a demo today.`,
        160,
    );
}

function locationOutline(keyword, city) {
    return [
        `H1: ${toTitleCase(`${keyword} in ${city}`)}`,
        `H2: Why coaching institutes in ${city} need a dedicated CRM`,
        "H3: Common admission and follow-up bottlenecks",
        "H3: Impact of fragmented tools on conversions",
        "H2: How Classes360 helps manage leads, students, and fees",
        "H3: Enquiry capture and pipeline automation",
        "H3: Student records, batches, and installment tracking",
        "H2: FAQs for coaching institutes",
        "H2: Book a demo",
    ].join(" || ");
}

function featureOutline(feature) {
    return [
        `H1: ${toTitleCase(feature)}`,
        "H2: Problems this feature solves for coaching institutes",
        "H2: How the workflow works in Classes360",
        "H3: Setup and configuration",
        "H3: Day-to-day team usage",
        "H2: Reporting and outcomes",
        "H2: FAQs and next steps",
    ].join(" || ");
}

function industryOutline(industry) {
    return [
        `H1: ${toTitleCase(industry)}`,
        "H2: Operational challenges in this coaching segment",
        "H2: Workflow playbook for enquiries to admissions",
        "H3: Segment-specific pipeline stages",
        "H3: Batch and fee models",
        "H2: KPI dashboard for owners",
        "H2: FAQs and demo CTA",
    ].join(" || ");
}

function problemOutline(problem) {
    return [
        `H1: ${toTitleCase(problem)}`,
        "H2: Root cause analysis",
        "H2: Step-by-step solution using Classes360",
        "H3: Quick wins in first 7 days",
        "H3: Automation setup checklist",
        "H2: Metrics to track improvement",
        "H2: FAQs and implementation CTA",
    ].join(" || ");
}

function classifyCity(cityLower) {
    if (TIER1_PRIORITY.has(cityLower)) return "Metro/Tier 1";
    if (TIER2_PRIORITY.has(cityLower)) return "Tier 2 / Education Hub";
    return "District HQ / Major Town";
}

const programmaticSource = fs.readFileSync(PROGRAMMATIC_SOURCE_PATH, "utf8");
const cityMatches = [...programmaticSource.matchAll(/\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*state:\s*"([^"]+)"/g)];

const top100Cities = cityMatches.slice(0, 100).map((m) => {
    const city = normalizeText(m[2]);
    return {
        city,
        cityTitle: toTitleCase(city),
        cityLower: city.toLowerCase(),
        citySlug: m[1],
        state: normalizeText(m[3]),
    };
});

const rows = [];
let id = 1;

for (let i = 0; i < top100Cities.length; i += 1) {
    const city = top100Cities[i];
    const targetKeyword = `${LOCATION_KEYWORD} in ${city.cityLower}`;
    rows.push({
        id: id++,
        pageType: "Location",
        category: classifyCity(city.cityLower),
        urlSlug: `/admission-crm/${city.citySlug}`,
        targetKeyword,
        seoTitle: seoTitle(`${LOCATION_KEYWORD} in ${city.cityTitle}`),
        metaDescription: metaDescription(`${LOCATION_KEYWORD} in ${city.cityTitle}`, `in ${city.cityTitle}`),
        pageIntent: `Commercial - Coaching institutes in ${city.cityTitle} evaluating local software solutions.`,
        pageOutline: locationOutline(LOCATION_KEYWORD, city.cityTitle),
    });
}

for (const [slug, keyword] of FEATURE_PAGES) {
    rows.push({
        id: id++,
        pageType: "Feature",
        category: "Feature Deep Dive",
        urlSlug: `/features/${slug}`,
        targetKeyword: keyword,
        seoTitle: seoTitle(keyword),
        metaDescription: metaDescription(keyword, "across India"),
        pageIntent: "Commercial/Informational - Buyers evaluating feature capabilities and fit.",
        pageOutline: featureOutline(keyword),
    });
}

for (const [slug, keyword] of INDUSTRY_PAGES) {
    rows.push({
        id: id++,
        pageType: "Industry",
        category: "Vertical CRM",
        urlSlug: `/${slug}`,
        targetKeyword: keyword,
        seoTitle: seoTitle(keyword),
        metaDescription: metaDescription(keyword, "across coaching segments"),
        pageIntent: "Commercial - Segment-specific institutes comparing purpose-built CRM options.",
        pageOutline: industryOutline(keyword),
    });
}

for (const [slug, keyword] of PROBLEM_PAGES) {
    rows.push({
        id: id++,
        pageType: "Problem",
        category: "Problem/Solution",
        urlSlug: `/${slug}`,
        targetKeyword: keyword,
        seoTitle: seoTitle(keyword),
        metaDescription: metaDescription(keyword, "for coaching teams"),
        pageIntent: "Commercial/Informational - Operators seeking practical fixes for growth blockers.",
        pageOutline: problemOutline(keyword),
    });
}

if (rows.length !== 170) {
    throw new Error(`Expected 170 rows but got ${rows.length}`);
}

function csvEscape(value) {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

const headers = [
    "id",
    "pageType",
    "category",
    "urlSlug",
    "targetKeyword",
    "seoTitle",
    "metaDescription",
    "pageIntent",
    "pageOutline",
];

const csvLines = [headers.join(",")];
for (const row of rows) {
    csvLines.push(headers.map((h) => csvEscape(row[h])).join(","));
}

fs.mkdirSync(path.dirname(OUTPUT_CSV), { recursive: true });
fs.writeFileSync(OUTPUT_CSV, `${csvLines.join("\n")}\n`, "utf8");

const counts = rows.reduce(
    (acc, row) => {
        acc[row.pageType] = (acc[row.pageType] || 0) + 1;
        return acc;
    },
    {},
);

const md = [
    "# Classes360 Programmatic SEO Matrix (170 Pages)",
    "",
    "Generated from curated targets in `src/lib/seo/programmatic.ts` using `scripts/generate-seo-matrix.mjs`.",
    "",
    "## Split",
    "",
    `- Location: ${counts.Location || 0}`,
    `- Feature: ${counts.Feature || 0}`,
    `- Industry: ${counts.Industry || 0}`,
    `- Problem: ${counts.Problem || 0}`,
    "",
    "## Notes",
    "",
    "- Location pages use the top 100 cities by population after normalization/deduplication.",
    "- Slugs are ASCII-normalized to avoid diacritic/encoding issues.",
    "- Titles and meta descriptions are capped for SEO length safety.",
    "- Full matrix is available in `docs/release/SEO_PROGRAMMATIC_170_PAGES.csv`.",
    "",
].join("\n");

fs.writeFileSync(OUTPUT_MD, md, "utf8");

console.log(`Generated ${rows.length} rows.`);
console.log(`CSV: ${OUTPUT_CSV}`);
console.log(`MD:  ${OUTPUT_MD}`);

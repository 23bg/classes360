import fs from "node:fs";
import path from "node:path";

const csvPath = path.join(process.cwd(), "docs", "release", "SEO_PROGRAMMATIC_170_PAGES.csv");
const sitemapPath = path.join(process.cwd(), "src", "app", "sitemap.ts");
const programmaticPath = path.join(process.cwd(), "src", "lib", "seo", "programmatic.ts");

function parseCsvLine(line) {
    const out = [];
    let cur = "";
    let q = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];

        if (ch === '"') {
            if (q && line[i + 1] === '"') {
                cur += '"';
                i += 1;
            } else {
                q = !q;
            }
        } else if (ch === "," && !q) {
            out.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }

    out.push(cur);
    return out;
}

const csvRaw = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const header = parseCsvLine(csvRaw[0]);
const idx = {
    urlSlug: header.indexOf("urlSlug"),
    pageType: header.indexOf("pageType"),
};

const rows = csvRaw.slice(1).map(parseCsvLine);
const generatedSlugs = rows.map((r) => (r[idx.urlSlug] || "").trim()).filter(Boolean);
const generatedSet = new Set(generatedSlugs);

const sitemapRaw = fs.readFileSync(sitemapPath, "utf8");
const staticPaths = [...sitemapRaw.matchAll(/\$\{BASE_URL\}(\/[^`"'\s,}]+)/g)].map((m) => m[1]);

const programmaticRaw = fs.readFileSync(programmaticPath, "utf8");
const citySlugs = [...programmaticRaw.matchAll(/\{\s*slug:\s*"([^"]+)",\s*name:/g)].map((m) => m[1]);
const featureSlugs = [...programmaticRaw.matchAll(/FEATURE_DEEP_DIVE_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const;/gm)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
const industrySlugs = [...programmaticRaw.matchAll(/INDUSTRY_PAGE_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const;/gm)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
const problemSlugs = [...programmaticRaw.matchAll(/PROBLEM_PAGE_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const;/gm)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));

const sitemapSet = new Set([
    ...staticPaths,
    ...citySlugs.map((slug) => `/admission-crm/${slug}`),
    ...featureSlugs.map((slug) => `/features/${slug}`),
    ...industrySlugs.map((slug) => `/${slug}`),
    ...problemSlugs.map((slug) => `/${slug}`),
]);

const present = [...generatedSet].filter((slug) => sitemapSet.has(slug));
const missing = [...generatedSet].filter((slug) => !sitemapSet.has(slug));

const missingByType = {};
for (const row of rows) {
    const slug = (row[idx.urlSlug] || "").trim();
    const type = (row[idx.pageType] || "unknown").trim();
    if (!sitemapSet.has(slug)) {
        missingByType[type] = (missingByType[type] || 0) + 1;
    }
}

console.log(`generated=${generatedSet.size}`);
console.log(`sitemapIndexed=${sitemapSet.size}`);
console.log(`present=${present.length}`);
console.log(`missing=${missing.length}`);
console.log(`presentSample=${present.slice(0, 20).join(",")}`);
console.log(`missingSample=${missing.slice(0, 20).join(",")}`);
console.log(`missingByType=${JSON.stringify(missingByType)}`);

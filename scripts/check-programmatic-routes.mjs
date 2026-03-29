import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const csvPath = path.join(root, "docs", "release", "SEO_PROGRAMMATIC_170_PAGES.csv");
const appDir = path.join(root, "src", "app");

function parseCsvLine(line) {
    const out = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            out.push(current);
            current = "";
        } else {
            current += ch;
        }
    }

    out.push(current);
    return out;
}

function walkPageFiles(dir, out) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            walkPageFiles(fullPath, out);
            continue;
        }
        if (item.isFile() && item.name === "page.tsx") {
            out.push(fullPath);
        }
    }
}

function pageFileToRoute(pageFile) {
    const dir = path.relative(appDir, path.dirname(pageFile)).replace(/\\/g, "/");
    const cleaned = dir
        .split("/")
        .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
        .join("/");

    if (!cleaned) return "/";
    return `/${cleaned}`;
}

const csvLines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const header = parseCsvLine(csvLines[0]);
const urlSlugIndex = header.indexOf("urlSlug");
const pageTypeIndex = header.indexOf("pageType");

const generated = csvLines.slice(1).map(parseCsvLine).map((row) => ({
    slug: row[urlSlugIndex],
    pageType: row[pageTypeIndex],
}));

const pageFiles = [];
walkPageFiles(appDir, pageFiles);
const implementedRoutes = new Set(pageFiles.map(pageFileToRoute));

const hasCityDynamicRoute = pageFiles.some((p) => p.replace(/\\/g, "/").endsWith("/admission-crm/[city]/page.tsx"));
const hasFeatureDynamicRoute = pageFiles.some((p) => p.replace(/\\/g, "/").endsWith("/features/[featureSlug]/page.tsx"));
const hasRootSeoSlugDynamicRoute = pageFiles.some((p) => p.replace(/\\/g, "/").endsWith("/[seoSlug]/page.tsx"));

function isImplementedByPattern(slug) {
    if (implementedRoutes.has(slug)) return true;
    if (hasCityDynamicRoute && /^\/admission-crm\/[a-z0-9-]+$/.test(slug)) return true;
    if (hasFeatureDynamicRoute && /^\/features\/[a-z0-9-]+$/.test(slug)) return true;
    if (hasRootSeoSlugDynamicRoute && (/^\/crm-for-[a-z0-9-]+$/.test(slug) || /^\/[a-z0-9-]+$/.test(slug))) return true;
    return false;
}

const implemented = generated.filter((p) => isImplementedByPattern(p.slug));
const missing = generated.filter((p) => !isImplementedByPattern(p.slug));

const missingByType = {};
for (const row of missing) {
    missingByType[row.pageType] = (missingByType[row.pageType] || 0) + 1;
}

console.log(`generated=${generated.length}`);
console.log(`implemented=${implemented.length}`);
console.log(`missing=${missing.length}`);
console.log(`missingByType=${JSON.stringify(missingByType)}`);
console.log(`implementedSample=${implemented.slice(0, 20).map((x) => x.slug).join(",")}`);
console.log(`missingSample=${missing.slice(0, 20).map((x) => x.slug).join(",")}`);

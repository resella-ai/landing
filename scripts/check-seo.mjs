import { readFileSync, existsSync } from "node:fs";

const canonicalHost = "https://getresella.it";
const pages = [
  { file: "index.html", path: "/" },
  { file: "foto-prodotti-vinted/index.html", path: "/foto-prodotti-vinted/" },
  { file: "foto-prodotti-depop/index.html", path: "/foto-prodotti-depop/" },
  { file: "cos-e-resella/index.html", path: "/cos-e-resella/" },
];

const read = (file) => {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
  return readFileSync(file, "utf8");
};

const errors = [];
for (const page of pages) {
  const html = read(page.file);
  const expectedUrl = `${canonicalHost}${page.path}`;
  const canonical = html.match(/<link\\s+rel=["']canonical["']\\s+href=["']([^"']+)["']/i)?.[1];
  const ogUrl = html.match(/<meta\\s+property=["']og:url["']\\s+content=["']([^"']+)["']/i)?.[1];

  if (canonical !== expectedUrl) errors.push(`${page.file}: canonical should be ${expectedUrl}`);
  if (ogUrl !== expectedUrl) errors.push(`${page.file}: og:url should be ${expectedUrl}`);
  if (html.includes("www.getresella.it")) errors.push(`${page.file}: contains the non-canonical www host`);
  if (!/<title>[^<]+<\\/title>/i.test(html)) errors.push(`${page.file}: missing title`);
  if (!/<meta\\s+name=["']description["']\\s+content=["'][^"']+["']/i.test(html)) {
    errors.push(`${page.file}: missing meta description`);
  }

  const jsonLdBlocks = [...html.matchAll(/<script\\s+type=["']application\\/ld\\+json["']>([\\s\\S]*?)<\\/script>/gi)];
  for (const [, rawJson] of jsonLdBlocks) {
    try {
      const structuredData = JSON.parse(rawJson);
      const graph = Array.isArray(structuredData["@graph"]) ? structuredData["@graph"] : [structuredData];
      if (graph.some((item) => item["@type"] === "FAQPage")) {
        errors.push(`${page.file}: FAQPage structured data must only be used when matching FAQs are visible on the page`);
      }
      if (rawJson.includes("www.getresella.it")) errors.push(`${page.file}: structured data contains the non-canonical www host`);
    } catch {
      errors.push(`${page.file}: invalid JSON-LD`);
    }
  }
}

const robots = read("public/robots.txt");
if (!robots.includes(`Sitemap: ${canonicalHost}/sitemap.xml`)) {
  errors.push("public/robots.txt: sitemap must use the canonical host");
}
if (robots.includes("www.getresella.it")) errors.push("public/robots.txt: contains the non-canonical www host");

const sitemap = read("public/sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\\/loc>/g)].map((match) => match[1]);
const expectedSitemapUrls = pages.map(({ path }) => `${canonicalHost}${path}`);
for (const url of expectedSitemapUrls) {
  if (!sitemapUrls.includes(url)) errors.push(`public/sitemap.xml: missing ${url}`);
}
for (const url of sitemapUrls) {
  if (!url.startsWith(canonicalHost + "/")) errors.push(`public/sitemap.xml: unexpected host in ${url}`);
}
if (sitemap.includes("www.getresella.it")) errors.push("public/sitemap.xml: contains the non-canonical www host");

if (errors.length) {
  for (const error of errors) console.error(`SEO check failed: ${error}`);
  process.exit(1);
}

console.log("SEO checks passed: canonical URLs, Open Graph URLs, JSON-LD, robots.txt and sitemap are consistent.");

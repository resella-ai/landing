import { readFileSync, existsSync } from "node:fs";

const required = [
  ["index.html", "https://www.getresella.it/"],
  ["index.html", "name=\"description\""],
  ["index.html", "property=\"og:title\""],
  ["index.html", "name=\"twitter:card\""],
  ["index.html", "application/ld+json"],
  ["public/robots.txt", "Sitemap: https://www.getresella.it/sitemap.xml"],
  ["public/sitemap.xml", "<loc>https://www.getresella.it/</loc>"],
  ["public/sitemap.xml", "<loc>https://www.getresella.it/foto-prodotti-vinted/</loc>"],
  ["public/sitemap.xml", "<loc>https://www.getresella.it/foto-prodotti-depop/</loc>"],
  ["public/foto-prodotti-vinted/index.html", "rel=\"canonical\""],
  ["public/foto-prodotti-vinted/index.html", "<h1>"],
  ["public/foto-prodotti-depop/index.html", "rel=\"canonical\""],
  ["public/foto-prodotti-depop/index.html", "<h1>"],
];

let failed = false;
for (const [file, token] of required) {
  if (!existsSync(file) || !readFileSync(file, "utf8").includes(token)) {
    console.error(`SEO check failed: ${file} is missing "${token}"`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log("SEO landing-page checks passed.");

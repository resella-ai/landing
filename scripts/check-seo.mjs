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
  ["foto-prodotti-vinted/index.html", "rel=\"canonical\""],
  ["foto-prodotti-vinted/index.html", "Foto per Vinted: immagini curate"],
  ["foto-prodotti-vinted/index.html", "id=\"root\""],
  ["foto-prodotti-depop/index.html", "rel=\"canonical\""],
  ["foto-prodotti-depop/index.html", "Foto per Depop: flat lay"],
  ["foto-prodotti-depop/index.html", "id=\"root\""],
  ["src/App.jsx", "seo-landing-box"],
  ["src/App.jsx", "Foto per Vinted, curate in pochi passaggi."],
  ["src/App.jsx", "Foto flat lay curate per i tuoi annunci Depop."],
  ["cos-e-resella/index.html", "AboutPage"],
  ["cos-e-resella/index.html", "Resella è uno strumento basato sull"],
  ["src/App.jsx", "function AboutResellaPage()"],
  ["public/sitemap.xml", "<loc>https://www.getresella.it/cos-e-resella/</loc>"],
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

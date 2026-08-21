import { readFile } from 'node:fs/promises';

const pages = ['index.html', 'form.html', 'about.html', 'contact.html', 'results.html', 'share.html', 'analytics.html', 'loading.html', 'error.html', '404.html', 'favorites.html'];
const failures = [];

// WCAG 2.1 relative luminance + contrast ratio — real math, not a substring grep.
function relativeLuminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)].map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(hexA, hexB) {
  const [lA, lB] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (lA + 0.05) / (lB + 0.05);
}

// Text-color tokens checked against --bg. 4.5:1 is the WCAG AA minimum for normal text.
const TEXT_TOKENS = ['--ink', '--ink-mute', '--ink-faint', '--accent'];
const MIN_CONTRAST = 4.5;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (!html.includes('<html lang="en">')) failures.push(`${file}: missing lang=en`);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${file}: missing title`);
  if (h1Count !== 1) failures.push(`${file}: expected 1 h1, found ${h1Count}`);
  if (!html.includes('<link rel="canonical"')) failures.push(`${file}: missing canonical`);
  if (!html.includes('meta name="description"')) failures.push(`${file}: missing description`);
  if (!html.includes('og:title')) failures.push(`${file}: missing og:title`);
  if (!html.includes('og:description')) failures.push(`${file}: missing og:description`);
  if (!html.includes('og:image')) failures.push(`${file}: missing og:image`);
  if (!html.includes('rel="manifest"')) failures.push(`${file}: missing web-app manifest link`);
  if (!/focus-visible/.test(html)) failures.push(`${file}: missing focus-visible styling`);
  if (!/prefers-reduced-motion/.test(html)) failures.push(`${file}: missing prefers-reduced-motion handling`);
  if (!/<main\b/.test(html)) failures.push(`${file}: missing <main> landmark`);

  const bgMatch = html.match(/--bg:\s*(#[0-9a-fA-F]{6})/);
  if (bgMatch) {
    const bg = bgMatch[1];
    for (const token of TEXT_TOKENS) {
      const re = new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`);
      const m = html.match(re);
      if (!m) continue; // token not defined on this page — nothing to check
      const ratio = contrastRatio(bg, m[1]);
      if (ratio < MIN_CONTRAST) {
        failures.push(`${file}: ${token} (${m[1]}) on --bg (${bg}) contrast ${ratio.toFixed(2)}:1 — below WCAG AA ${MIN_CONTRAST}:1`);
      }
    }
  }
}

const robots = await readFile('robots.txt', 'utf8');
const sitemap = await readFile('sitemap.xml', 'utf8');
if (!robots.includes('Sitemap:')) failures.push('robots.txt: missing sitemap');
for (const route of ['/', '/about', '/contact', '/form']) {
  if (!sitemap.includes(`cinematch-navy.vercel.app${route}`)) failures.push(`sitemap.xml: missing ${route}`);
}

const source = await Promise.all(pages.map(file => readFile(file, 'utf8')));
const combined = source.join('\n');
if (/api[_-]?key\s*[:=]\s*["'][^"']+["']/i.test(combined)) failures.push('client HTML: possible hardcoded API key');
if (combined.includes('http://api.')) failures.push('client HTML: insecure API URL');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`site checks passed: ${pages.length} pages, metadata, headings, crawl files, WCAG contrast math, and client secret scan`);

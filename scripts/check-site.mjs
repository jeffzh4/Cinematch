import { readFile } from 'node:fs/promises';

const pages = ['index.html', 'form.html', 'about.html', 'contact.html', 'results.html', 'share.html', 'analytics.html', 'loading.html', 'error.html', '404.html'];
const publicPages = new Set(['index.html', 'form.html', 'about.html', 'contact.html']);
const failures = [];

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
  if (publicPages.has(file) && !html.includes('og:image')) failures.push(`${file}: missing og:image`);
  if (!html.includes('rel="manifest"')) failures.push(`${file}: missing web-app manifest link`);
  if (!/focus-visible/.test(html)) failures.push(`${file}: missing focus-visible styling`);
  if (!/prefers-reduced-motion/.test(html)) failures.push(`${file}: missing prefers-reduced-motion handling`);
  if (!/<main\b/.test(html)) failures.push(`${file}: missing <main> landmark`);
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

console.log(`site checks passed: ${pages.length} pages, metadata, headings, crawl files, and client secret scan`);

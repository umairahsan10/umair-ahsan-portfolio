/**
 * Visual QA: screenshots + console error capture against a running preview server.
 * Usage: npm run preview (separate terminal) then: node scripts/qa.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.QA_URL ?? 'http://localhost:4173/';
const OUT = 'qa-screenshots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const errors = [];

const watch = (page, label) => {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
};

const settle = (page, ms = 900) => page.waitForTimeout(ms);

/* ---------- Desktop dark ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  watch(page, 'desktop-dark');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 1600);
  await page.screenshot({ path: `${OUT}/01-hero-dark.png` });

  for (const [i, id] of ['about', 'skills', 'experience', 'projects'].entries()) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await settle(page);
    await page.screenshot({ path: `${OUT}/0${i + 2}-${id}-dark.png` });
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(page);
  await page.screenshot({ path: `${OUT}/06-footer-dark.png` });
  await ctx.close();
}

/* ---------- Desktop light ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  await ctx.addInitScript(() => localStorage.setItem('theme', 'light'));
  const page = await ctx.newPage();
  watch(page, 'desktop-light');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 1600);
  await page.screenshot({ path: `${OUT}/07-hero-light.png` });
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: `${OUT}/08-skills-light.png` });
  await ctx.close();
}

/* ---------- Mobile ---------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    colorScheme: 'dark',
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  watch(page, 'mobile');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 1600);
  await page.screenshot({ path: `${OUT}/09-hero-mobile.png` });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await settle(page, 500);
  await page.screenshot({ path: `${OUT}/10-menu-mobile.png` });
  await ctx.close();
}

/* ---------- Reduced motion ---------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  watch(page, 'reduced-motion');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 600);
  const heroOpacity = await page
    .locator('#home h1')
    .evaluate((el) => getComputedStyle(el).opacity);
  await page.screenshot({ path: `${OUT}/11-hero-reduced-motion.png` });
  console.log(`reduced-motion h1 opacity: ${heroOpacity}`);
  await ctx.close();
}

/* ---------- Functional checks ---------- */
const checks = [];
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  watch(page, 'functional');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 1200);

  // 1. Theme toggle applies + persists (done first — nav is visible at page top)
  await page.click('button[aria-label*="theme"]');
  await settle(page, 500);
  const cls = await page.evaluate(() => document.documentElement.className);
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  checks.push(['theme toggle applies light', cls.includes('light'), `class="${cls}"`]);
  checks.push(['theme toggle persists', stored === 'light', `stored=${stored}`]);
  await page.screenshot({ path: `${OUT}/12-hero-light-toggled.png` });

  // 2. Lenis anchors: nav link scrolls + hash updates
  await page.click('nav a[href="#projects"]');
  await settle(page, 2000);
  const hash = new URL(page.url()).hash;
  const scrolled = await page.evaluate(() => window.scrollY);
  checks.push(['anchor scroll updates hash', hash === '#projects', `hash=${hash}`]);
  checks.push(['anchor scroll moves page', scrolled > 500, `scrollY=${Math.round(scrolled)}`]);

  // 3. Scrollspy active link
  const spyActive = await page.locator('nav a[aria-current="true"]').count();
  checks.push(['scrollspy marks active section', spyActive >= 1, `activeLinks=${spyActive}`]);

  // 4. Navbar reappears after scrolling up (hide-on-scroll behaviour)
  await page.mouse.wheel(0, -900);
  await settle(page, 1200);
  const navBox = await page.locator('nav').boundingBox();
  checks.push(['navbar reappears on scroll up', !!navBox && navBox.y > -40, `navY=${navBox ? Math.round(navBox.y) : 'n/a'}`]);
  await ctx.close();
}

// Mobile menu closes on navigation
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    colorScheme: 'dark',
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  watch(page, 'functional-mobile');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(page, 1200);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await settle(page, 400);
  await page.locator('#mobile-menu a[href="#about"]').click();
  await settle(page, 1600);
  const menuCount = await page.locator('#mobile-menu').count();
  const hash2 = new URL(page.url()).hash;
  checks.push(['mobile menu closes after nav', menuCount === 0, `menus=${menuCount}`]);
  checks.push(['mobile anchor scroll', hash2 === '#about', `hash=${hash2}`]);
  await ctx.close();
}

console.log('\n=== FUNCTIONAL CHECKS ===');
for (const [name, pass, detail] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} — ${name} (${detail})`);

await browser.close();

if (errors.length) {
  console.log('\n=== CONSOLE / PAGE ERRORS ===');
  errors.forEach((e) => console.log(e));
} else {
  console.log('\nNo console or page errors captured.');
}
console.log(`\nScreenshots saved to ./${OUT}`);

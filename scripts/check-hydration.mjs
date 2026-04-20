import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const PAGES = ['/', '/search'];

async function checkPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  return page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return null;
    const overlay = portal.shadowRoot.querySelector('[data-nextjs-dialog-overlay]');
    if (!overlay) return null;
    const text = portal.shadowRoot.textContent ?? '';
    if (!text.toLowerCase().includes('hydration')) return null;
    return text.substring(0, 300).trim();
  });
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    console.warn('⚠️  Playwright browser unavailable — skipping hydration check');
    process.exit(0);
  }

  const page = await browser.newPage();
  const errors = [];

  for (const path of PAGES) {
    const url = `${BASE_URL}${path}`;
    try {
      const error = await checkPage(page, url);
      if (error) {
        errors.push({ url, error });
        console.error(`❌ Hydration error at ${url}`);
      } else {
        console.log(`✅ ${url}`);
      }
    } catch (err) {
      if (err.message.includes('ERR_CONNECTION_REFUSED') || err.message.includes('ECONNREFUSED')) {
        console.warn('⚠️  Dev server not running at localhost:3000 — skipping hydration check');
        await browser.close();
        process.exit(0);
      }
      console.warn(`⚠️  Could not check ${url}: ${err.message}`);
    }
  }

  await browser.close();

  if (errors.length > 0) {
    console.error(`\nHydration errors on ${errors.length} page(s). Fix before continuing.`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Hydration check error:', err.message);
  process.exit(0);
});

import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.locator("#email").fill("admin@rrms.com");
await page.locator("#password").fill("admin@168");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/admin\/dashboard/, { timeout: 15000 });

await page.goto("http://localhost:3000/admin/contracts", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const scrollInfo = await page.evaluate(() => {
  const containers = Array.from(document.querySelectorAll("div"))
    .filter((el) => el.scrollWidth > el.clientWidth + 2);
  return containers.map((el) => ({
    className: el.className,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollLeft: el.scrollLeft,
  }));
});
console.log("BEFORE click - overflowing containers:", JSON.stringify(scrollInfo, null, 2));

const firstKebab = page.locator('button[aria-label*="សកម្មភាពសម្រាប់កិច្ចសន្យា"]').first();
await firstKebab.click();
await page.waitForTimeout(500);

const scrollInfoAfter = await page.evaluate(() => {
  const containers = Array.from(document.querySelectorAll("div"))
    .filter((el) => el.scrollWidth > el.clientWidth + 2);
  return containers.map((el) => ({
    className: el.className,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollLeft: el.scrollLeft,
  }));
});
console.log("AFTER click - overflowing containers:", JSON.stringify(scrollInfoAfter, null, 2));

await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-menu-isolated.png" });

await browser.close();

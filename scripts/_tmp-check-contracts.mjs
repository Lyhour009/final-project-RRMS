import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const consoleErrors = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + err.message));

await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.locator("#email").fill("admin@rrms.com");
await page.locator("#password").fill("admin@168");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/admin\/dashboard/, { timeout: 15000 });

await page.goto("http://localhost:3000/admin/contracts", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-light.png" });

// Hover the date range to check the tooltip renders
const dateCell = page.locator("table tbody tr").first().locator("td").nth(2);
await dateCell.hover();
await page.waitForTimeout(600);
await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-tooltip.png" });

// Hover the payment-day header
await page.mouse.move(0, 0);
await page.waitForTimeout(200);
const dueDayHeader = page.locator("th", { hasText: "ថ្ងៃបង់" });
await dueDayHeader.hover();
await page.waitForTimeout(600);
await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-header-tooltip.png" });

// Open the kebab menu
await page.mouse.move(0, 0);
const firstKebab = page.locator('button[aria-label*="សកម្មភាពសម្រាប់កិច្ចសន្យា"]').first();
await firstKebab.click();
await page.waitForTimeout(400);
await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-menu.png" });
await page.keyboard.press("Escape");

// Dark mode
await page.evaluate(() => { localStorage.setItem("theme", "dark"); });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad\\contracts-dark.png" });

console.log("consoleErrors:", JSON.stringify(consoleErrors, null, 2));
await browser.close();

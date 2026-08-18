import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const SCRATCH = "C:\\Users\\ASUS\\AppData\\Local\\Temp\\claude\\d--Code-NEXTJS-my-rms\\bb95749a-c303-4bed-85cd-60f511116a5e\\scratchpad";

const PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const testImgPath = path.join(SCRATCH, "test-proof.png");
fs.writeFileSync(testImgPath, Buffer.from(PNG_B64, "base64"));

const results = [];
const pass = (name) => { results.push(`PASS: ${name}`); console.log("PASS:", name); };
const fail = (name, detail) => { results.push(`FAIL: ${name} :: ${detail}`); console.log("FAIL:", name, "::", detail); };
const step = (name) => { console.log("STEP:", name); };

const consoleErrors = [];

function uniq(prefix) {
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

async function main() {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(page.url() + " :: " + msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(page.url() + " :: PAGEERROR: " + err.message));
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "prompt") await dialog.accept("QA test rejection reason");
    else await dialog.accept();
  });

  async function login(email, password, waitUrl) {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(400);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(waitUrl, { timeout: 20000 });
    await page.waitForTimeout(600);
  }

  async function selectOption(triggerIndex, optionText) {
    await page.locator('[data-slot="select-trigger"]').nth(triggerIndex).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: optionText, exact: false }).first().click();
    await page.waitForTimeout(200);
  }

  // Click a save/submit button inside the open dialog and wait for the dialog to
  // actually close (server action + revalidate can take well over 1s), instead of
  // a fixed sleep which was proving too short and causing false failures.
  async function saveAndWaitClose(buttonName = "រក្សាទុក") {
    await page.getByRole("button", { name: buttonName }).click();
    await page.locator('[role="dialog"]').first().waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
  }

  // All 6 delete modals share the same "កំពុងលុប..." pending-button text.
  // On success the whole dialog unmounts; on a blocked delete the dialog stays
  // open but the button reverts from the pending text back to idle. Waiting
  // for that pending text to disappear covers both outcomes reliably.
  async function openDeleteMenuAndConfirm(row, actionAriaLabelSubstr) {
    await row.locator(`button[aria-label*="${actionAriaLabelSubstr}"]`).click();
    await page.waitForTimeout(300);
    await page.getByRole("menuitem", { name: "លុប" }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /លុប/ }).last().click();
    await page.waitForTimeout(200);
    await page.getByText("កំពុងលុប...").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
  }

  step("login as admin");
  await login("admin@rrms.com", "admin@168", /admin\/dashboard/);

  // ---------- TEST A: Room delete with NO history -> should SUCCEED ----------
  step("TEST A: create + delete room with no history");
  const roomA = uniq("QA-A");
  await page.goto("http://localhost:3000/admin/rooms", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមបន្ទប់" }).click();
  await page.waitForTimeout(400);
  await page.locator('input[placeholder="ឧទាហរណ៍៖ 006"]').fill(roomA);
  await selectOption(0, "បន្ទប់គ្រែមួយ");
  await page.locator('input[type="number"]').last().fill("150");
  await saveAndWaitClose();
  let bodyText = await page.locator("body").innerText();
  if (bodyText.includes(roomA)) pass("Create room A (no history)");
  else fail("Create room A (no history)", "room number not found after create");

  const roomARow = page.locator("tr", { hasText: roomA });
  await openDeleteMenuAndConfirm(roomARow, "សកម្មភាពសម្រាប់បន្ទប់");
  bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(roomA)) pass("Delete room A (no history) succeeds");
  else fail("Delete room A (no history) succeeds", "room still present after delete attempt");

  // ---------- TEST B: Room delete WITH contract history -> should be BLOCKED ----------
  step("TEST B: room + tenant + contract, then blocked room delete");
  const roomB = uniq("QA-B");
  const tenantB = uniq("QaTenantB");
  await page.goto("http://localhost:3000/admin/rooms", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមបន្ទប់" }).click();
  await page.waitForTimeout(400);
  await page.locator('input[placeholder="ឧទាហរណ៍៖ 006"]').fill(roomB);
  await selectOption(0, "បន្ទប់គ្រែមួយ");
  await page.locator('input[type="number"]').last().fill("180");
  await saveAndWaitClose();

  await page.goto("http://localhost:3000/admin/tenants", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមអ្នកជួល" }).click();
  await page.waitForTimeout(400);
  const dialog = page.locator('[role="dialog"]');
  const inputs = dialog.locator("input:not([type=file])");
  await inputs.nth(0).fill(tenantB);
  await inputs.nth(1).fill(`${tenantB.toLowerCase()}@example.com`);
  await inputs.nth(2).fill("099" + Date.now().toString().slice(-7));
  await inputs.nth(3).fill("QaTest#2026Demo");
  await saveAndWaitClose();
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB)) pass("Create tenant B");
  else fail("Create tenant B", "tenant not found after create");

  await page.goto("http://localhost:3000/admin/contracts", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមកិច្ចសន្យា" }).click();
  await page.waitForTimeout(400);
  await selectOption(0, tenantB);
  await selectOption(1, roomB);
  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill("2026-01-01");
  await dateInputs.nth(1).fill("2026-12-31");
  await saveAndWaitClose();
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB) && bodyText.includes(roomB)) pass("Create contract B (tenant B / room B)");
  else fail("Create contract B (tenant B / room B)", "contract row not found after create");

  await page.goto("http://localhost:3000/admin/rooms", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const roomBRow = page.locator("tr", { hasText: roomB });
  await openDeleteMenuAndConfirm(roomBRow, "សកម្មភាពសម្រាប់បន្ទប់");
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(roomB)) pass("Delete room B (has contract) correctly BLOCKED");
  else fail("Delete room B (has contract) correctly BLOCKED", "room B disappeared - guard did not block delete!");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // ---------- TEST C: Bill create, then delete with NO payment -> should SUCCEED ----------
  step("TEST C: bill with no payment, delete succeeds");
  await page.goto("http://localhost:3000/admin/billing", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមវិក្កយបត្រ" }).click();
  await page.waitForTimeout(400);
  await selectOption(0, tenantB);
  await page.locator('input[type="month"]').fill("2026-03");
  const meterInputs = page.locator('[role="dialog"] input[type="number"]');
  await meterInputs.nth(0).fill("100");
  await meterInputs.nth(1).fill("110");
  await meterInputs.nth(2).fill("200");
  await meterInputs.nth(3).fill("220");
  await saveAndWaitClose();
  // Admin billing table renders billing_month via formatKhmerDate() (e.g. "មីនា 2026"
  // for March), not the raw "2026-03" string, so match on the tenant name + Khmer month.
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB) && bodyText.includes("មីនា 2026")) pass("Create bill (2026-03) for contract B");
  else fail("Create bill (2026-03) for contract B", "bill row not found after create");

  const bill03Row = page.locator("tr", { hasText: tenantB }).filter({ hasText: "មីនា 2026" });
  await openDeleteMenuAndConfirm(bill03Row, "សកម្មភាពសម្រាប់វិក្កយបត្ររបស់");
  const bill03StillThere = await page.locator("tr", { hasText: tenantB }).filter({ hasText: "មីនា 2026" }).count();
  if (bill03StillThere === 0) pass("Delete bill (no payment) succeeds");
  else fail("Delete bill (no payment) succeeds", "bill for មីនា 2026 still present");

  // ---------- TEST D: Bill + payment -> delete bill BLOCKED ----------
  step("TEST D: bill with payment, delete blocked");
  await page.goto("http://localhost:3000/admin/billing", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "បន្ថែមវិក្កយបត្រ" }).click();
  await page.waitForTimeout(400);
  await selectOption(0, tenantB);
  await page.locator('input[type="month"]').fill("2026-04");
  const meterInputs2 = page.locator('[role="dialog"] input[type="number"]');
  await meterInputs2.nth(0).fill("110");
  await meterInputs2.nth(1).fill("120");
  await meterInputs2.nth(2).fill("220");
  await meterInputs2.nth(3).fill("240");
  await saveAndWaitClose();
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB) && bodyText.includes("មេសា 2026")) pass("Create bill (2026-04) for contract B");
  else fail("Create bill (2026-04) for contract B", "bill row not found after create");

  await page.goto("http://localhost:3000/admin/payments", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "កត់ត្រាការទូទាត់" }).click();
  await page.waitForTimeout(400);
  await selectOption(0, tenantB);
  await selectOption(1, "ABA");
  await saveAndWaitClose();
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB)) pass("Record payment for 2026-04 bill");
  else fail("Record payment for 2026-04 bill", "payment row not found after create");

  await page.goto("http://localhost:3000/admin/billing", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const bill04Row = page.locator("tr", { hasText: tenantB }).filter({ hasText: "មេសា 2026" });
  await openDeleteMenuAndConfirm(bill04Row, "សកម្មភាពសម្រាប់វិក្កយបត្ររបស់");
  const bill04StillThere = await page.locator("tr", { hasText: tenantB }).filter({ hasText: "មេសា 2026" }).count();
  if (bill04StillThere > 0) pass("Delete bill 2026-04 (has payment) correctly BLOCKED");
  else fail("Delete bill 2026-04 (has payment) correctly BLOCKED", "bill disappeared - guard did not block delete!");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // ---------- TEST E: Payment approve ----------
  step("TEST E: approve payment");
  await page.goto("http://localhost:3000/admin/payments", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const pendingPaymentRow = page.locator("tr", { hasText: tenantB });
  const approveBtn = pendingPaymentRow.getByRole("button", { name: "អនុម័ត" });
  if (await approveBtn.count()) {
    await approveBtn.click();
    await page.waitForTimeout(1200);
    pass("Approve payment for tenant B (clicked, no crash)");
  } else {
    fail("Approve payment for tenant B", "approve button not found");
  }

  // ---------- TEST F: Contract delete guard (has bill -> BLOCKED) ----------
  step("TEST F: contract with bill, delete blocked");
  await page.goto("http://localhost:3000/admin/contracts", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const contractBRow = page.locator("tr", { hasText: tenantB });
  await openDeleteMenuAndConfirm(contractBRow, "សកម្មភាពសម្រាប់កិច្ចសន្យារបស់");
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes(tenantB)) pass("Delete contract B (has bill) correctly BLOCKED");
  else fail("Delete contract B (has bill) correctly BLOCKED", "contract disappeared - guard did not block delete!");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // ---------- TEST G: Maintenance start -> resolve ----------
  step("TEST G: maintenance start -> resolve");
  await page.goto("http://localhost:3000/admin/maintenance", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const startBtn = page.getByRole("button", { name: "ចាប់ផ្តើម" }).first();
  if (await startBtn.count()) {
    await startBtn.click();
    await page.waitForTimeout(1200);
    pass("Start a pending maintenance request (clicked, no crash)");
    const resolveBtn = page.getByRole("button", { name: "រួចរាល់" }).first();
    if (await resolveBtn.count()) {
      await resolveBtn.click();
      await page.waitForTimeout(1200);
      pass("Resolve an in-progress maintenance request (clicked, no crash)");
    } else {
      fail("Resolve maintenance request", "no resolve button found after starting");
    }
  } else {
    fail("Start maintenance request", "no pending request with start button found");
  }

  console.log("--- ADMIN PHASE COMPLETE, CONSOLE ERRORS SO FAR:", consoleErrors.length, "---");

  // ======================================================================
  step("login as tenant");
  await login("sok.samnang@demo.rrms.local", "Tenant#2026Demo", /tenant\/dashboard/);

  step("TEST H: tenant submits payment with proof upload");
  await page.goto("http://localhost:3000/tenant/payments", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const hasUnpaidForm = await page.locator("form").filter({ hasText: "ជ្រើសរើសវិក្កយបត្រ" }).count();
  if (hasUnpaidForm) {
    await page.locator('input[type="file"][name="proof_image"]').setInputFiles(testImgPath);
    await page.locator('input[name="note"]').fill("QA automated payment test");
    await page.getByRole("button", { name: "ខ្ញុំបានបង់ប្រាក់រួចហើយ" }).click();
    await page.waitForTimeout(2000);
    pass("Submit tenant payment with proof upload (form processed without crash)");
  } else {
    console.log("No unpaid bill available for tenant payment test - skipping");
  }

  step("verify proof image renders on admin side");
  await page.goto("http://localhost:3000/admin/payments", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const proofLink = page.locator("a", { hasText: "មើលបង្កាន់ដៃ" }).first();
  if (await proofLink.count()) {
    const href = await proofLink.getAttribute("href");
    const resp = await page.request.get(href);
    if (resp.ok()) pass("Payment proof image URL resolves (status " + resp.status() + ")");
    else fail("Payment proof image URL resolves", "status " + resp.status());
  } else {
    console.log("No proof-image link found on admin payments page to verify");
  }

  await browser.close();
}

main()
  .catch((err) => {
    console.log("FATAL ERROR:", err.message);
  })
  .finally(() => {
    console.log("=== RESULTS SUMMARY (" + results.length + ") ===");
    console.log(results.join("\n"));
    console.log("=== CONSOLE ERRORS (" + consoleErrors.length + ") ===");
    console.log(JSON.stringify(consoleErrors, null, 2));
  });

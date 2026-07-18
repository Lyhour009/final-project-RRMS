import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("RLS prevents tenants from promoting their own profile", () => {
  const sql = read("supabase/rls-policies.sql");
  const profileUpdate = sql.slice(
    sql.indexOf('drop policy if exists "profiles_update_self_or_admin"'),
    sql.indexOf("-- Inserts/deletes on profiles"),
  );

  assert.match(profileUpdate, /using \(public\.is_admin\(\)\)/);
  assert.doesNotMatch(profileUpdate, /id = auth\.uid\(\) or/);
  assert.match(sql, /auth\.jwt\(\) -> 'app_metadata' ->> 'role'/);
});

test("browser clients cannot insert arbitrary notifications", () => {
  const sql = read("supabase/rls-policies.sql");
  const actions = read("src/actions/notifications.ts");
  const serverHelper = read("src/lib/notifications.ts");

  assert.doesNotMatch(sql, /create policy "notifications_insert_authenticated"/);
  assert.doesNotMatch(actions, /export async function createNotification/);
  assert.match(serverHelper, /import "server-only"/);
});

test("service-role client cannot enter a client bundle", () => {
  const adminClient = read("src/lib/supabase/admin.ts");
  assert.match(adminClient, /^import "server-only"/);
  assert.match(adminClient, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("production security headers are configured", () => {
  const config = read("next.config.ts");
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /frame-ancestors 'none'/);
});

test("production migration preserves records and enforces payment integrity", () => {
  const migration = read("supabase/migrations/202607180001_production_hardening.sql");

  assert.match(migration, /create table if not exists public\.audit_logs/);
  assert.match(migration, /create unique index if not exists contracts_one_active_per_room/);
  assert.match(migration, /create unique index if not exists bills_one_per_contract_month/);
  assert.match(migration, /create or replace function public\.decide_payment/);
  assert.match(migration, /for update/);
  assert.match(migration, /archived_at timestamptz/);
  assert.doesNotMatch(migration, /delete from public\.(bills|payments|contracts)/i);
});

test("private document buckets and scheduled status sync are protected", () => {
  const migration = read("supabase/migrations/202607180001_production_hardening.sql");
  const cron = read("src/app/api/cron/status-sync/route.ts");

  assert.match(migration, /\('tenants', 'tenants', false, 5242880/);
  assert.match(migration, /\('payment-proofs', 'payment-proofs', false, 5242880/);
  assert.match(cron, /CRON_SECRET/);
  assert.match(cron, /timingSafeEqual/);
});

test("password recovery callback prevents open redirects", () => {
  const callback = read("src/app/auth/callback/route.ts");

  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /requestedNext\.startsWith\("\/"\)/);
  assert.match(callback, /!requestedNext\.startsWith\("\/\/"\)/);
});

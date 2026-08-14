# Production deployment runbook

Do not publish the application until every blocking item below passes. Keep a
database backup before applying SQL or deploying application code.

## 1. Database backup and migration

1. Create an on-demand Supabase database backup. Confirm point-in-time recovery
   or scheduled backups are enabled for the project plan.
2. Export the current remote schema so a new environment can be reproduced:

   ```bash
   npx supabase db dump --linked --schema public,storage --file supabase/remote-schema.sql
   ```

   Review that export before committing it because it may contain project-specific
   schema details. It must not contain secrets or table data.
3. Run `supabase/rls-policies.sql` in the Supabase SQL Editor.
4. Run `supabase/migrations/202607180001_production_hardening.sql`.

The migration intentionally stops if existing data violates the new uniqueness
rules. Review duplicates before retrying; do not silently delete financial data.
Useful preflight queries:

```sql
select room_id, count(*) from public.contracts
where status = 'active' group by room_id having count(*) > 1;

select tenant_id, count(*) from public.contracts
where status = 'active' group by tenant_id having count(*) > 1;

select contract_id, billing_month, count(*) from public.bills
group by contract_id, billing_month having count(*) > 1;

select bill_id, count(*) from public.payments
where status = 'pending' group by bill_id having count(*) > 1;
```

## 2. Authentication and email

- Disable public sign-up. Tenant accounts must be created by an administrator.
- Set the Supabase Site URL to the production origin.
- There is no self-service password recovery; reset a forgotten password with
  `scripts/reset-admin-password.ts` or from the Supabase Auth dashboard.
- Require passwords of at least eight characters and enable leaked-password
  protection if available on the Supabase plan.
- Enable MFA for the owner/admin account in the Supabase and hosting dashboards.

## 3. Environment variables

Set these only in the hosting provider; never put real values in Git:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` (long random value)
- `NEXT_PUBLIC_APP_URL` (the public HTTPS origin)

Rotate the service-role key immediately if it has ever appeared in logs, chat,
screenshots, source control, or client-side code.

## 4. Storage and scheduled work

The migration keeps `room-images` public and makes `tenants` and
`payment-proofs` private. All three buckets allow JPEG, PNG, and WebP files up to
5 MB. Confirm these values in the Supabase Storage dashboard.

`vercel.json` schedules `/api/cron/status-sync` daily at 00:05 UTC (07:05 in
Asia/Bangkok). Vercel sends `CRON_SECRET` automatically. On another host,
configure an equivalent authenticated GET request. Alert on any non-2xx result.

## 5. Verification before traffic

Run locally against the production Supabase project using a dedicated tenant
test account that contains no real personal data:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:e2e
npm run verify:production
```

For authenticated browser isolation tests, set `E2E_TENANT_EMAIL` and
`E2E_TENANT_PASSWORD`. For the live database verifier, set
`DEPLOYMENT_TEST_TENANT_EMAIL` and `DEPLOYMENT_TEST_TENANT_PASSWORD`.

After deployment verify:

- `/api/health` returns HTTP 200 without exposing secrets.
- An unauthenticated visitor is redirected to `/login` from admin/tenant pages.
- A tenant cannot open an admin route or read another tenant's records.
- Create a bill, submit an exact payment, reject it with a reason, submit again,
  approve it, and confirm the bill becomes paid exactly once.
- Archive/delete actions remove records from normal screens but retain their
  entries in `audit_logs`.
- The next cron execution succeeds and overdue late fees are not applied twice.

## 6. Monitoring and rollback

- Add an uptime monitor for `/api/health` and error monitoring for server and
  browser exceptions. Keep sensitive record contents out of telemetry.
- Configure alerts for database/storage usage, failed Auth email delivery, and
  scheduled-job failures.
- Keep the previous hosting deployment available for instant application
  rollback. Database migrations are forward-only: restore from the confirmed
  backup only for a severe migration failure, because restoring discards newer
  production writes.
- Document who can access Supabase, hosting, DNS, and backups. Remove unused
  accounts and require MFA.

## Launch decision

The codebase is ready to stage only after the automated checks pass. It is ready
for public traffic only after the live SQL, Auth, SMTP, storage, backup, and
monitoring checks above are confirmed in their external dashboards.

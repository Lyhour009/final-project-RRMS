# Supabase change order

This repository currently starts from an existing Supabase project; the base
table definitions were originally created remotely. For the current project:

1. Apply `rls-policies.sql`.
2. Apply files under `migrations/` in filename order.
3. Run `npm run verify:production` with a dedicated tenant test account.

Before creating a second environment, export and review a schema-only baseline
as described in `docs/DEPLOYMENT.md`. Never place the service-role key or a data
dump containing tenant information in this directory.

# Public repository checklist

Use this checklist before pushing RRMS to a public GitHub repository.

## Safe to commit

- Application source under `src/`
- UI components, actions, hooks, and validation schemas
- `package.json` and `package-lock.json`
- `.env.example`
- `README.md`
- `docs/`
- `supabase/rls-policies.sql`
- `supabase/migrations/`
- `.github/workflows/`
- `vercel.json`
- Test files under `tests/`

## Do not commit

- `.env.local`, `.env`, `.env.production`, or any file containing real secrets
- Supabase service-role keys
- Private SMTP credentials
- Real tenant names, phone numbers, emails, identity documents, or payment proof images
- Database dumps containing data
- Supabase storage exports
- Build output folders such as `.next/`, `out/`, `coverage/`, and Playwright reports

## Check before push

Run:

```bash
git status --short
git ls-files .env .env.local .env.production .env.development
rg -n "service_role|SUPABASE_SERVICE_ROLE_KEY|password|secret|sk-|eyJ" --glob "!node_modules/**" --glob "!.next/**" --glob "!.git/**"
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected result:

- `git ls-files` should not show real env files.
- Secret search should not show real key values.
- Lint, TypeScript, tests, and build should pass.

## If a secret was exposed

1. Rotate the key or password in the provider dashboard.
2. Update the local `.env.local` and hosting environment variables.
3. Do not rely on deleting the line from Git history as the only fix.
4. Re-run the checklist above before pushing again.

## Suggested first public push

```bash
git add README.md docs/PUBLIC_REPO_CHECKLIST.md .env.example docs/DEPLOYMENT.md supabase/README.md supabase/rls-policies.sql supabase/migrations .github vercel.json src tests scripts package.json package-lock.json tsconfig.json next.config.ts
git status --short
git commit -m "Prepare project for public release"
git push origin main
```

Review `git status --short` before committing. This project currently has many changed files, so only commit files you intentionally want public.

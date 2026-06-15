# CODEX

## Workspace

- Frontend: `D:\asa\jmr-textile\frontend`
- Backend: `D:\asa\jmr-textile\backend`
- Front stack: Next.js App Router + TypeScript
- Backend stack: CodeIgniter 4 + JWT auth

## Auth and roles

- The temporary admin shortcut has been removed.
- Real login now goes only through backend auth.
- Main roles in the project are `admin`, `worker`, and `user`.
- Admin and worker should not use the client profile entry in the main navbar.
- `/admin-backoffice/*` is still present for compatibility, but Next redirects it to `/backoffice/*`.

## HR / employees flow

- Main employee creation page:
  - `app/backoffice/employees/new/AddEmployeePage.tsx`
- Route entry points:
  - `app/backoffice/employees/new/page.tsx`
  - `app/admin-backoffice/employees/new/page.tsx`
- Front helper used by the page:
  - `app/lib/backoffice-hr-api.ts`
- Front proxy that forwards authenticated requests to backend:
  - `app/api/backoffice/hr/[...path]/route.ts`

## Backend HR endpoints

- Controller:
  - `backend/app/Controllers/Hr.php`
- Service:
  - `backend/app/Application/Hr/HrService.php`
- Routes live in:
  - `backend/app/Config/Routes.php`

Current HR endpoints exposed by backend:

- `GET /api/hr/lookups/{lookup}`
- `GET /api/hr/departements/{id}/postes`
- `GET /api/hr/departements/{id}/manager`
- `POST /api/hr/employes`

These HR routes are protected for authenticated admin users.

## Employee persistence

- Employee records are currently stored in:
  - `backend/writable/data/hr/employes.json`
- This is intentional for real testing without introducing a full HR database schema yet.
- The service already blocks duplicate `email`, `cin`, and `matricule`.

## Important files touched

- `app/components/navbar.tsx`
- `app/components/auth-access-section.tsx`
- `app/actions/auth.ts`
- `app/lib/auth.ts`
- `app/lib/auth-server.ts`
- `app/backoffice/layout.tsx`
- `app/admin-backoffice/layout.tsx`

## Verification notes

- Targeted ESLint on the modified frontend files passes.
- Global `npm run lint` still fails because of older unrelated files already present in the repo.
- PHP syntax checks passed for the new backend HR files and role updates.

## Useful commands

- Front lint (targeted):
  - `npx eslint app/components/auth-access-section.tsx app/components/navbar.tsx app/mon-profil/page.tsx app/actions/auth.ts app/actions/index.ts app/backoffice/layout.tsx app/admin-backoffice/layout.tsx app/backoffice/employees/new/AddEmployeePage.tsx app/backoffice/employees/new/page.tsx app/admin-backoffice/employees/new/page.tsx app/api/backoffice/hr/[...path]/route.ts app/lib/backoffice-hr-api.ts`
- Front full lint:
  - `npm run lint`
- Backend syntax checks:
  - `php -l app/Controllers/Hr.php`
  - `php -l app/Application/Hr/HrService.php`

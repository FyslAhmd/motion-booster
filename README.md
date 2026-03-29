# Motion Booster

Next.js App Router project for Motion Booster platform.

## Start

```bash
npm run dev
```

App URL: http://localhost:3000

## Frontend Folder Organization

- `app/`: route-level pages, layouts, and API routes
- `app/dashboard/`: authenticated dashboard modules (one folder per module)
- `components/layout/`: global layout pieces (Header, Footer, wrappers)
- `components/sections/`: landing/public section components
- `components/ui/`: reusable UI building blocks
- `lib/`: shared utilities, auth, DB, server helpers
- `types/`: shared type declarations (legacy TS modules still in migration)

## JSX Migration (Phased)

Phase 1 complete for `dashboard/user-campaigns` frontend module:

- `app/dashboard/user-campaigns/page.tsx` -> `page.jsx`
- `app/dashboard/user-campaigns/loading.tsx` -> `loading.jsx`
- `app/dashboard/user-campaigns/[userId]/page.tsx` -> `page.jsx`

`tsconfig.json` is updated to include JS/JSX files so TS+JS can coexist during migration.

## Migration Rules

- Migrate module-by-module, not all files at once.
- Keep routes stable (`page.jsx`, `loading.jsx`, `layout.jsx`) while converting.
- Run lint after each module migration.
- Move shared UI logic to `components/ui` and module-specific pieces under each module folder.

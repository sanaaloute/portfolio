# Portfolio Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the redesigned portfolio.

## Local development

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api` and `/uploads` to the backend at http://localhost:8000.

## Build

```bash
npm run build
```

## Structure

- `src/lib/api.ts` — shared API client with auth header injection
- `src/lib/types.ts` — shared TypeScript types
- `src/context/AuthContext.tsx` — login/logout/token state
- `src/components/` — reusable UI components
- `src/pages/` — public pages
- `src/pages/admin/` — protected admin CRUD pages
- `src/components/admin/` — admin layout and image gallery

## Notes

- The refined-dark theme is forced via the `dark` class on `<html>`.
- Admin routes are protected with `ProtectedRoute`; unauthenticated users are redirected to `/login`.

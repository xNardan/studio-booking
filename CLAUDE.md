# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (--legacy-peer-deps required due to React 19 / next-themes conflict)
npm install --legacy-peer-deps

# Start dev server (http://localhost:8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

There are no tests configured in this project.

## Architecture

**Studio booking web app** for a recording studio (Flow Studio). Built with React 19 + Vite + TypeScript + Supabase + shadcn/ui + Tailwind CSS.

### Routing (`src/App.tsx`)
All routes live in `src/App.tsx` — do not move them. Route structure:
- `/` → `Index.tsx` — public landing page with booking form
- `/login` → `Login.tsx` — Supabase auth
- `/privacy-policy` → `PrivacyPolicy` component
- `/admin` → `AdminAvailability.tsx` *(protected)*
- `/admin/bookings` → `AdminBookings.tsx` *(protected)*
- `/admin/users` → `AdminUsers.tsx` *(protected)*

Protected routes are wrapped in `ProtectedRoute`, which checks Supabase session and user role from the `profiles` table.

### Backend — Supabase
The Supabase client is in `src/integrations/supabase/client.ts` (auto-generated). Import it via `src/lib/supabase.ts`:
```ts
import { supabase } from '@/lib/supabase';
```
The anon public key is intentionally hardcoded — it is safe to expose.

### Styling
Use Tailwind CSS for all styling. The `cn()` helper (`src/lib/utils.ts`) merges Tailwind classes:
```ts
import { cn } from '@/lib/utils';
```
Default theme is **dark**; theme toggling is handled by `ThemeProvider` + `next-themes`.

### UI Components
All shadcn/ui components are pre-installed in `src/components/ui/`. Do not edit them — create new components that wrap or extend them instead. Use `lucide-react` for icons.

### Path Alias
`@` maps to `src/`. Use it for all imports.

### Pages vs Components
- **Pages** (`src/pages/`): full route views, registered in `App.tsx`
- **Components** (`src/components/`): reusable pieces imported by pages
- After creating a new component, add it to the relevant page (typically `Index.tsx`) so it is visible.

### Mobile (Capacitor)
Capacitor (iOS + Android) is installed but build targets are not configured in these scripts. Native builds would require additional setup.

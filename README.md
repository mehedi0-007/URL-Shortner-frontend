# Snip — URL Shortener Frontend

A Next.js 14 frontend for the URL Shortener backend API. Dark, minimalistic design with full feature coverage.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)

## Features Covered
- ✅ Register / Login / Logout
- ✅ JWT Auth with auto-refresh (via httpOnly cookie)
- ✅ Create Short URLs with custom expiry
- ✅ Dashboard with overview stats (total, active, expired URLs, clicks)
- ✅ URL list with pagination
- ✅ Copy, Open, Extend (+24h), Regenerate short code, Delete
- ✅ Per-URL analytics (total clicks, today's clicks, top countries)
- ✅ Admin panel (platform overview + all users table)
- ✅ Profile page (view info, change password, delete account)
- ✅ Fully responsive

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. Run:
   ```bash
   npm run dev
   ```

Open [http://localhost:3001](http://localhost:3001) (or change port via `npm run dev -- -p 3001`).

## Notes
- Make sure the backend is running on the port specified in `NEXT_PUBLIC_API_URL`
- The backend sets `refreshToken` as an httpOnly cookie — ensure CORS is configured on the backend to allow `http://localhost:3001` with `credentials: true`
- For admin features, a user with `role: "admin"` is required (set in the database)

## Backend CORS
Add this to your NestJS `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

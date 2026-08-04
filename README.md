# Saludèa — Meal Prep ordering platform

Next.js 16 + Supabase app for Saludèa's meal-prep ordering flow (client site + admin
dashboard). See `.claude/plans/lazy-giggling-river.md`-style context aside, here's what's
needed to actually run this for real.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL and anon key
   (Project Settings → API).

## 2. Enable email OTP login (required for checkout)

Clients verify their email with a 6-digit code during checkout (`/commander/livraison`)
and to log back into `/compte`. Supabase sends this out of the box with its built-in
email service — no third-party account needed. One dashboard tweak is required so the
email actually shows a code instead of only a "Log In" link:

1. In Supabase → Authentication → Email Templates → **Magic Link**.
2. Add `{{ .Token }}` somewhere in the template body (e.g. "Your code: `{{ .Token }}`").
3. Save.

Supabase's built-in email sending is rate-limited (a few emails/hour) — fine for testing,
but for production traffic configure custom SMTP under Authentication → Settings.

The phone number is still collected as plain delivery/contact info in the checkout form
and stored on the client's profile — it's just no longer used to log in.

## 3. Create the storage bucket for meal photos

In Supabase → Storage, create a **public** bucket named `meal-photos`. The admin meal
editor (`/admin/repas/[id]`) uploads directly to it and stores the public URL on the meal.

## 4. Create the first admin account

There's no self-serve "become admin" flow by design. To create the first admin:

1. In Supabase → Authentication → Users, add a user with an email + password.
2. In the SQL editor: `update profiles set role = 'admin' where id = '<that user's id>';`
3. Log in at `/admin/login`.

## 5. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- Seeded meals (`supabase/seed.sql`) have their program assignment guessed/placeholder —
  reassign them for real via `/admin/repas`.
- Pricing is bundle-tier (plate count × program rate from `program_packs`), not per-meal —
  see the plan doc for why.
- Ordering is blocked outside Mon–Fri (`src/lib/business-hours.ts`, Africa/Casablanca time).

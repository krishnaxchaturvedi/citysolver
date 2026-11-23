# CitySolver backend setup

The core application now uses Supabase Auth, PostgREST and Storage from Next.js route handlers. No service-role key is exposed to the browser.

## 1. Create a Supabase project

Create a free Supabase project, then copy the Project URL and anon/public key from **Project Settings -> API**.

## 2. Configure local environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never commit `.env.local`, a service-role key, database password, or JWT secret.

## 3. Create tables and storage bucket

Open the Supabase SQL Editor and run the complete migration:

`supabase/migrations/202611240001_initial_citysolver.sql`

It creates profiles, complaints, complaint events, reward ledger, notifications, RLS policies and a private evidence bucket.

## 4. Configure authentication

In Supabase **Authentication -> URL Configuration**, set the local site URL to `http://localhost:3000` and add your deployed domain when available. For a hackathon demo, email confirmation may be disabled in the Supabase Auth provider settings; otherwise users must confirm email before login.

## 5. Assign staff roles

New accounts are citizens by default. Promote a trusted account to admin only from the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where id = 'AUTH_USER_UUID';
```

Never provide a public API endpoint for self-promotion. Create officer accounts through normal registration and update their role to `officer` from the SQL Editor.

## Implemented API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET, POST /api/complaints`
- `GET /api/complaints/:ticketId`
- `PATCH /api/admin/complaints/:ticketId`

Complaint submission validates GPS coordinates and description, uploads optional evidence to the private bucket, creates a ticket and writes a first timeline event. Staff changes are protected by the profile role and database RLS.

## Important scope

The current AI prioritisation function is a transparent rules-based baseline, not a trained ML model. Socket.IO, BullMQ, WhatsApp, DigiLocker, UPI fundraising, voice transcription, multilingual translation and offline sync still require separate provider setup and implementation. Do not present these integrations as live until credentials, callbacks and end-to-end tests are completed.

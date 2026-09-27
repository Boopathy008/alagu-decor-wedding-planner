# Alagu Decor & Wedding Planner

Premium, cinematic full-stack website for a real wedding & event planning company.

> **"Your Vision. Our Creation."**

## Stack

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Frontend   | React + TypeScript + Vite + Tailwind CSS + Framer Motion  |
| Backend    | Java + Spring Boot + Spring Security + JWT + Maven        |
| Database   | PostgreSQL (hosted on Supabase)                           |
| Images     | Cloudinary                                                |
| Hosting    | Frontend → Vercel · Backend → Railway/Fly.io/Render (spare slot) |
| Domain     | GoDaddy (DNS pointed at Vercel + backend host)             |

## Repository layout

```
alagu-decor-wedding-planner/
├── frontend/          React + TS + Vite + Tailwind + Framer Motion
├── backend/            Spring Boot (Java, Maven)
└── database/          Raw SQL schema + seed data (fixed categories)
```

## Why this architecture

- **Service structure is fixed, gallery content is dynamic.** The 7 categories and
  their sub-services are defined once, in code (`frontend/src/config/services.ts`)
  and mirrored as immutable seed rows in `database/schema.sql`. There is **no
  admin API to create/rename/delete a category or subcategory** — only
  `gallery_items` are admin-editable. This matches the spec: the business owner
  manages photos, not the site's structure.
- **One data-driven gallery engine, not seven bespoke pages.** `ServiceCategoryPage`
  is a single React route (`/services/:categorySlug`) that pulls its copy,
  services list and gallery from config + API, so all 7 category pages (and their
  filterable, masonry, lightbox galleries) come from one well-built component
  instead of 7 copies that drift out of sync.
- **Images never touch Postgres.** Only the Cloudinary URL + `public_id` are
  stored; the binary lives in Cloudinary. Deleting a gallery item deletes the
  Cloudinary asset first, then the DB row, and only that row.

## Local development

### 1. Prerequisites
- Node.js 20+
- Java 21 + Maven 3.9+
- A free Supabase project (Postgres connection string)
- A free Cloudinary account (cloud name + API key/secret)

### 2. Database
Run `database/schema.sql` against your Supabase Postgres instance (SQL editor,
or `psql "$DATABASE_URL" -f database/schema.sql`). This creates all tables and
seeds the 7 fixed categories + their subcategories. It also seeds one admin
user — **change that password immediately** (see `backend/README` note in
`AdminSeeder`).

### 3. Backend
```bash
cd backend
cp .env.example .env      # fill in real values
# Spring Boot reads env vars directly; export them or use a tool like direnv
export $(grep -v '^#' .env | xargs)
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`.

### 4. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Runs on `http://localhost:5173`.

### 5. Verify the loop
1. Open `http://localhost:5173/admin`
2. Log in with the seeded admin credentials
3. Gallery → Decorations → Add New Image → upload → publish
4. Open `http://localhost:5173/services/decorations` in another tab → the image
   appears in the public gallery.
5. Delete it from the admin — it disappears from the public gallery and from
   Cloudinary, and nothing else is touched.

## Environment variables

Never commit real secrets. `.env.example` files in `frontend/` and `backend/`
list every variable used; see those files for the authoritative list
(`WHATSAPP_NUMBER`, `INSTAGRAM_URL`, `CLOUDINARY_*`, `JWT_SECRET`,
`DATABASE_URL`, etc). The frontend `.env` only ever contains public,
non-secret configuration (API base URL, WhatsApp number, Instagram URL) — all
Cloudinary/JWT/DB secrets live only in the backend.

## Deployment (cost-conscious, no third Render service required)

- **Frontend → Vercel** (free tier): `vercel --prod` from `frontend/`, set the
  env vars from `frontend/.env.example` in the Vercel dashboard.
- **Backend → Railway or Fly.io free/hobby tier** (kept off Render since you
  already have two services there): build with `./mvnw clean package`, deploy
  the resulting jar, set the env vars from `backend/.env.example`.
- **Database → Supabase** free tier Postgres — just the connection string,
  nothing else from Supabase is used (no Supabase auth/storage).
- **Images → Cloudinary** free tier.
- **Domain → GoDaddy**: point an `A`/`CNAME` at Vercel for the apex/`www`, and a
  subdomain (e.g. `api.yourdomain.com`) at the backend host.

## What's scaffolded vs. what a real launch still needs

This repo is a genuine, wired-up implementation of every flow in the spec:
auth, JWT-protected admin CRUD, Cloudinary upload/delete, filterable masonry
galleries with a lightbox, the enquiry pipeline, SEO metadata, and the fixed
7-category/40+ subcategory structure. Before going live you will still want to:
- Drop in the company's real photography (the gallery is empty until the admin
  uploads — by design, no placeholder stock images are shipped).
- Run `npm run build` / `mvnw clean package` in CI and wire up Vercel + your
  chosen backend host's GitHub integration for auto-deploys.
- Add automated tests and a staging environment before the first production
  release.

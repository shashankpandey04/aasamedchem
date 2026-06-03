# AasaMedChem — Simple Inventory & Orders App

This repository is a small demo inventory and orders application built with Next.js (App Router), MongoDB, and Tailwind CSS. It demonstrates common patterns for product listing, order creation, basic role-based admin views, and automatic seed data for quick demos.

## Key Features

- Product listing and details
- Order form with simple unit conversions and pricing
- Lightweight role-based admin pages (controlled via query string for demo purposes)
- Automatic seed data on first run to populate sample products and users
- Simple authentication/session handling for demo workflows

## Tech Stack

- Next.js (App Router)
- MongoDB Atlas (via Mongoose)
- Tailwind CSS for styling
- Vercel for deployment

## Project Structure (high level)

- `app/` — Next.js app routes and pages
- `components/` — Reusable React components (navbars, tables, forms)
- `lib/` — Database, auth, session helpers and seed logic
- `models/` — Mongoose models for `Product`, `Order`, and `User`
- `public/` — Static assets

## Local Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` in the project root with the following variables:

- `MONGODB_URI` — MongoDB connection string
- `SESSION_SECRET` — A random string used to sign session cookies

Example `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority
SESSION_SECRET=replace-with-a-secure-random-string
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Seed Data

On first run the app will create simple demo products and users (see `lib/test-credentials.ts` and seed logic in `lib/mongodb.ts` or `lib/inventory.ts`). This makes it easy to explore admin and client flows without manual data entry.

## Routes & Usage Notes

- `/` — Landing page / product list
- `/order` — Order form
- `/admin` — Admin dashboard (for demo gating, append `?role=admin`)
- `/login` & `/signup` — Simple demo auth pages

Note: Role gating and authentication in this project are intentionally minimal for demonstration purposes and are not production-ready.

## Workflow — How it works

This section outlines the typical request flows and how the app interacts with the database and services.

- Client requests:
	- The user navigates to a page (e.g., `/` or `/order`). Next.js App Router serves the page; server components fetch data from MongoDB using the helpers in `lib/` and Mongoose models in `models/`.

- Product listing & details:
	- Server-side code queries the `Product` model to render lists and product details. Components receive product props and render UI with `components/` helpers.

- Order creation flow:
	- The order form posts data to a server action or API route. Server-side logic validates input, calculates price/units (see `lib/pricing.ts`), and creates an `Order` document via the `Order` model.
	- After successful order creation the app may decrement inventory levels in `Product` (basic updates are handled in `lib/inventory.ts`).

- Authentication & sessions:
	- Minimal demo auth uses `lib/auth.ts` and `lib/session.ts` to create sessions. On login/signup the server sets a signed session cookie using `SESSION_SECRET`.
	- Admin gating for demos is intentionally lightweight (query param `?role=admin`); replace with a proper RBAC system for production.

- Seed data & startup:
	- On initial startup the app runs seed logic (see `lib/test-credentials.ts` and seed helpers) to create demo users and products so you can try the app immediately.

- Deployment considerations:
	- In production you should secure auth flows, add proper role checks, and run inventory updates and financial calculations inside transactional or carefully guarded server-side code.

## Deployment

Deploy to Vercel or another Node-compatible host. When deploying, set the required environment variables (`MONGODB_URI`, `SESSION_SECRET`) in your hosting platform.

## Contributing

This is a demo app — contributions that improve documentation, add tests, or make authentication/authorization production-ready are welcome. Please open an issue or PR on the repository.

## Troubleshooting

- If the app cannot connect to MongoDB, verify `MONGODB_URI` and network access (IP allowlist / Atlas settings).
- If seed data does not appear, check the server logs and ensure migrations/seed code ran on server startup.

---

If you'd like, I can also:

- add a quick `Makefile` / npm scripts for common tasks,
- add a `CONTRIBUTING.md` or expand environment/config docs,
- or open a PR with improvements to auth or tests.

Updated `README.md` to be more descriptive and actionable.
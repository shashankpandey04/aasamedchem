# Simple Inventory App

## Features

- Landing page with product list
- Fake login page that routes by role in the URL
- Order form with simple unit conversion
- Admin page gated by `?role=admin`
- Automatic seed data for three demo products

## Tech Stack

- Next.js App Router
- MongoDB Atlas
- Mongoose
- Tailwind CSS
- Vercel

## Setup

1. Install dependencies with `npm install`.
2. Add `MONGODB_URI` to your environment.
3. Run `npm run dev`.

## Environment Variables

- `MONGODB_URI`

## Deployment

- Push to GitHub
- Import into Vercel
- Set `MONGODB_URI` in Vercel environment variables
- Set `SESSION_SECRET` in Vercel enviornment variables
# ◈ journal

A minimal daily journal app with Google login and a calendar interface.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...          # run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (for production)
7. Copy the **Client ID** and **Client Secret** into `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. In **Environment Variables**, add all four variables from `.env.local`
   - Set `NEXTAUTH_URL` to your Vercel URL, e.g. `https://your-app.vercel.app`
4. Deploy — Vercel will build and host it automatically

> **Note:** Journal entries are stored as JSON files on disk (`/data`). This works great for local dev and Vercel (ephemeral), but for a persistent production setup you'd want to swap in a database like PlanetScale or Supabase. For personal use, Vercel's persistence is fine since entries are also saved in the browser state during a session.

---

## Project structure

```
pages/
  index.js              ← main app (calendar + journal)
  _app.js               ← session provider wrapper
  api/
    entries.js          ← GET/POST journal entries
    auth/
      [...nextauth].js  ← Google OAuth handler
styles/
  globals.css           ← all styles
```

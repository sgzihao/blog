# TechBlog — Tech & AI Personal Knowledge Base

A Blog/Wiki personal website built on **Cloudflare Workers + Pages + D1**, running entirely on the Cloudflare edge network. The free tier is more than enough for personal use.

---

## Quick Start: Local Preview (Zero Prerequisites)

`dev.sh` is a fully automated startup script that handles everything from scratch, including installing Node.js and Wrangler. The D1 database is simulated locally — **no Cloudflare account required**.

### Supported Systems

| System | Node.js Installation Method |
|--------|---------------------------|
| macOS | Auto-installs Homebrew then Node.js |
| Ubuntu / Debian | Via NodeSource official apt repository (Node.js 20) |
| CentOS / RHEL / Fedora | Via NodeSource rpm repository (Node.js 20) |
| Other Linux | Via nvm (Node.js LTS) |

### How to Run

After extracting the project, open a terminal, navigate to the `techblog/` directory, and run:

```bash
bash dev.sh
```

The script will **automatically** complete all of the following steps:

```
[1/5] Check Node.js     -> Auto-installs if missing (macOS/Ubuntu/CentOS/Linux)
[2/5] Check Wrangler    -> Auto-installs via npm if missing
[3/5] Install deps      -> npm install for API and frontend
[4/5] Initialize DB     -> Creates local SQLite with sample categories/tags/articles
[5/5] Start services    -> Launches API + frontend in background, opens browser
```

On completion, the terminal will display:

```
  ╔════════════════════════════════════════════╗
  ║         Local preview is ready!            ║
  ╚════════════════════════════════════════════╝

  Website    ->  http://localhost:4321
  Admin      ->  http://localhost:4321/admin
  API        ->  http://localhost:8787

  Admin password  ->  dev-token-123
```

### Common Commands

```bash
bash dev.sh           # Start (auto-installs all dependencies on first run)
bash dev.sh --stop    # Stop all background services
bash dev.sh --reset   # Reset database (clears data, keeps installed tools)
```

### Local Mode Details

| Resource | Local Storage Path | Notes |
|----------|-------------------|-------|
| D1 Database | `api/.wrangler/state/v3/d1/` | Local SQLite file |
| API Logs | `.dev-logs/api.log` | Real-time output |
| Frontend Logs | `.dev-logs/frontend.log` | Real-time output |

> **Note**: Image uploads work in local preview, but uploaded image URLs cannot be previewed directly in the browser (no public HTTP service). Images will display correctly after deploying to Cloudflare.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Full Deployment Guide](#full-deployment-guide)
  - [Step 1: Create Cloudflare Resources](#step-1-create-cloudflare-resources)
  - [Step 2: Configure the API](#step-2-configure-the-api)
  - [Step 3: Initialize the Database](#step-3-initialize-the-database)
  - [Step 4: Deploy Workers API](#step-4-deploy-workers-api)
  - [Step 5: Configure and Deploy Frontend](#step-5-configure-and-deploy-frontend)
- [Local Development](#local-development)
- [Using the Admin Panel](#using-the-admin-panel)
- [FAQ](#faq)
- [Cloudflare Free Tier](#cloudflare-free-tier)

---

## Features

| Feature | Description |
|---------|-------------|
| Blog + Wiki | Dual content modes — Blog for original articles, Wiki for organized notes |
| Markdown Editor | GFM syntax, code highlighting (highlight.js), tables, task lists |
| Full-Text Search | Based on D1 FTS5, supports keyword search with highlighted excerpts |
| Categories + Tags | Multi-dimensional content organization with filtering |
| Image Upload | Drag-and-drop or click to upload, Base64 stored in D1, served via Worker |
| Admin Panel | Token authentication, article CRUD, category/tag management, statistics |
| Table of Contents | Auto-generated from Markdown headings, scroll-aware highlighting |
| Responsive Design | Dark theme, mobile-friendly, Tailwind CSS |
| Edge Deployment | Global CDN acceleration, fast cold starts, no server maintenance |

---

## Architecture

```
User Browser
    │
    ▼
Cloudflare Pages     ← Astro static frontend (Global CDN)
    │
    │  API requests (fetch)
    ▼
Cloudflare Workers   ← Hono.js backend API (Edge computing)
    │
    ▼
Cloudflare D1
(SQLite database: articles / categories / tags / images)
```

> Images are stored as Base64 in D1 and served directly via the Worker's `/api/media/:id` endpoint — no R2 needed.

**Tech Stack:**

- **Backend**: [Hono.js](https://hono.dev/) on Cloudflare Workers — lightweight, native TypeScript
- **Database**: Cloudflare D1 (SQLite) + FTS5 full-text search + media table for images
- **Frontend**: [Astro](https://astro.build/) static generation + Tailwind CSS
- **Deployment**: Cloudflare Pages (frontend) + Workers (API)

---

## Project Structure

```
techblog/
├── README.md
├── deploy.sh                          # One-click deployment script
│
├── api/                               # Cloudflare Workers backend
│   ├── wrangler.toml                  # ⚠️ Requires database_id
│   ├── package.json
│   ├── tsconfig.json
│   ├── schema.sql                     # D1 database schema + seed data
│   └── src/
│       ├── index.ts                   # Entry point, route mounting
│       ├── types.ts                   # TypeScript type definitions
│       ├── middleware/
│       │   └── auth.ts                # Bearer Token auth middleware
│       └── routes/
│           ├── articles.ts            # Public article read endpoints
│           ├── search.ts              # FTS5 full-text search endpoint
│           ├── taxonomy.ts            # Category/tag query endpoint
│           ├── admin.ts               # Admin CRUD (auth required)
│           └── upload.ts              # Image upload/serve (stored in D1)
│
└── frontend/                          # Astro frontend
    ├── astro.config.mjs
    ├── tailwind.config.mjs
    ├── wrangler.toml
    ├── package.json
    ├── .env.example                   # ⚠️ Copy to .env and fill in
    └── src/
        ├── lib/
        │   ├── api.ts                 # API client wrapper
        │   └── markdown.ts            # Markdown renderer (with code highlighting)
        ├── styles/
        │   └── global.css             # Global styles + dark theme
        ├── components/
        │   ├── Navbar.astro
        │   ├── Footer.astro
        │   ├── ArticleCard.astro
        │   └── Pagination.astro
        ├── layouts/
        │   ├── BaseLayout.astro       # HTML base structure + SEO meta
        │   └── SiteLayout.astro       # Full layout with navbar/footer
        └── pages/
            ├── index.astro            # Home page
            ├── search.astro           # Full-text search page
            ├── 404.astro              # 404 page
            ├── blog/
            │   ├── index.astro        # Blog list (with filter sidebar)
            │   └── [slug].astro       # Blog article detail (with TOC)
            ├── wiki/
            │   ├── index.astro        # Wiki list (grouped by category)
            │   └── [slug].astro       # Wiki article detail (with TOC)
            └── admin/
                └── index.astro        # Admin panel (Token login)
```

---

## Prerequisites

### Requirements

- **Node.js** 18 or above
- **npm** 9 or above (bundled with Node.js)
- **Wrangler CLI** (Cloudflare official CLI tool)
- **Cloudflare account** (free tier is fine)

### Install Wrangler and Log In

```bash
# Install Wrangler globally
npm install -g wrangler

# Log in to Cloudflare (opens browser for authorization)
wrangler login

# Verify login status
wrangler whoami
```

---

## Full Deployment Guide

### Step 1: Create Cloudflare Resources

**Create a D1 database:**

```bash
wrangler d1 create techblog-db
```

This will output something like:

```
✅ Successfully created DB 'techblog-db'
{
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "techblog-db"
}
```

⚠️ **Save this `uuid`** — you'll need it in the next step.

---

### Step 2: Configure the API

Open `api/wrangler.toml` and replace `database_id` with the uuid from the previous step:

```toml
[[d1_databases]]
binding = "DB"
database_name = "techblog-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← your uuid here
```

Also update the allowed frontend origin (CORS):

```toml
[vars]
ALLOWED_ORIGIN = "https://techblog.pages.dev"
```

**Set the admin token (secret):**

```bash
cd api
wrangler secret put ADMIN_TOKEN
# When prompted, enter a strong password (e.g., MyBlog@2025!)
# This password protects the admin endpoints — keep it safe
```

---

### Step 3: Initialize the Database

**For local preview (development):**

```bash
cd api
wrangler d1 execute techblog-db --file=./schema.sql
```

**For production (required):**

```bash
wrangler d1 execute techblog-db --remote --file=./schema.sql
```

On success, the database will create all tables and insert sample categories, tags, and 3 sample articles.

---

### Step 4: Deploy Workers API

```bash
cd api
npm install
wrangler deploy
```

After deployment, you'll get a Workers URL like:

```
✅ Deployed techblog-api to https://techblog-api.yourname.workers.dev
```

**⚠️ Save this URL** — the frontend needs it.

**Verify the API is working:**

```bash
curl https://techblog-api.yourname.workers.dev/
# Should return: {"status":"ok","service":"TechBlog API","version":"1.0.0",...}
```

---

### Step 5: Configure and Deploy Frontend

**Set environment variables:**

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file with your actual values:

```bash
# === Required: Infrastructure ===
PUBLIC_API_URL=https://techblog-api.yourname.workers.dev
PUBLIC_ADMIN_TOKEN=MyBlog@2025!

# === Site Branding (customize as needed) ===
PUBLIC_SITE_NAME=My Tech Blog
PUBLIC_SITE_DESCRIPTION=Exploring AI and technology
PUBLIC_SITE_EMOJI=🤖
PUBLIC_HERO_TITLE=My Tech Blog
PUBLIC_HERO_SUBTITLE=Ideas, notes, and documentation in one place.

# === Author / Social ===
PUBLIC_AUTHOR=Your Name
PUBLIC_AUTHOR_GITHUB=https://github.com/yourusername
PUBLIC_AUTHOR_TWITTER=https://twitter.com/yourusername
```

Also update `frontend/wrangler.toml` with your API URL and `frontend/astro.config.mjs` with your Pages domain.

**Local preview (optional):**

```bash
npm install
npm run dev
# Open http://localhost:4321 to preview
```

**Build and deploy to Pages:**

```bash
npm run build
wrangler pages deploy ./dist --project-name=techblog
```

The first deployment will ask whether to create a new project — select **Yes**.

After deployment, you'll see something like:

```
✅ Deployment complete!
https://techblog.pages.dev
```

**Update CORS configuration:**

After getting the Pages URL, go back to `api/wrangler.toml` and update `ALLOWED_ORIGIN`:

```toml
ALLOWED_ORIGIN = "https://techblog.pages.dev"
```

Then redeploy the API:

```bash
cd api
wrangler deploy
```

Your site is now fully deployed!

---

## Configuration Checklist

Before deploying, update these files with your values:

| File | What to Change |
|------|---------------|
| `api/wrangler.toml` | `database_id` (from `wrangler d1 create`), `ALLOWED_ORIGIN` (your Pages domain) |
| `api/` secret | Run `wrangler secret put ADMIN_TOKEN` |
| `frontend/.env` | Copy from `.env.example`, fill in `PUBLIC_API_URL`, `PUBLIC_ADMIN_TOKEN`, and branding |
| `frontend/wrangler.toml` | `PUBLIC_API_URL` (your Workers URL) |
| `frontend/astro.config.mjs` | `site` (your Pages domain, for sitemap/RSS) |
| `deploy.sh` | Set `PAGES_PROJECT` env var or edit the default project name |

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_URL` | Yes | Your Workers API URL |
| `PUBLIC_ADMIN_TOKEN` | Yes | Must match the ADMIN_TOKEN secret on your Workers API |
| `PUBLIC_SITE_NAME` | No | Site name shown in navbar, footer, and meta tags (default: "TechBlog") |
| `PUBLIC_SITE_DESCRIPTION` | No | SEO meta description |
| `PUBLIC_SITE_EMOJI` | No | Logo emoji used in navbar, favicon, 404 page (default: "🤖") |
| `PUBLIC_HERO_TITLE` | No | Homepage hero heading |
| `PUBLIC_HERO_SUBTITLE` | No | Homepage hero subtext |
| `PUBLIC_AUTHOR` | No | Author name in footer |
| `PUBLIC_AUTHOR_GITHUB` | No | GitHub profile link (leave blank to hide) |
| `PUBLIC_AUTHOR_TWITTER` | No | Twitter/X profile link (leave blank to hide) |

### Quick Deploy

```bash
# After configuring all files above:
bash deploy.sh all

# Or deploy individually:
bash deploy.sh api       # Deploy Workers API
bash deploy.sh db        # Initialize remote database
bash deploy.sh frontend  # Build and deploy frontend

# Custom Pages project name:
PAGES_PROJECT=myblog bash deploy.sh frontend
```

---

## Local Development

Run the API and frontend simultaneously for local development:

```bash
# Terminal 1: Start Workers API (local simulation)
cd api
npm install
wrangler dev
# API runs at http://localhost:8787

# Terminal 2: Start Astro frontend
cd frontend
npm install
# Make sure .env has PUBLIC_API_URL=http://localhost:8787
npm run dev
# Frontend runs at http://localhost:4321
```

In local development, D1 uses a local SQLite file — data is isolated from production.

**Initialize the local dev database:**

```bash
cd api
wrangler d1 execute techblog-db --file=./schema.sql
# Without --remote, this writes to the local dev database
```

---

## Using the Admin Panel

Visit `https://yourdomain.com/admin` to access the admin panel.

### Login

Enter the `ADMIN_TOKEN` you set in Step 2. The token is stored in `sessionStorage` and expires when the tab is closed.

### Writing and Publishing

1. Click the **Write** tab in the top navigation
2. Enter a title (Slug is auto-generated, or edit manually)
3. Write content in Markdown in the body area; click **Preview** for live rendering
4. In the right panel, select type (Blog / Wiki), categories, and tags
5. Drag-and-drop or click to upload a cover image (Base64 stored in D1, max 2MB)
6. Click **Publish** to publish immediately, or **Save Draft** to save

### Managing Articles

1. Switch to the **Articles** tab to view all articles
2. Filter by type (Blog/Wiki) and status (Published/Draft)
3. Click **Edit** to open the editor; republish after changes
4. Click the link icon to preview the article in a new tab
5. In edit mode, the **Danger Zone** at the bottom right allows article deletion

### Managing Categories and Tags

Switch to the **Categories/Tags** tab:

- Click **+ New Category** to add a name, slug, and color
- Click **+ New Tag** to add a name and slug
- Click the × next to a category/tag to delete it (avoid deleting those with linked articles)

### Statistics

Switch to the **Statistics** tab to view total articles, published count, drafts, total views, categories, and tags.

---

## FAQ

**Q: API requests fail with CORS errors?**

Check that `ALLOWED_ORIGIN` in `api/wrangler.toml` matches your actual frontend domain, then redeploy with `wrangler deploy`.

**Q: Image upload succeeds but images don't display?**

Images are served via the Worker's `/api/media/:id` endpoint. Make sure the Workers API is deployed correctly and `PUBLIC_API_URL` is set properly in the frontend.

**Q: Admin login shows token error?**

Verify that `PUBLIC_ADMIN_TOKEN` in `.env` exactly matches the value you entered for `wrangler secret put ADMIN_TOKEN` (case-sensitive).

**Q: Search returns no results?**

D1 FTS5 uses character-level tokenization. For best results, use short keywords (2-4 characters). For better search, consider integrating Cloudflare Vectorize for semantic search.

**Q: How to set up a custom domain?**

- **API (Workers)**: Dashboard -> Workers & Pages -> techblog-api -> Settings -> Triggers -> Custom Domains
- **Frontend (Pages)**: Dashboard -> Workers & Pages -> techblog -> Custom Domains

**Q: Images don't show in local preview after upload?**

In local preview, images are stored in local D1 and accessed via `http://localhost:8787/api/media/:id`. Make sure the API is running (`wrangler dev` is started).

**Q: `bash dev.sh` says port is in use?**

The script automatically tries to release ports. If it still fails, manually run:
```bash
lsof -ti:8787 | xargs kill -9
lsof -ti:4321 | xargs kill -9
```

**Q: How is local database data persisted?**

Data is stored in SQLite files under `api/.wrangler/state/v3/d1/`. As long as you don't run `--reset`, data is preserved.

**Q: How to update a deployed site?**

```bash
# Update API
cd api && wrangler deploy

# Update frontend
cd frontend && npm run build && wrangler pages deploy ./dist --project-name=techblog
```

---

## Cloudflare Free Tier

| Service | Free Allowance | Description |
|---------|---------------|-------------|
| Workers | 100K requests/day | API call quota |
| Pages | Unlimited requests | Frontend static assets |
| D1 | 500 MB storage, 5M row reads/day | Database |

For a personal blog/knowledge base, these limits are **more than sufficient at no cost**.

---

## API Reference

All endpoints are relative to: `https://techblog-api.yourname.workers.dev`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/articles` | List articles; supports `type/category/tag/page` params | No |
| GET | `/api/articles/:slug` | Get single article detail | No |
| GET | `/api/search?q=keyword` | Full-text search | No |
| GET | `/api/categories` | List all categories | No |
| GET | `/api/tags` | List all tags | No |
| GET | `/api/admin/articles` | List all articles (including drafts) | Yes |
| POST | `/api/admin/articles` | Create article | Yes |
| PUT | `/api/admin/articles/:slug` | Update article | Yes |
| DELETE | `/api/admin/articles/:slug` | Delete article | Yes |
| POST | `/api/admin/categories` | Create category | Yes |
| POST | `/api/admin/tags` | Create tag | Yes |
| GET | `/api/admin/stats` | Get statistics | Yes |
| POST | `/api/upload/image` | Upload image to D1 (multipart/form-data, max 2MB) | Yes |
| GET | `/api/media/:id` | Get image (returns binary directly) | No |

Authentication: Add `Authorization: Bearer <ADMIN_TOKEN>` header to requests.

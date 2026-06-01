# Davao Portal Deployment and Live Database Integration Guide

This project is configured with a fully decoupled **Vercel** serverless web hosting state and **Supabase** cloud database system. Follow these three steps to provision your online instance in under 3 minutes.

---

## 🛠️ Step 1: Initialize Your Supabase Database

1. **Create a Free Project**: Head over to [Supabase](https://supabase.com) and spin up a new PostgreSQL database.
2. **Execute Database Tables**:
   - Go to the **SQL Editor** tab on the left-hand navigation menu.
   - Paste the contents of the `supabase_schema.sql` file (found at the root of this project).
   - Click **Run** to execute the query. 
   - This instantiates two secure, Row Level Security (RLS) guarded tables: `public.resource_links` and `public.audit_logs`.

---

## ⚡ Step 2: Configure Environment Variables

Log in to your Supabase project dashboard, navigate to **Project Settings > API**, and copy the following credentials:

* **Project URL** (Map this to `VITE_SUPABASE_URL`)
* **Anon/Public API Key** (Map this to `VITE_SUPABASE_ANON_KEY`)

For local testing, place these variables inside your local `.env` file:
```env
VITE_SUPABASE_URL="https://your-custom-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🚀 Step 3: Deploy on Vercel

The portal is equipped with a custom production-ready redirection adapter (`vercel.json`) to handle React SPA router endpoints flawlessly.

1. **Push Code to Repository**: Upload your repository folder to GitHub, GitLab, or Bitbucket.
2. **Import New Project**: Navigate to the [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
3. **Link Repository**: Import your uploaded repository. Vercel automatically detects the Vite + TypeScript workspace.
4. **Input Environment Variables**:
   - Expand the **Environment Variables** subsection.
   - Add `VITE_SUPABASE_URL` alongside your Supabase Project URL.
   - Add `VITE_SUPABASE_ANON_KEY` alongside your Supabase Anon API Key.
5. **Launch**: Click **Deploy**! Once completed, Vercel will launch your live Davao Portal system on a lightning-fast SSL-enabled subdomain.

---

## 🔒 Administrative Console Security

* **Clear Slate Activated**: Any newly generated links or log events created by administrators on your live web UI will now be synced directly into the live cloud database in real-time.
* **Super Admin User**: Login using the default executive identity `werzkie.tim@callboxinc.com` to manage database records.

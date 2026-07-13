# Callbox Davao Employee Portal — Deployment & Custom Domain Manual

This manual provides production-grade instructions for deploying the **Callbox Davao Employee Portal** to popular static hosting providers, container runtimes, or private servers. It also guides you through configuring custom domain names (e.g., `portal.callboxdavao.com`), setting up SSL/TLS, and managing environment secrets.

---

## 🗄️ 1. Live Cloud Database Provisioning (Supabase)

To enable live updates and persistence for central links, announcements, policy agreements, and audit logs, configure a live Supabase project.

### Step 1.1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and sign up/log in.
2. Click **New Project** and select/create an Organization.
3. Assign a project name (e.g., `Callbox Davao Portal`), select a strong database password, and choose a region closest to your office (e.g., `Singapore - ap-southeast-1` or `Manila`).

### Step 1.2: Execute Database Tables
1. In your Supabase Dashboard, click on **SQL Editor** in the left-hand navigation.
2. Click **New Query**.
3. Open the file `supabase_schema.sql` located at the root of this project, copy its entire contents, and paste it into the editor.
4. Click **Run** (or hit `Ctrl + Enter` / `Cmd + Enter`). This initializes:
   - `public.resource_links` (stores systems hub URLs, categories, launch counts)
   - `public.audit_logs` (tracks critical supervisor actions and logins)
   - Security Policies (Row-Level Security) protecting these tables.

---

## ☁️ 2. Web Hosting Deployment Methods

Since the app is a fast, highly-optimized client-side Single Page Application (built via Vite and React), it is compatible with all static hosting providers.

### Option A: Vercel (Recommended)
Vercel is the easiest and most robust host for Vite-based SPAs.
1. **Push Code**: Commit your files and push them to a private GitHub, GitLab, or Bitbucket repository.
2. **Import Project**: Log into [Vercel](https://vercel.com), click **Add New > Project**, and select your repository.
3. **Configure Build Settings**:
   - Vercel automatically detects Vite.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Expand the section and add your Supabase credentials:
   - `VITE_SUPABASE_URL` = *(Your Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY` = *(Your Supabase Public API Key)*
5. **Deploy**: Click **Deploy**. Vercel will build the app and assign a `*.vercel.app` temporary subdomain.

*Note: The included `vercel.json` file in your root folder automatically ensures that all client-side router endpoints route back to `index.html` on refresh, preventing 404 errors.*

---

### Option B: Netlify
Netlify provides instant builds and simple custom domain integration.
1. **Connect Repository**: Log into [Netlify](https://netlify.com) and click **Add new site > Import an existing project**.
2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. **Environment Variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under the Site Configuration tab.
4. **Deploy**: Trigger a production deployment.

*Note: The included `/public/_redirects` file automatically maps all incoming traffic back to `/index.html` with a 200 response, supporting smooth React subroute navigation.*

---

### Option C: GitHub Pages
Ideal for simple hosting directly inside your organization’s GitHub workspace.
1. Install the pages deploy tool: `npm install -D gh-pages`
2. Add a `homepage` parameter in your `package.json`:
   ```json
   "homepage": "https://<your-org-name>.github.io/<your-repo-name>"
   ```
3. Add deploy scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Run `npm run deploy` to publish the site to the `gh-pages` branch.

---

### Option D: Containerized Deployment (Docker / Google Cloud Run / AWS / VPS)
If you wish to host the static build in a secure Docker container behind your company's own reverse proxies:

1. **Create a `Dockerfile`** at the root of your project:
   ```dockerfile
   # --- Build Stage ---
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   ARG VITE_SUPABASE_URL
   ARG VITE_SUPABASE_ANON_KEY
   ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
   ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
   RUN npm run build

   # --- Production Stage ---
   FROM nginx:stable-alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   # Custom Nginx config to support SPA routing
   RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build the Container Image**:
   ```bash
   docker build \
     --build-arg VITE_SUPABASE_URL="https://your-proj.supabase.co" \
     --build-arg VITE_SUPABASE_ANON_KEY="your-anon-key" \
     -t callbox-portal:latest .
   ```
3. **Run the Container**:
   ```bash
   docker run -d -p 8080:80 callbox-portal:latest
   ```

---

## 🌐 3. Custom Domain & DNS Configuration

Once your web application is deployed to a web host (like Vercel or Netlify), you can link it to your own custom organizational domain (e.g., `portal.callboxdavao.com` or `callboxdavao-portal.com`).

### Step 3.1: Add the Domain in your Web Host
1. **On Vercel**: Navigate to **Project Settings > Domains**. Type your desired domain (e.g., `portal.callboxdavao.com`) and click **Add**.
2. **On Netlify**: Navigate to **Site configuration > Domain management > Custom domains**. Click **Add custom domain**.

### Step 3.2: Configure DNS Settings
Log in to your Domain Registrar dashboard (e.g., GoDaddy, Namecheap, Google Domains, Cloudflare, or Route 53) where your domain is managed, and create the following records in your DNS Management interface:

#### For a Subdomain (e.g., `portal.callboxdavao.com`) — Recommended
Create a **CNAME Record** to map the subdomain traffic directly to your web hosting provider's servers.

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `portal` | `cname.vercel-dns.com.` *(or Netlify's domain endpoint)* | 3600 (or Auto) |

#### For an Apex Domain (e.g., `callboxdavao-portal.com`)
If you are deploying on the primary root domain itself, create an **A Record** pointing to your host's IP address.

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` *(Vercel IP)* or `104.198.14.238` *(Netlify IP)* | 3600 (or Auto) |
| **CNAME** | `www` | `cname.vercel-dns.com.` *(or netlify endpoint)* | 3600 |

### Step 3.3: Automatic SSL/TLS Certificates
Static web hosts like Vercel, Netlify, and Cloudflare Pages automatically handle SSL/TLS certificate issuing and renewals.
- Once you complete the DNS mapping step, the provider will request a free Let's Encrypt certificate.
- Within 10–30 minutes of updating your DNS, your domain will start serving traffic securely over HTTPS (`https://portal.callboxdavao.com`).

---

## 🛡️ 4. Security & Post-Deployment Checklist

1. **Protect Employee Data (Robots.txt)**: A `robots.txt` file has been added to the `/public` directory of this project. It is pre-configured with `Disallow: /` to ensure search engines do not index names, emails, and internal corporate software links.
2. **Enable CORS in Supabase**: Go to **Supabase > Database > API Settings** and ensure your CORS settings restrict requests to your authorized custom domain to prevent external scripts from querying your database.
3. **Supervisor Authentication**: The default manager credentials configured for Super Admin privileges are mapped in the codebase to:
   - Email: `werzkie.tim@callboxinc.com` (use the preconfigured supervisor bypass code in your login screen, or configure live OAuth once your domain is active).
4. **Continuous Integration**: We recommend turning on Vercel/Netlify's git integration. Every time you push an update to your `main` branch, the portal will build and deploy changes to your live custom domain instantly.

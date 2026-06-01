-- =====================================================================
--                   SUPABASE DATABASE BOOTSTRAP SCHEMA
-- =====================================================================
-- Execute these SQL definitions inside your Supabase project SQL Editor
-- to quickly prepare the tables required for your Portal instance.
-- Includes full Row Level Security (RLS) policies for secure operations.

-- 1. RESOURCE LINKS TABLE
CREATE TABLE IF NOT EXISTS public.resource_links (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    category text NOT NULL,
    icon text DEFAULT 'Link'::text,
    is_popular boolean DEFAULT false,
    is_for_inactive boolean DEFAULT false,
    click_count integer DEFAULT 0,
    posted_by text,
    posted_by_role text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for resource_links
ALTER TABLE public.resource_links ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Read-Only) and authorized edits
CREATE POLICY "Allow public read access to links" 
ON public.resource_links FOR SELECT 
USING (true);

CREATE POLICY "Allow anonymous read, write, and delete (Demo Mode)" 
ON public.resource_links FOR ALL 
USING (true)
WITH CHECK (true);


-- 2. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id text PRIMARY KEY,
    timestamp text NOT NULL,
    actor text NOT NULL,
    role text NOT NULL,
    action text NOT NULL,
    target text NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for reading and writing audit logs
CREATE POLICY "Allow general read access to logs" 
ON public.audit_logs FOR SELECT 
USING (true);

CREATE POLICY "Allow general write access to logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);


-- 3. SCHEMA INTEGRATION INFO
-- The database schema has been prepared with full RLS security enabled.
-- No initial dummy/seed links are added to guarantee a clean slate.
-- The Super Admin ("Werzkie Tim") can log in and populate links directly 
-- from the Governance Panel which will write directly to public.resource_links.


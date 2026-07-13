/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Network, Database, FolderGit2, CalendarRange, Workflow, ShieldCheck, Cpu 
} from 'lucide-react';

interface SitemapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SitemapOverlay({ isOpen, onClose }: SitemapOverlayProps) {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'schema' | 'folder' | 'flows'>('sitemap');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-locked');
      document.documentElement.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative h-full w-full max-w-4xl overflow-y-auto border-l border-white/10 bg-brand-dark p-6 sm:p-8 text-brand-light shadow-2xl"
          id="structural-sitemap-drawer"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
              <span className="font-mono text-xs tracking-widest text-brand-primary uppercase">Architecture Center</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Portal Blueprint & Technical Specifications</h2>
            <p className="text-sm text-gray-400 mt-1">
              UX mapping, physical database relationships, enterprise folder structure, and flow states.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
            {[
              { id: 'sitemap', label: 'UX Sitemap', icon: Network },
              { id: 'schema', label: 'Database Schema', icon: Database },
              { id: 'folder', label: 'Folder Architecture', icon: FolderGit2 },
              { id: 'flows', label: 'User Journeys', icon: Workflow },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-brand-primary text-brand-dark font-semibold' 
                      : 'text-gray-400 hover:text-brand-light hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="mt-4">
            {activeTab === 'sitemap' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-brand-surface/50 p-5">
                  <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-primary" /> Application Navigation Hierarchy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 bg-black/30 p-4 rounded-lg">
                      <h4 className="font-mono text-xs text-brand-primary font-bold mb-2">🔐 PUBLIC SPHERE</h4>
                      <ul className="space-y-1.5 font-mono text-xs text-gray-400">
                        <li>• Landing Page / Introducing Gateway</li>
                        <li>• Supabase Auth Module (Login Form)</li>
                        <li>• Forgot Password Panel (Secure Mail Setup)</li>
                      </ul>
                    </div>
                    <div className="border border-white/5 bg-black/30 p-4 rounded-lg">
                      <h4 className="font-mono text-xs text-green-400 font-bold mb-2">🛡️ PROTECTED WORKSPACE (Session Required)</h4>
                      <ul className="space-y-1.5 font-mono text-xs text-gray-400">
                        <li>• Primary Portal Dashboard (Welcome, Alerts)</li>
                        <li>• Quick Launch Pad & Favorited Launchers</li>
                        <li>• Smart System Catalog (Search, Category Filters)</li>
                        <li>• Internal Feed (News posts, Calibrations)</li>
                        <li>• Content Box (Upload SOPs, Handbooks, HR logs)</li>
                        <li>• Settings Area (User specs, session controls)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-brand-surface/50 p-5 font-mono">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Access-Control Permissions Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-brand-primary">
                          <th className="py-2">System Module</th>
                          <th className="py-2">Employee</th>
                          <th className="py-2">HR Manager</th>
                          <th className="py-2">Super Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-2 text-gray-300 font-medium">Link Hub - Quick Launch</td>
                          <td className="py-2 text-green-400">✓ Read / Favorite</td>
                          <td className="py-2 text-green-400">✓ Read / Favorite</td>
                          <td className="py-2 text-green-400">✓ Full Access</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 text-gray-300 font-medium">Internal News Center</td>
                          <td className="py-2 text-green-400">✓ Read / Comment</td>
                          <td className="py-2 text-yellow-400">✓ Write Announcements</td>
                          <td className="py-2 text-green-400">✓ Full Manage / Delete</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 text-gray-300 font-medium">Resource Library Docs</td>
                          <td className="py-2 text-green-400">✓ Read / Download</td>
                          <td className="py-2 text-yellow-400">✓ Write Policies / SOPs</td>
                          <td className="py-2 text-green-400">✓ Full Repository Editor</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-300 font-medium">User Database / Audit Stream</td>
                          <td className="py-2 text-red-500">✗ Blocked</td>
                          <td className="py-2 text-red-500">✗ Blocked</td>
                          <td className="py-2 text-green-400">✓ Full System Oversight</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-brand-surface/50 p-5 font-mono text-xs">
                  <h3 className="font-display font-semibold text-base text-brand-secondary mb-3 flex items-center gap-2 not-mono">
                    <Database className="h-4 w-4 text-brand-primary" /> Core PostgreSQL Schema Definition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 bg-black/40 p-3 rounded">
                      <div className="text-brand-primary font-bold border-b border-white/10 pb-1 mb-2">1. employees (Core staff & admin roster)</div>
                      <ul className="space-y-1 text-gray-400">
                        <li>• <b className="text-gray-200">id:</b> text PRIMARY KEY</li>
                        <li>• <b className="text-gray-200">name:</b> text</li>
                        <li>• <b className="text-gray-200">email:</b> text UNIQUE</li>
                        <li>• <b className="text-gray-200">position:</b> text</li>
                        <li>• <b className="text-gray-200">department:</b> text</li>
                        <li>• <b className="text-gray-200">role:</b> text DEFAULT 'Employee'</li>
                        <li>• <b className="text-gray-200">avatar_url:</b> text</li>
                        <li>• <b className="text-gray-200">phone:</b> text</li>
                        <li>• <b className="text-gray-200">emp_id:</b> text UNIQUE</li>
                        <li>• <b className="text-gray-200">joined_date:</b> text</li>
                        <li>• <b className="text-gray-200">gender:</b> text</li>
                        <li>• <b className="text-gray-200">password:</b> text</li>
                        <li>• <b className="text-gray-200">created_at:</b> timestamp</li>
                      </ul>
                    </div>

                    <div className="border border-white/5 bg-black/40 p-3 rounded">
                      <div className="text-brand-primary font-bold border-b border-white/10 pb-1 mb-2">2. resource_links</div>
                      <ul className="space-y-1 text-gray-400">
                        <li>• <b className="text-gray-200">id:</b> uuid PRIMARY KEY</li>
                        <li>• <b className="text-gray-200">title:</b> varchar(100)</li>
                        <li>• <b className="text-gray-200">description:</b> text</li>
                        <li>• <b className="text-gray-200">url:</b> text</li>
                        <li>• <b className="text-gray-200">category:</b> link_category</li>
                        <li>• <b className="text-gray-200">icon_key:</b> varchar(50)</li>
                        <li>• <b className="text-gray-200">click_count:</b> integer DEFAULT 0</li>
                        <li>• <b className="text-gray-200">created_at:</b> timestamp with timezone</li>
                      </ul>
                    </div>

                    <div className="border border-white/5 bg-black/40 p-3 rounded">
                      <div className="text-brand-primary font-bold border-b border-white/10 pb-1 mb-2">3. announcements</div>
                      <ul className="space-y-1 text-gray-400">
                        <li>• <b className="text-gray-200">id:</b> uuid PRIMARY KEY</li>
                        <li>• <b className="text-gray-200">title:</b> varchar(255)</li>
                        <li>• <b className="text-gray-200">content:</b> text</li>
                        <li>• <b className="text-gray-200">category:</b> varchar(50)</li>
                        <li>• <b className="text-gray-200">author_id:</b> uuid REFERENCES profiles(id)</li>
                        <li>• <b className="text-gray-200">is_pinned:</b> boolean DEFAULT false</li>
                        <li>• <b className="text-gray-200">created_at:</b> timestamp with timezone</li>
                      </ul>
                    </div>

                    <div className="border border-white/5 bg-black/40 p-3 rounded">
                      <div className="text-brand-primary font-bold border-b border-white/10 pb-1 mb-2">4. audit_logs</div>
                      <ul className="space-y-1 text-gray-400">
                        <li>• <b className="text-gray-200">id:</b> uuid PRIMARY KEY</li>
                        <li>• <b className="text-gray-200">actor_name:</b> varchar</li>
                        <li>• <b className="text-gray-200">role_used:</b> varchar</li>
                        <li>• <b className="text-gray-200">action_taken:</b> text</li>
                        <li>• <b className="text-gray-200">target_object:</b> text</li>
                        <li>• <b className="text-gray-200">timestamp:</b> timestamp DEFAULT now()</li>
                        <li>• <b className="text-gray-200">status_flag:</b> varchar(20)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-brand-surface border-brand-primary/20 p-4 font-mono text-xs">
                  <div className="text-brand-primary font-bold mb-2">Row Level Security (RLS) Rules:</div>
                  <pre className="text-gray-400 overflow-x-auto whitespace-pre-wrap">
{`-- Only HR or Super Admin can insert/delete links
CREATE POLICY "HR systems editor" ON resource_links
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('HR', 'Super Admin')));

-- All logged in employees can read all catalog rows
CREATE POLICY "Davao employees reading catalog" ON resource_links
  FOR SELECT TO authenticated
  USING (true);`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'folder' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-brand-surface/50 p-5">
                  <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-brand-primary" /> Next.js 15 App Router Directory Mockup
                  </h3>
                  <div className="font-mono text-xs text-gray-300 border border-white/5 bg-black/35 p-4 rounded-lg overflow-x-auto leading-relaxed">
                    <div>📁 <strong className="text-brand-primary">callbox-dvo-portal/</strong></div>
                    <div className="pl-4">├── 📁 .github/ <span className="text-gray-500"># Action protocols</span></div>
                    <div className="pl-4">├── 📁 app/ <span className="text-gray-500"># Next.js 15 App Router</span></div>
                    <div className="pl-6">├── 📁 (auth)/ <span className="text-gray-500"># Guest login layout grouping</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 login/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Client-side validation for portal entry</span></div>
                    <div className="pl-6">├── 📁 (portal)/ <span className="text-gray-500"># Auth portal shell middleware</span></div>
                    <div className="pl-8">├── layout.tsx <span className="text-gray-500"># Premium workspace navigation & global context</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 dashboard/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Personalized hero, quick access cards</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 link-hub/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Searchable, filtered systems categorizer</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 news/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Company announcements and notice postings</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 resources/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Document vault, SOP downloading</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 profile/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># Avatar, contact edits, activity details</span></div>
                    <div className="pl-8 text-yellow-300">├── 📁 admin/</div>
                    <div className="pl-10">└── page.tsx <span className="text-gray-500"># KPI dashboard, analytics, audit stream</span></div>
                    <div className="pl-6">└── page.tsx <span className="text-gray-500"># Main entry gateway redirector</span></div>
                    <div className="pl-4">├── 📁 components/ <span className="text-gray-500"># Atomized visual cards, panels, and modal grids</span></div>
                    <div className="pl-4">├── 📁 lib/ <span className="text-gray-500"># Supabase client declarations, helper functions</span></div>
                    <div className="pl-4">├── 📁 types/ <span className="text-gray-500"># Unified type definitions</span></div>
                    <div className="pl-4">├── tailwind.config.ts <span className="text-gray-500"># High-end color branding configuration</span></div>
                    <div className="pl-4">└── package.json <span className="text-gray-500"># Next 15, React 19, Framer Motion, Supabase SDK</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-brand-surface/40 p-4">
                  <h4 className="font-display font-medium text-xs text-brand-primary uppercase mb-2">⚡ Pro Implementation Strategy</h4>
                  <p className="text-xs text-gray-400">
                    Built with Route Groups <span className="font-mono text-gray-300">`(auth)`</span> and <span className="font-mono text-gray-300">`(portal)`</span> to isolate guest layers from authorized employee sessions. Next.js 15 middleware triggers edge checks against Supabase Sessions at zero latency before page server rendering.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'flows' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-brand-surface/50 p-5">
                  <h3 className="font-display font-semibold text-lg text-brand-secondary mb-3 flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-brand-primary" /> Complete User Journey Blueprint
                  </h3>
                  
                  <div className="space-y-4 font-mono text-xs">
                    {/* Flow step 1 */}
                    <div className="flex gap-4 items-start border-l-2 border-brand-primary pl-4 pb-1">
                      <div className="bg-brand-primary text-brand-dark rounded-full h-5 w-5 flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <strong className="text-gray-200">Employee Arrival</strong>
                        <p className="text-gray-400 text-xs mt-0.5">Visits landing page; clicks "Enter Workspace". Redirects to auth screen.</p>
                      </div>
                    </div>

                    {/* Flow step 2 */}
                    <div className="flex gap-4 items-start border-l-2 border-brand-primary pl-4 pb-1">
                      <div className="bg-brand-primary text-brand-dark rounded-full h-5 w-5 flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <strong className="text-gray-200">Supabase Auth Execution</strong>
                        <p className="text-gray-400 text-xs mt-0.5">Submits credentials. Auth hook checks validation rules. On success, profile model loaded relative to UUID.</p>
                      </div>
                    </div>

                    {/* Flow step 3 */}
                    <div className="flex gap-4 items-start border-l-2 border-brand-primary pl-4 pb-1">
                      <div className="bg-brand-primary text-brand-dark rounded-full h-5 w-5 flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <strong className="text-gray-200">Role-Based Redirection Matrix</strong>
                        <div className="mt-1 text-gray-400">
                          - Super Admin status: Unlocks System Audit stream & branch KPI trends.<br />
                          - HR Manager status: Unlocks tools to write announcements & file uploads.<br />
                          - Standard Employee status: Tailored quick-launch launchers, read notice board.
                        </div>
                      </div>
                    </div>

                    {/* Flow step 4 */}
                    <div className="flex gap-4 items-start pl-4">
                      <div className="bg-brand-primary text-brand-dark rounded-full h-5 w-5 flex items-center justify-center font-bold">4</div>
                      <div className="flex-1">
                        <strong className="text-gray-200">Launch & Click Logging</strong>
                        <p className="text-gray-400 text-xs mt-0.5">Clicking external tools initiates logging to trace systems popularity index for performance reviews.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-brand-surface/40 p-4 flex gap-3 items-center">
                  <Cpu className="h-6 w-6 text-brand-primary shrink-0" />
                  <p className="text-xs text-gray-400">
                    Real-time operational sync is handled via <b className="text-gray-200">Supabase Realtime channels</b>. Changes in company alerts or emergency SOP uploads are instantly pushed to employee devices, keeping Callbox Davao in absolute operational harmony.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 flex justify-between items-center text-xs text-gray-500 font-mono">
            <span>Callbox Davao v4.0.2</span>
            <span>May 2026 Developer Build</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

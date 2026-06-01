/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Users, HardDrive, CalendarRange, MousePointer, 
  ChevronRight, Database, ShieldAlert, CheckCircle, Smartphone, ArrowUpRight 
} from 'lucide-react';
import { AuditLog } from '../types';

interface AnalyticsDashboardProps {
  auditLogs: AuditLog[];
  linksClicksTotal: number;
  documentsDownloadTotal: number;
}

export default function AnalyticsDashboard({ 
  auditLogs, 
  linksClicksTotal, 
  documentsDownloadTotal 
}: AnalyticsDashboardProps) {
  // Line chart hovered state
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: number; x: number; y: number } | null>(null);

  // Line chart coordinates for 7 days
  const chartPoints = [
    { day: 'Mon', value: 110, x: 50, y: 150 },
    { day: 'Tue', value: 145, x: 120, y: 115 },
    { day: 'Wed', value: 130, x: 190, y: 130 },
    { day: 'Thu', value: 195, x: 260, y: 65 },
    { day: 'Fri', value: 240, x: 330, y: 20 },
    { day: 'Sat', value: 95, x: 400, y: 165 },
    { day: 'Sun', value: 120, x: 470, y: 140 },
  ];

  const departmentAccessData = [
    { name: 'Operations', value: 72, color: '#FFC72C' },
    { name: 'HR Staff', value: 54, color: '#FFB800' },
    { name: 'IT Infrastructure', value: 89, color: '#FFD84D' },
    { name: 'Marketing / List', value: 35, color: '#F3F4F6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="analytics-dashboard-module">
      {/* Intro info */}
      <div>
        <div className="flex items-center gap-1 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="h-4 w-4" /> Live Operational Metrics
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Metrics Oversight Dashboard</h2>
        <p className="text-sm text-gray-400">Branch-wide data diagnostics tracking operational system calls, download tracking, and user activity logs.</p>
      </div>

      {/* Core KPI bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-brand-primary">
          <div className="flex justify-between items-center text-gray-400">
            <span className="font-mono text-[10px] uppercase tracking-wider">Dialer Access Pulse</span>
            <TrendingUp className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">99.85%</span>
            <span className="text-xs text-brand-success font-semibold font-mono font-medium">+0.12%</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1">Davao node live status</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="font-mono text-[10px] uppercase tracking-wider">Active System Launches</span>
            <Users className="h-4 w-4 text-brand-secondary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {Number(linksClicksTotal + 1302).toLocaleString()}
            </span>
            <span className="text-xs text-brand-success font-semibold font-mono font-medium">+8.2%</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1">All catalog redirects logged</p>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="font-mono text-[10px] uppercase tracking-wider">Vault Downloads</span>
            <HardDrive className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {Number(documentsDownloadTotal + 1720).toLocaleString()}
            </span>
            <span className="text-xs text-brand-success font-semibold font-mono font-medium">+15.4%</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1">SOP & forms pulled current turn</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="font-mono text-[10px] uppercase tracking-wider">Daily Authorized Active (DAU)</span>
            <CalendarRange className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">240</span>
            <span className="text-xs text-brand-success font-semibold font-mono font-bold">100% active</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1">Davao authorized head count</p>
        </div>

      </div>

      {/* Graphical Dashboards layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Access Line graph */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative">
          <h3 className="font-display font-semibold text-sm text-white mb-6 uppercase tracking-wider flex items-center gap-1.5">
            <MousePointer className="h-4 w-4 text-brand-primary" /> Daily Access Trends (User Redirects / Day)
          </h3>

          {/* SVG line chart workspace */}
          <div className="relative w-full h-56 mt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                {/* Visual gradient shading for graph line */}
                <linearGradient id="chartFluidGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC72C" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFC72C" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid backdrop horizontal lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

              {/* Shading fill path */}
              <path
                d="M 50 170 C 80 140, 100 115, 120 115 C 145 115, 165 130, 190 130 C 220 130, 240 65, 260 65 C 290 65, 310 20, 330 20 C 360 20, 380 165, 400 165 C 430 165, 450 140, 470 140 L 470 170 Z"
                fill="url(#chartFluidGlow)"
              />

              {/* Sparking line connection path */}
              <path
                d="M 50 150 C 120 115, 190 130, 260 65 C 330 20, 400 165, 470 140"
                fill="none"
                stroke="#FFC72C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Interactive Dots */}
              {chartPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.day === pt.day ? "6" : "4.5"}
                  fill={hoveredPoint?.day === pt.day ? "#FFC72C" : "#1F2937"}
                  stroke="#FFC72C"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Labels */}
              {chartPoints.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y="192"
                  fill="rgba(156, 163, 175, 0.8)"
                  fontSize="9.5"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {pt.day}
                </text>
              ))}

              {/* Left count ticks */}
              <text x="30" y="24" fill="rgba(156,163,175,0.5)" fontSize="8.5" textAnchor="end" className="font-mono">250</text>
              <text x="30" y="74" fill="rgba(156,163,175,0.5)" fontSize="8.5" textAnchor="end" className="font-mono">150</text>
              <text x="30" y="124" fill="rgba(156,163,175,0.5)" fontSize="8.5" textAnchor="end" className="font-mono">100</text>
              <text x="30" y="174" fill="rgba(156,163,175,0.5)" fontSize="8.5" textAnchor="end" className="font-mono">0</text>
            </svg>

            {/* Custom Interactive Tooltip popover */}
            {hoveredPoint && (
              <div 
                className="absolute z-10 p-2.5 rounded-lg border border-brand-primary/30 bg-brand-surface text-brand-light text-[11px] font-mono shadow-xl pointer-events-none"
                style={{ 
                  left: `${(hoveredPoint.x / 500) * 100}%`,
                  top: `${(hoveredPoint.y / 200) * 100 - 32}%` 
                }}
              >
                <div className="font-bold text-brand-primary">{hoveredPoint.day} Launches</div>
                <div className="font-semibold text-white mt-0.5">{hoveredPoint.value} system calls</div>
              </div>
            )}
          </div>
        </div>

        {/* Department Activity Bar panel */}
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="font-display font-semibold text-sm text-white mb-6 uppercase tracking-wider">
            📶 Shift Engagement Indexes
          </h3>

          <div className="space-y-4">
            {departmentAccessData.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                  <span className="font-medium text-gray-200">{dept.name}</span>
                  <span>{dept.value}% volume</span>
                </div>
                {/* Horizontal Bar frame */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border border-white/5 bg-brand-dark/30 rounded-2xl p-4 mt-6 flex items-start gap-2.5">
            <Smartphone className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-400 font-medium">
              <p className="text-white font-semibold">Real-time Biometrics Sync</p>
              <p className="mt-0.5 leading-relaxed">Agent time logs are piped dynamically through regional Davao terminal biometrics on 15s buffers.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Security Audit Trail Panel */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="font-display font-semibold text-sm text-white mb-4 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="h-4.5 w-4.5 text-brand-primary" /> SecOps Authorized Session Stream
          </div>
          <span className="text-[10px] font-mono text-gray-500 lowercase bg-white/5 px-2.5 py-0.5 rounded-full">Secure SSL SHA-256</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-brand-primary pb-2">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Actor Authorized</th>
                <th className="py-2.5">Role level</th>
                <th className="py-2.5">Action Executed</th>
                <th className="py-2.5">Target Scope</th>
                <th className="py-2.5 text-right">Gate Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => {
                let statusBadge = 'text-brand-success bg-brand-success/10 border-brand-success/20';
                let Icon = CheckCircle;

                if (log.status === 'WARNING') {
                  statusBadge = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
                  Icon = ShieldAlert;
                }

                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 text-gray-500">{log.timestamp}</td>
                    <td className="py-3 text-gray-200 font-semibold">{log.actor}</td>
                    <td className="py-3 text-gray-400">{log.role}</td>
                    <td className="py-3 text-gray-300">{log.action}</td>
                    <td className="py-3 text-gray-400 truncate max-w-[150px]">{log.target}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-tight ${statusBadge}`}>
                        <Icon className="h-3 w-3 shrink-0" /> {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

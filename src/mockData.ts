/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, ResourceLink, Announcement, ResourceDocument, SystemNotification, AuditLog } from './types';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: '🌟 Callbox Davao Executive Review Q2 2026',
    summary: 'A summary of Davao branch productivity gains and major client renewals.',
    content: `We are thrilled to share that the Davao Office achieved an exceptional 118% growth target in Q2! Thanks to the tireless efforts of our lead generation teams and campaign managers, we secured 14 significant renewals from international enterprise clients based in Europe and the USA.\n\nOur average dialer uptime registered at an all-time record of 99.85%, highlighting the outstanding stability and dedication of our support staff. To celebrate this milestone, HR has arranged a celebratory banquet and recognition ceremony this upcoming Friday. Details inside!`,
    category: 'Company Wide',
    publishedBy: 'Werzkie Tim',
    publishedDate: '2026-05-25',
    isPinned: true
  },
  {
    id: 'ann-2',
    title: '⚙️ Outbound Proxy System Maintenance Event',
    summary: 'Brief downtime announcement for the Davao outbound dialer backbone.',
    content: `Our network architects will be performing core updates on the VoIP servers to accommodate high-volume European SIP routes. The dialer will experience a short, scheduled interruption of up to 15 minutes. Please coordinate with team leads to allocate this interval for script practice or record cleaning.\n\nWe appreciate your patience as we double our bandwidth capacity!`,
    category: 'IT Support',
    publishedBy: 'System Infrastructure',
    publishedDate: '2026-05-26',
    isPinned: false
  },
  {
    id: 'ann-3',
    title: '🏥 Annual HMO Health Card Enrollment Now Active',
    summary: 'Final window to claim medical benefits and modify coverage details for dependents.',
    content: `HR announces that HMO validation period with Maxicare is officially active for the year. This open period allows all agents with at least 6 months tenure to enroll up to two basic dependents. Please access the download drawer, retrieve the "HMO Enrollment Form", and upload finalized paperwork prior to the cutoff date. Forms submitted late are subject to direct carrier review.`,
    category: 'HR Notice',
    publishedBy: 'Werzkie Tim',
    publishedDate: '2026-05-24',
    isPinned: true
  },
  {
    id: 'ann-4',
    title: '🎓 B2B Leads Prospecting Calibration Camp',
    summary: 'Mandatory refresher on building rich lists and segmenting decision makers.',
    content: `All newly onboarded operations executives are requested to sign up for tomorrow afternoon's calibration session. We will cover: \n- Advanced Boolean searching on premium data catalogs\n- Effective gatekeeper scripts specifically designed for C-level targets\n- QA recording analysis of our highest convertible outbound pitches.`,
    category: 'Training',
    publishedBy: 'Werzkie Tim',
    publishedDate: '2026-05-23',
    isPinned: false
  }
];

export const mockDocuments: ResourceDocument[] = [
  {
    id: 'doc-1',
    title: 'Callbox Davao Employee Handbook 2026',
    description: 'The definitive guidebook detailing employee policies, code of conduct, shift definitions, leaves, and core culture values.',
    category: 'Employee Handbook',
    fileSize: '3.4 MB',
    fileType: 'pdf',
    downloadCount: 421,
    uploadedBy: 'Werzkie Tim',
    uploadedDate: '2026-01-10'
  },
  {
    id: 'doc-2',
    title: 'Outbound Telesales SOP Standard Protocol',
    description: 'Official standard drafting compliance criteria to maintain dialing regulations across global markets.',
    category: 'SOPs',
    fileSize: '1.2 MB',
    fileType: 'pdf',
    downloadCount: 812,
    uploadedBy: 'Werzkie Tim',
    uploadedDate: '2025-11-15'
  },
  {
    id: 'doc-3',
    title: 'HMO Dependent Registration & Waiver Template',
    description: 'Official medical enrollment paperwork required to enlist family members onto the company health card plan.',
    category: 'Forms',
    fileSize: '450 KB',
    fileType: 'docx',
    downloadCount: 156,
    uploadedBy: 'Werzkie Tim',
    uploadedDate: '2026-05-22'
  },
  {
    id: 'doc-4',
    title: 'Client Briefing & Project Onboarding Guide',
    description: 'Project checklist structure utilized to run startup calls and calibrate customer lead metrics.',
    category: 'Training Guides',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    downloadCount: 310,
    uploadedBy: 'Werzkie Tim',
    uploadedDate: '2026-02-04'
  },
  {
    id: 'doc-5',
    title: 'Payslip Dispute Resolution Form',
    description: 'Accounting department submission worksheet used to review discrepancy logs or missing bonuses.',
    category: 'Forms',
    fileSize: '180 KB',
    fileType: 'xlsx',
    downloadCount: 88,
    uploadedBy: 'Werzkie Tim',
    uploadedDate: '2025-08-19'
  }
];

export const mockNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Proxy Maintenance Notice',
    message: 'VOIP server updates schedule for tomorrow at 06:00 UTC.',
    type: 'it',
    timestamp: '2 hours ago',
    isRead: false,
    targetTab: 'links'
  },
  {
    id: 'notif-2',
    title: 'Q2 Performance Released',
    message: 'Werzkie Tim shared branch-wide success logs.',
    type: 'announcement',
    timestamp: '1 day ago',
    isRead: false,
    targetTab: 'bulletins'
  },
  {
    id: 'notif-3',
    title: 'HMO Enrollment Open',
    message: 'Medical card signup ends shortly. Download registration templates in the resources library.',
    type: 'hr',
    timestamp: '2 days ago',
    isRead: true,
    targetTab: 'resources'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-26 15:43',
    actor: 'Werzkie Tim',
    role: 'Super Admin',
    action: 'Pinned Announcement',
    target: '🌟 Callbox Davao Executive Review Q2 2026',
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    timestamp: '2026-05-26 14:12',
    actor: 'Werzkie Tim',
    role: 'Super Admin',
    action: 'Uploaded Document',
    target: 'HMO Dependent Registration & Waiver Template',
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    timestamp: '2026-05-26 11:30',
    actor: 'Werzkie Tim',
    role: 'Super Admin',
    action: 'Reset Password Check',
    target: 'Profile security gateway',
    status: 'SUCCESS'
  },
  {
    id: 'log-4',
    timestamp: '2026-05-26 09:20',
    actor: 'System Firewall',
    role: 'Employee',
    action: 'External Login Flagged',
    target: '112.198.45.12 (Unknown VPN subnet)',
    status: 'WARNING'
  }
];

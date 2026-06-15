/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'HR' | 'Employee' | 'Inactive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  empId: string;
  joinedDate: string;
  gender?: 'Male' | 'Female';
  password?: string;
  isCSV?: boolean;
  isPasscodeSetupComplete?: boolean;
}

export interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'Communication' | 'Operations' | 'Human Resources' | 'Learning' | 'IT Support';
  icon: string;
  isPopular?: boolean;
  isForInactive?: boolean;
  clickCount: number;
  postedBy?: string;
  postedByRole?: UserRole;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: 'Company Wide' | 'HR Notice' | 'Operations' | 'Training' | 'Upcoming Event' | 'IT Support';
  publishedBy: string;
  publishedDate: string;
  isPinned: boolean;
  departmentScope?: string;
  isCritical?: boolean;
  icon?: string;
}

export interface ResourceDocument {
  id: string;
  title: string;
  description: string;
  category: 'Company Policies' | 'SOPs' | 'Employee Handbook' | 'Forms' | 'Templates' | 'Training Guides';
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  downloadCount: number;
  uploadedBy: string;
  uploadedDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'hr' | 'resource' | 'it' | 'training';
  timestamp: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface PortalActivity {
  id: string;
  timestamp: string;
  activity: string;
  icon: string;
}

export interface ApprovalRequest {
  id: string;
  type: 'change_role' | 'delete_account' | 'reset_passcode';
  hrId: string;
  hrName: string;
  employeeId: string;
  employeeName: string;
  details: {
    oldRole?: UserRole;
    newRole?: UserRole;
    customPassword?: string;
  };
  status: 'pending' | 'accepted' | 'denied';
  timestamp: string;
}


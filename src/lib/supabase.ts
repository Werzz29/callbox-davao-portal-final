import { createClient } from '@supabase/supabase-js';
import { ResourceLink, Announcement, ResourceDocument, AuditLog, Employee } from '../types';

// Accessing environment variables for Supabase via import.meta.env
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Validate if correct parameters are present
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

// Graceful lazy initialization of the client element
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * UTILITY DB CRUD SYNC OPERATIONS
 * Handled gracefully in case matching database tables do not yet exist.
 * This ensures the app is highly resilient for initial deployment.
 */

export async function fetchRemoteLinks(): Promise<ResourceLink[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('resource_links')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase query error (resource_links):', error.message);
      return null;
    }
    
    if (data) {
      // Map database row keys from snake_case back to camelCase
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        category: item.category,
        icon: item.icon,
        isPopular: item.is_popular,
        isForInactive: item.is_for_inactive,
        clickCount: item.click_count || 0,
        postedBy: item.posted_by,
        postedByRole: item.posted_by_role
      })) as ResourceLink[];
    }
  } catch (err) {
    console.error('Failed to communicate with Supabase', err);
  }
  return null;
}

export async function upsertRemoteLink(link: ResourceLink): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow = {
      id: link.id,
      title: link.title,
      description: link.description,
      url: link.url,
      category: link.category,
      icon: link.icon,
      is_popular: !!link.isPopular,
      is_for_inactive: !!link.isForInactive,
      click_count: link.clickCount,
      posted_by: link.postedBy || 'Admin',
      posted_by_role: link.postedByRole || 'Super Admin'
    };

    const { error } = await supabase
      .from('resource_links')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.error('Supabase write error (resource_links):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert link in Supabase', err);
    return false;
  }
}

export async function deleteRemoteLink(linkId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('resource_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      console.error('Supabase delete error (resource_links):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete link from Supabase', err);
    return false;
  }
}

export async function logRemoteAudit(log: AuditLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor,
        role: log.role,
        action: log.action,
        target: log.target,
        status: log.status
      });

    if (error) {
      console.warn('Supabase write error (audit_logs):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save audit log on Supabase', err);
    return false;
  }
}

export async function fetchRemoteAuditLogs(): Promise<AuditLog[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase fetch error (audit_logs):', error.message);
      return null;
    }
    return data as AuditLog[];
  } catch (err) {
    return null;
  }
}

export function encodePassword(password: string): string {
  if (!password) return '';
  if (/^[\*\u200B-\u200D]+$/.test(password)) {
    return password;
  }
  
  const asterisks = '*'.repeat(password.length);
  let invisiblePart = '';
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    const binary = charCode.toString(2);
    const encodedBinary = binary
      .split('')
      .map(bit => (bit === '1' ? '\u200C' : '\u200B'))
      .join('');
    
    if (i > 0) {
      invisiblePart += '\u200D';
    }
    invisiblePart += encodedBinary;
  }
  return asterisks + invisiblePart;
}

export function decodePassword(masked: string): string {
  if (!masked) return '';
  const hasInvisible = /[\u200B\u200C\u200D]/.test(masked);
  if (!hasInvisible) {
    if (/^\*+$/.test(masked)) {
      return 'callbox2026';
    }
    return masked;
  }
  
  const chars = Array.from(masked).filter(char => 
    char === '\u200B' || char === '\u200C' || char === '\u200D'
  );
  
  if (chars.length === 0) return masked;
  
  const joined = chars.join('');
  const charBlocks = joined.split('\u200D');
  let decoded = '';
  
  for (const block of charBlocks) {
    if (!block) continue;
    const binary = block
      .split('')
      .map(char => (char === '\u200C' ? '1' : '0'))
      .join('');
    
    const charCode = parseInt(binary, 2);
    if (!isNaN(charCode)) {
      decoded += String.fromCharCode(charCode);
    }
  }
  return decoded;
}

export async function fetchRemoteEmployees(): Promise<Employee[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase query error (employees):', error.message);
      return null;
    }

    if (data) {
      // Map database row keys from snake_case to camelCase
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        position: item.position,
        department: item.department,
        role: item.role,
        avatarUrl: item.avatar_url || '',
        phone: item.phone || '',
        empId: item.emp_id,
        joinedDate: item.joined_date,
        gender: item.gender,
        password: decodePassword(item.password || ''),
        isCSV: item.is_csv !== undefined ? item.is_csv : true,
        isPasscodeSetupComplete: item.is_passcode_setup_complete !== undefined ? item.is_passcode_setup_complete : true
      })) as Employee[];
    }
  } catch (err) {
    console.error('Failed to fetch employees from Supabase', err);
  }
  return null;
}

export async function upsertRemoteEmployee(employee: Employee): Promise<boolean> {
  if (!supabase) return false;
  try {
    const rawPass = employee.password || 'callbox2026';
    const maskedPassword = encodePassword(rawPass);

    // Pre-check for any existing row with matching emp_id or email to reuse its ID and avoid unique key violations
    let targetId = employee.id;
    try {
      const { data: allDbEmps } = await supabase
        .from('employees')
        .select('id, emp_id, email');

      if (allDbEmps && allDbEmps.length > 0) {
        const empIdMatch = allDbEmps.find(
          (r: any) => r.emp_id && employee.empId && r.emp_id.toLowerCase() === employee.empId.toLowerCase()
        );
        const emailMatch = allDbEmps.find(
          (r: any) => r.email && employee.email && r.email.toLowerCase() === employee.email.toLowerCase()
        );

        if (empIdMatch) {
          targetId = empIdMatch.id;
          
          // If there's a different row matching the email, delete it to prevent unique violation
          if (emailMatch && emailMatch.id !== targetId) {
            await supabase.from('employees').delete().eq('id', emailMatch.id);
          }
        } else if (emailMatch) {
          targetId = emailMatch.id;
        }
      }
    } catch (queryErr) {
      console.warn('Robust pre-check query error:', queryErr);
    }

    const dbRow = {
      id: targetId,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      role: employee.role,
      avatar_url: employee.avatarUrl || '',
      phone: employee.phone || '',
      emp_id: employee.empId,
      joined_date: employee.joinedDate,
      gender: employee.gender,
      password: maskedPassword
    };

    const { error } = await supabase
      .from('employees')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.error('Supabase write error (employees):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert/update employee in Supabase', err);
    return false;
  }
}

export async function deleteRemoteEmployee(employeeId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      console.error('Supabase delete error (employees):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete employee from Supabase', err);
    return false;
  }
}


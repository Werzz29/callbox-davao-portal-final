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
        password: item.password || ''
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
    const dbRow = {
      id: employee.id,
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
      password: employee.password || ''
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


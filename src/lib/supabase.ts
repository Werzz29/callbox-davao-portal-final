import { createClient } from '@supabase/supabase-js';
import { ResourceLink, Announcement, ResourceDocument, AuditLog } from '../types';

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

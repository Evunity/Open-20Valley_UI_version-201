import { getDatabase } from '../db/initialize';
import { AuditLog } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  user_id: string;
  tenant_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'success' | 'denied' | 'error';
  status_reason?: string;
  module?: string;
  operation?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: string;
}

/**
 * Audit logging service
 * Logs all security-relevant actions for compliance and audit trails
 */
export class AuditService {
  private db = getDatabase();

  /**
   * Log an action to the audit trail
   */
  logAction(entry: AuditLogEntry): void {
    try {
      const id = uuidv4();
      const timestamp = new Date().toISOString();

      this.db
        .prepare(`
          INSERT INTO audit_logs (
            id, user_id, tenant_id, action, resource_type, resource_id,
            status, status_reason, module, operation,
            ip_address, user_agent, metadata, timestamp, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          id,
          entry.user_id,
          entry.tenant_id,
          entry.action,
          entry.resource_type,
          entry.resource_id,
          entry.status,
          entry.status_reason || null,
          entry.module || null,
          entry.operation || null,
          entry.ip_address || null,
          entry.user_agent || null,
          entry.metadata || null,
          timestamp,
          timestamp
        );
    } catch (error) {
      // Logging failure should not crash the system
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Get audit logs with filtering
   */
  getAuditLogs(filters: {
    user_id?: string;
    tenant_id?: string;
    action?: string;
    resource_type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): AuditLog[] {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.tenant_id) {
      query += ' AND tenant_id = ?';
      params.push(filters.tenant_id);
    }

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    if (filters.resource_type) {
      query += ' AND resource_type = ?';
      params.push(filters.resource_type);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY timestamp DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.db.prepare(query).all(...params) as AuditLog[];
  }

  /**
   * Get audit logs for a specific user
   */
  getUserAuditLogs(userId: string, tenantId?: string, limit = 100): AuditLog[] {
    const query = tenantId
      ? 'SELECT * FROM audit_logs WHERE user_id = ? AND tenant_id = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?';

    const params = tenantId ? [userId, tenantId, limit] : [userId, limit];
    return this.db.prepare(query).all(...params) as AuditLog[];
  }

  /**
   * Get audit logs for a specific resource
   */
  getResourceAuditLogs(resourceType: string, resourceId: string, limit = 100): AuditLog[] {
    return this.db
      .prepare(`
        SELECT * FROM audit_logs
        WHERE resource_type = ? AND resource_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `)
      .all(resourceType, resourceId, limit) as AuditLog[];
  }

  /**
   * Get all denied actions for a date range
   */
  getDeniedActions(startDate?: string, endDate?: string, limit = 100): AuditLog[] {
    let query = 'SELECT * FROM audit_logs WHERE status = ? ORDER BY timestamp DESC';
    const params: any[] = ['denied'];

    if (startDate) {
      query = 'SELECT * FROM audit_logs WHERE status = ? AND timestamp >= ? ORDER BY timestamp DESC';
      params.push(startDate);
    }

    if (endDate && startDate) {
      query = 'SELECT * FROM audit_logs WHERE status = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC';
      params.push(endDate);
    }

    query += ` LIMIT ?`;
    params.push(limit);

    return this.db.prepare(query).all(...params) as AuditLog[];
  }

  /**
   * Get audit summary statistics
   */
  getAuditSummary(tenantId?: string): {
    total_events: number;
    success_count: number;
    denied_count: number;
    error_count: number;
    recent_24h: number;
  } {
    const baseQuery = tenantId ? 'WHERE tenant_id = ?' : '';
    const params = tenantId ? [tenantId] : [];

    const total = this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${baseQuery}`).get(...params) as { count: number };
    const success = this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${baseQuery} ${baseQuery ? 'AND' : 'WHERE'} status = 'success'`).get(...params, 'success') as { count: number };
    const denied = this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${baseQuery} ${baseQuery ? 'AND' : 'WHERE'} status = 'denied'`).get(...params, 'denied') as { count: number };
    const error = this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${baseQuery} ${baseQuery ? 'AND' : 'WHERE'} status = 'error'`).get(...params, 'error') as { count: number };

    // Last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${baseQuery} ${baseQuery ? 'AND' : 'WHERE'} timestamp >= ?`).get(...params, oneDayAgo) as { count: number };

    return {
      total_events: total.count,
      success_count: success.count,
      denied_count: denied.count,
      error_count: error.count,
      recent_24h: recent.count
    };
  }

  /**
   * Clear old audit logs (data retention)
   */
  clearOldLogs(retentionDays: number): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const result = this.db
      .prepare('DELETE FROM audit_logs WHERE timestamp < ?')
      .run(cutoffDate);
    return result.changes;
  }
}

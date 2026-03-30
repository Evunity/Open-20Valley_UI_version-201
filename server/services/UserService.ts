import { getDatabase } from '../db/initialize';
import { User, UserTenantMembership } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  status?: 'active' | 'inactive' | 'pending';
  mfa_enabled?: boolean;
}

/**
 * User service
 * Manages user accounts and tenant memberships
 */
export class UserService {
  private db = getDatabase();

  /**
   * Create a new user
   */
  createUser(req: CreateUserRequest): User {
    const id = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = this.hashPassword(req.password);

    // Check if email already exists
    const existing = this.getUserByEmail(req.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    this.db
      .prepare(`
        INSERT INTO users (
          id, email, name, password_hash, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, req.email, req.name, passwordHash, 'pending', now, now);

    return this.getUserById(id)!;
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as User | undefined;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;
  }

  /**
   * Authenticate user with email and password
   */
  authenticateUser(email: string, password: string): User | undefined {
    const user = this.getUserByEmail(email);
    if (!user) return undefined;

    const passwordHash = this.hashPassword(password);
    if (user.password_hash !== passwordHash) return undefined;

    // Update last login
    this.db
      .prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .run(new Date().toISOString(), user.id);

    return user;
  }

  /**
   * List all users with optional filters
   */
  listUsers(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): User[] {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY name ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.db.prepare(query).all(...params) as User[];
  }

  /**
   * Update user information
   */
  updateUser(userId: string, updates: UpdateUserRequest): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    // Check if new email is unique
    if (updates.email && updates.email !== user.email) {
      const existing = this.getUserByEmail(updates.email);
      if (existing) {
        throw new Error('User with this email already exists');
      }
    }

    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE users SET
          email = ?,
          name = ?,
          status = ?,
          mfa_enabled = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        updates.email || user.email,
        updates.name || user.name,
        updates.status || user.status,
        updates.mfa_enabled !== undefined ? (updates.mfa_enabled ? 1 : 0) : user.mfa_enabled,
        now,
        userId
      );

    return this.getUserById(userId);
  }

  /**
   * Delete/deactivate a user
   */
  deleteUser(userId: string): void {
    this.db
      .prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
      .run('inactive', new Date().toISOString(), userId);
  }

  /**
   * Change user password
   */
  changePassword(userId: string, newPassword: string): void {
    const passwordHash = this.hashPassword(newPassword);
    this.db
      .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), userId);
  }

  /**
   * Assign user to a tenant with a specific role
   */
  assignUserToTenant(
    userId: string,
    tenantId: string,
    roleId: string,
    assignedBy: string
  ): UserTenantMembership {
    // Verify user, tenant, and role exist
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const tenant = this.db
      .prepare('SELECT id FROM tenants WHERE id = ?')
      .get(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const role = this.db
      .prepare('SELECT id FROM roles WHERE id = ? AND tenant_id = ?')
      .get(roleId, tenantId);
    if (!role) throw new Error('Role not found in this tenant');

    // Check if user is already a member
    const existing = this.db
      .prepare('SELECT id FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ?')
      .get(userId, tenantId);

    if (existing) {
      throw new Error('User is already a member of this tenant');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO user_tenant_memberships (
          id, user_id, tenant_id, role_id, status, assigned_by, assigned_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, userId, tenantId, roleId, 'active', assignedBy, now, now);

    return this.getMembershipById(id)!;
  }

  /**
   * Remove user from a tenant
   */
  removeUserFromTenant(userId: string, tenantId: string): void {
    this.db
      .prepare('DELETE FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ?')
      .run(userId, tenantId);
  }

  /**
   * Update user's role in a tenant
   */
  changeUserRoleInTenant(userId: string, tenantId: string, newRoleId: string): UserTenantMembership | undefined {
    const membership = this.db
      .prepare('SELECT * FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ?')
      .get(userId, tenantId) as UserTenantMembership | undefined;

    if (!membership) return undefined;

    // Verify new role exists in this tenant
    const role = this.db
      .prepare('SELECT id FROM roles WHERE id = ? AND tenant_id = ?')
      .get(newRoleId, tenantId);
    if (!role) throw new Error('Role not found in this tenant');

    this.db
      .prepare('UPDATE user_tenant_memberships SET role_id = ? WHERE user_id = ? AND tenant_id = ?')
      .run(newRoleId, userId, tenantId);

    return this.getMembershipById(membership.id);
  }

  /**
   * Get user's tenants and roles
   */
  getUserTenantMemberships(userId: string): Array<UserTenantMembership & { tenant_name: string; role_name: string }> {
    return this.db
      .prepare(`
        SELECT
          utm.*,
          t.name as tenant_name,
          r.name as role_name
        FROM user_tenant_memberships utm
        JOIN tenants t ON utm.tenant_id = t.id
        JOIN roles r ON utm.role_id = r.id
        WHERE utm.user_id = ? AND utm.status = 'active'
        ORDER BY t.name ASC
      `)
      .all(userId) as any[];
  }

  /**
   * Get users in a tenant
   */
  getTenantUsers(tenantId: string, limit = 100): Array<User & { role: string }> {
    return this.db
      .prepare(`
        SELECT
          u.*,
          r.name as role
        FROM users u
        JOIN user_tenant_memberships utm ON utm.user_id = u.id
        JOIN roles r ON utm.role_id = r.id
        WHERE utm.tenant_id = ? AND utm.status = 'active'
        ORDER BY u.name ASC
        LIMIT ?
      `)
      .all(tenantId, limit) as any[];
  }

  /**
   * Enable MFA for user
   */
  enableMFA(userId: string): string {
    // Generate a simple MFA secret (in production, use proper 2FA library)
    const secret = uuidv4().replace(/-/g, '').substring(0, 32);

    this.db
      .prepare('UPDATE users SET mfa_enabled = 1, mfa_secret = ? WHERE id = ?')
      .run(secret, userId);

    return secret;
  }

  /**
   * Disable MFA for user
   */
  disableMFA(userId: string): void {
    this.db
      .prepare('UPDATE users SET mfa_enabled = 0, mfa_secret = NULL WHERE id = ?')
      .run(userId);
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getMembershipById(id: string): UserTenantMembership | undefined {
    return this.db
      .prepare('SELECT * FROM user_tenant_memberships WHERE id = ?')
      .get(id) as UserTenantMembership | undefined;
  }

  private hashPassword(password: string): string {
    // In production, use bcrypt or similar
    // This is a simple example hash
    return crypto
      .createHash('sha256')
      .update(password + 'salt')
      .digest('hex');
  }
}

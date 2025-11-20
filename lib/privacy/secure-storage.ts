/**
 * Privacy-First User Storage System with Encryption
 * 
 * This module provides secure storage for user data with:
 * - AES-256-GCM encryption for sensitive fields
 * - bcrypt hashing for phone numbers (one-way)
 * - Audit logging for all data access
 * - Automatic data retention and deletion
 * 
 * CRITICAL: Never log decrypted data or phone numbers.
 */

import { createClient } from '@/lib/supabase-server';
import bcrypt from 'bcrypt';
import { randomBytes, createCipheriv, createDecipheriv, randomUUID } from 'crypto';

/**
 * Encryption configuration
 */
const SALT_ROUNDS = 12;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Key must be exactly 32 bytes (256 bits) for AES-256
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`
    );
  }

  return keyBuffer;
}

/**
 * Encrypt data using AES-256-GCM
 * 
 * @param plaintext - Data to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
function encrypt(plaintext: string): { encrypted: string; iv: string; tag: string } {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 * 
 * @param encryptedData - Encrypted data with IV and tag
 * @returns Decrypted plaintext
 */
function decrypt(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const encrypted = encryptedData.encrypted;

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash phone number using bcrypt (one-way)
 * 
 * @param phone - Phone number to hash
 * @returns Hashed phone number
 */
async function hashPhone(phone: string): Promise<string> {
  return bcrypt.hash(phone, SALT_ROUNDS);
}

/**
 * Compare phone number with hash
 * 
 * @param phone - Plain phone number
 * @param hash - Hashed phone number
 * @returns True if phone matches hash
 */
async function comparePhone(phone: string, hash: string): Promise<boolean> {
  return bcrypt.compare(phone, hash);
}

/**
 * Generate anonymous email address
 * 
 * @param userId - User UUID
 * @returns Anonymous email address
 */
function generateAnonymousEmail(userId: string): string {
  return `${userId}@anonymous.fikravalley.com`;
}

/**
 * User data stored in database (encrypted)
 */
interface StoredUser {
  id: string;
  phone_hash: string; // bcrypt hash
  encrypted_name: string; // AES-256-GCM encrypted
  name_iv: string;
  name_tag: string;
  anonymous_email: string;
  consent: boolean;
  consent_date: string; // ISO date string
  data_retention_expiry: string; // ISO date string
  created_at: string;
  updated_at: string;
}

/**
 * User data for creation
 */
interface CreateUserData {
  phone: string;
  name: string;
  consent: boolean;
  consentDate: Date;
}

/**
 * Decrypted user data (for API responses)
 */
export interface DecryptedUser {
  id: string;
  anonymousEmail: string;
  name: string;
  consent: boolean;
  consentDate: Date;
  dataRetentionExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Internal user representation
 */
interface User {
  id: string;
  phoneHash: string;
  encryptedName: string;
  nameIv: string;
  nameTag: string;
  anonymousEmail: string;
  consent: boolean;
  consentDate: Date;
  dataRetentionExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit log entry
 */
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  actor: string; // Who performed the action (system, user ID, etc.)
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Secure User Storage Class
 * 
 * Provides encrypted storage for user data with privacy-first design.
 * All sensitive data is encrypted, phone numbers are hashed, and all
 * access is logged in an audit trail.
 */
export class SecureUserStorage {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  /**
   * Initialize SecureUserStorage
   */
  constructor() {
    // Supabase client will be created on first use
    this.supabase = null as any;
  }

  /**
   * Get Supabase client (lazy initialization)
   */
  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Create audit log entry
   * 
   * @param userId - User ID
   * @param action - Action performed
   * @param actor - Who performed the action
   * @param metadata - Additional metadata
   */
  private async createAuditLog(
    userId: string,
    action: string,
    actor: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      const { error } = await (supabase as any).from('marrai_audit_logs').insert({
        id: randomUUID(),
        user_id: userId,
        action,
        actor,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
      });

      if (error) {
        // Log error but don't throw - audit logging should not break main flow
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      // Log error but don't throw
      console.error('Audit log creation error:', error);
    }
  }

  /**
   * Create a new user with encrypted storage
   * 
   * @param data - User data to store
   * @returns User ID (UUID)
   * 
   * @example
   * ```typescript
   * const storage = new SecureUserStorage();
   * const userId = await storage.createUser({
   *   phone: '+212612345678',
   *   name: 'John Doe',
   *   consent: true,
   *   consentDate: new Date()
   * });
   * ```
   */
  async createUser(data: CreateUserData): Promise<string> {
    try {
      // Validate inputs
      if (!data.phone || !data.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!data.name || !data.name.trim()) {
        throw new Error('Name is required');
      }
      if (!data.consent) {
        throw new Error('User consent is required');
      }

      // Generate user ID
      const userId = randomUUID();

      // Hash phone number (one-way)
      const phoneHash = await hashPhone(data.phone.trim());

      // Encrypt name
      const encryptedNameData = encrypt(data.name.trim());

      // Generate anonymous email
      const anonymousEmail = generateAnonymousEmail(userId);

      // Set data retention expiry (90 days from now)
      const dataRetentionExpiry = new Date();
      dataRetentionExpiry.setDate(dataRetentionExpiry.getDate() + 90);

      // Store in database
      const supabase = await this.getSupabase();
      const { error, data: insertedData } = await (supabase as any)
        .from('marrai_secure_users')
        .insert({
          id: userId,
          phone_hash: phoneHash,
          encrypted_name: encryptedNameData.encrypted,
          name_iv: encryptedNameData.iv,
          name_tag: encryptedNameData.tag,
          anonymous_email: anonymousEmail,
          consent: data.consent,
          consent_date: data.consentDate.toISOString(),
          data_retention_expiry: dataRetentionExpiry.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      // Create audit log
      await this.createAuditLog(userId, 'user_created', 'system', {
        hasConsent: data.consent,
        consentDate: data.consentDate.toISOString(),
        retentionExpiry: dataRetentionExpiry.toISOString(),
      });

      return userId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating user:', errorMessage);
      throw error;
    }
  }

  /**
   * Find user by phone number
   * 
   * Uses bcrypt comparison to find user without storing plain phone numbers.
   * 
   * @param phone - Phone number to search for
   * @returns User object or null if not found
   */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      const supabase = await this.getSupabase();

      // Get all users (we need to compare hashes)
      // In production, consider adding an index or using a different approach
      // for better performance with large datasets
      const { data: users, error } = await supabase
        .from('marrai_secure_users')
        .select('*');

      if (error) {
        throw new Error(`Failed to query users: ${error.message}`);
      }

      if (!users || users.length === 0) {
        return null;
      }

      // Compare phone hash with each user
      for (const user of users as StoredUser[]) {
        const matches = await comparePhone(phone.trim(), user.phone_hash);
        if (matches) {
          // Create audit log
          await this.createAuditLog(user.id, 'user_lookup_by_phone', 'system');

          return {
            id: user.id,
            phoneHash: user.phone_hash,
            encryptedName: user.encrypted_name,
            nameIv: user.name_iv,
            nameTag: user.name_tag,
            anonymousEmail: user.anonymous_email,
            consent: user.consent,
            consentDate: new Date(user.consent_date),
            dataRetentionExpiry: new Date(user.data_retention_expiry),
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          };
        }
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error finding user by phone:', errorMessage);
      throw error;
    }
  }

  /**
   * Get user data (decrypted)
   * 
   * @param userId - User ID
   * @returns Decrypted user data
   */
  async getUserData(userId: string): Promise<DecryptedUser> {
    try {
      const supabase = await this.getSupabase();

      const { data: user, error } = await supabase
        .from('marrai_secure_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error(`User not found: ${userId}`);
      }

      const storedUser = user as StoredUser;

      // Decrypt name
      const decryptedName = decrypt({
        encrypted: storedUser.encrypted_name,
        iv: storedUser.name_iv,
        tag: storedUser.name_tag,
      });

      // Create audit log
      await this.createAuditLog(userId, 'user_data_accessed', 'system');

      return {
        id: storedUser.id,
        anonymousEmail: storedUser.anonymous_email,
        name: decryptedName,
        consent: storedUser.consent,
        consentDate: new Date(storedUser.consent_date),
        dataRetentionExpiry: new Date(storedUser.data_retention_expiry),
        createdAt: new Date(storedUser.created_at),
        updatedAt: new Date(storedUser.updated_at),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting user data:', errorMessage);
      throw error;
    }
  }

  /**
   * Delete user data
   * 
   * Permanently deletes all user data except audit logs.
   * 
   * @param userId - User ID to delete
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase();

      // Check if user exists
      const { data: user } = await supabase
        .from('marrai_secure_users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Delete user data
      const { error } = await supabase.from('marrai_secure_users').delete().eq('id', userId);

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      // Create audit log (never delete audit logs)
      await this.createAuditLog(userId, 'user_data_deleted', 'system', {
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting user data:', errorMessage);
      throw error;
    }
  }

  /**
   * Set data retention period for a user
   * 
   * @param userId - User ID
   * @param days - Number of days from now until expiry
   */
  async setDataRetention(userId: string, days: number): Promise<void> {
    try {
      if (days < 0) {
        throw new Error('Retention days must be positive');
      }

      const supabase = await this.getSupabase();

      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + days);

      const { error } = await (supabase as any)
        .from('marrai_secure_users')
        .update({
          data_retention_expiry: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update retention: ${error.message}`);
      }

      // Create audit log
      await this.createAuditLog(userId, 'retention_updated', 'system', {
        newExpiry: newExpiry.toISOString(),
        days,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error setting data retention:', errorMessage);
      throw error;
    }
  }

  /**
   * Check and delete expired user data
   * 
   * Background job that should be run periodically (e.g., daily cron).
   * Deletes all user data where data_retention_expiry has passed.
   * 
   * @param sendEmailNotification - Whether to send email before deletion (if user opted in)
   * @returns Number of users deleted
   */
  async cleanupExpiredData(sendEmailNotification: boolean = false): Promise<number> {
    try {
      const supabase = await this.getSupabase();
      const now = new Date().toISOString();

      // Find expired users
      const { data: expiredUsers, error: queryError } = await (supabase as any)
        .from('marrai_secure_users')
        .select('id, anonymous_email, data_retention_expiry')
        .lte('data_retention_expiry', now);

      if (queryError) {
        throw new Error(`Failed to query expired users: ${queryError.message}`);
      }

      if (!expiredUsers || expiredUsers.length === 0) {
        return 0;
      }

      let deletedCount = 0;

      // Delete each expired user
      for (const user of (expiredUsers as any[])) {
        try {
          // TODO: Send email notification if opted in
          // if (sendEmailNotification) {
          //   await sendEmail(user.anonymous_email, ...);
          // }

          await this.deleteUserData(user.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete expired user ${user.id}:`, error);
          // Continue with other users
        }
      }

      // Create audit log for cleanup
      await this.createAuditLog('system', 'cleanup_expired_data', 'system', {
        deletedCount,
        timestamp: now,
      });

      return deletedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error cleaning up expired data:', errorMessage);
      throw error;
    }
  }
}

/**
 * Generate a secure encryption key
 * 
 * Use this to generate ENCRYPTION_KEY for your .env file.
 * Run once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}


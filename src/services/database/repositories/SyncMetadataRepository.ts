/**
 * Sync Metadata Repository
 *
 * Data access object for sync_metadata table
 * Tracks cache timestamps, sync status, and configuration
 */

import { DatabaseService } from '../DatabaseService';

// ============================================================================
// TYPES
// ============================================================================

export interface SyncMetadata {
  key: string;
  value: string;
  updated_at: number;
}

// ============================================================================
// SYNC METADATA REPOSITORY
// ============================================================================

class SyncMetadataRepositoryImpl {
  private static instance: SyncMetadataRepositoryImpl;

  static getInstance(): SyncMetadataRepositoryImpl {
    if (!SyncMetadataRepositoryImpl.instance) {
      SyncMetadataRepositoryImpl.instance = new SyncMetadataRepositoryImpl();
    }
    return SyncMetadataRepositoryImpl.instance;
  }

  /**
   * Set a metadata value
   */
  async set(key: string, value: string): Promise<void> {
    const now = Date.now();

    await DatabaseService.query(
      `
      INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
      VALUES (?, ?, ?)
      `,
      [key, value, now.toString()]
    );
  }

  /**
   * Get a metadata value
   */
  async get(key: string): Promise<string | null> {
    const result = await DatabaseService.query('SELECT value FROM sync_metadata WHERE key = ?', [
      key,
    ]);

    return result.rows[0]?.value ?? null;
  }

  /**
   * Get metadata as number (for timestamps)
   */
  async getNumber(key: string): Promise<number> {
    const value = await this.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Get metadata as boolean
   */
  async getBoolean(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value === 'true';
  }

  /**
   * Get all metadata
   */
  async getAll(): Promise<SyncMetadata[]> {
    const result = await DatabaseService.query('SELECT * FROM sync_metadata');
    return result.rows;
  }

  /**
   * Delete a metadata entry
   */
  async delete(key: string): Promise<void> {
    await DatabaseService.query('DELETE FROM sync_metadata WHERE key = ?', [key]);
  }

  /**
   * Delete all metadata
   */
  async deleteAll(): Promise<void> {
    await DatabaseService.query('DELETE FROM sync_metadata');
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(syncType: string): Promise<void> {
    await this.set(`last_${syncType}_sync`, Date.now().toString());
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(syncType: string): Promise<number> {
    return this.getNumber(`last_${syncType}_sync`);
  }

  /**
   * Check if sync is needed (based on interval)
   */
  async isSyncNeeded(syncType: string, intervalMs: number): Promise<boolean> {
    const lastSync = await this.getLastSync(syncType);
    const now = Date.now();

    return now - lastSync > intervalMs;
  }

  /**
   * Sync trending repositories
   */
  async updateLastTrendingSync(): Promise<void> {
    await this.updateLastSync('trending');
  }

  async getLastTrendingSync(): Promise<number> {
    return this.getLastSync('trending');
  }

  /**
   * Trending sync interval (6 hours)
   */
  async isTrendingSyncNeeded(intervalMs: number = 6 * 60 * 60 * 1000): Promise<boolean> {
    return this.isSyncNeeded('trending', intervalMs);
  }

  /**
   * Search cleanup
   */
  async updateLastSearchCleanup(): Promise<void> {
    await this.updateLastSync('search_cleanup');
  }

  async getLastSearchCleanup(): Promise<number> {
    return this.getLastSync('search_cleanup');
  }

  /**
   * Search cleanup interval (24 hours)
   */
  async isSearchCleanupNeeded(intervalMs: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    return this.isSyncNeeded('search_cleanup', intervalMs);
  }

  /**
   * Mark that we performed a full sync
   */
  async updateLastFullSync(): Promise<void> {
    await this.updateLastSync('full');
  }

  async getLastFullSync(): Promise<number> {
    return this.getLastSync('full');
  }

  /**
   * Set app preferences
   */
  async setPreference(key: string, value: string): Promise<void> {
    await this.set(`pref_${key}`, value);
  }

  /**
   * Get app preference
   */
  async getPreference(key: string): Promise<string | null> {
    return this.get(`pref_${key}`);
  }

  /**
   * Set cache configuration
   */
  async setCacheConfig(key: string, value: string): Promise<void> {
    await this.set(`cache_${key}`, value);
  }

  /**
   * Get cache configuration
   */
  async getCacheConfig(key: string): Promise<string | null> {
    return this.get(`cache_${key}`);
  }

  /**
   * Get debug stats
   */
  async getDebugInfo(): Promise<Record<string, string>> {
    const allMetadata = await this.getAll();
    const info: Record<string, string> = {};

    for (const meta of allMetadata) {
      info[meta.key] = meta.value;
    }

    return info;
  }
}

export const SyncMetadataRepository = SyncMetadataRepositoryImpl.getInstance();

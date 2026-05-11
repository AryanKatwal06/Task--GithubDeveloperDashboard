/**
 * Database Service
 *
 * Singleton service that manages SQLite database lifecycle:
 * - Initialization and schema creation
 * - Database migrations
 * - Connection management
 * - Transaction support
 *
 * Usage:
 * await DatabaseService.initialize();
 * const repos = await DatabaseService.query('SELECT * FROM repositories');
 */

import Database from 'react-native-sqlite-storage';
import type { SQLiteDatabase } from 'react-native-sqlite-storage';
import {
  DATABASE_VERSION,
  DATABASE_NAME,
  CREATE_TABLE_STATEMENTS,
  CREATE_INDEX_STATEMENTS,
} from './schema';

// Enable SQLite debug mode for development
if (__DEV__) {
  Database.enablePromise(true);
  Database.DEBUG(true);
} else {
  Database.enablePromise(true);
}

// ============================================================================
// TYPES
// ============================================================================

export interface DbQueryResult<T = any> {
  rowsAffected: number;
  insertId?: number;
  rows: T[];
}

export interface DbTransactionOptions {
  readonly: boolean;
}

// ============================================================================
// DATABASE SERVICE
// ============================================================================

class DatabaseServiceImpl {
  private static instance: DatabaseServiceImpl;
  private db: SQLiteDatabase | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Singleton accessor
   */
  static getInstance(): DatabaseServiceImpl {
    if (!DatabaseServiceImpl.instance) {
      DatabaseServiceImpl.instance = new DatabaseServiceImpl();
    }
    return DatabaseServiceImpl.instance;
  }

  /**
   * Initialize database
   * - Opens or creates database file
   * - Creates tables and indexes
   * - Runs migrations if needed
   */
  async initialize(): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized && this.db) {
      return;
    }

    this.initializationPromise = this.initializeInternal();
    return this.initializationPromise;
  }

  /**
   * Internal initialization logic
   */
  private async initializeInternal(): Promise<void> {
    try {
      // Open or create database
      this.db = await Database.openDatabase(
        {
          name: DATABASE_NAME,
          location: 'default',
          iosDatabaseLocation: 'Documents',
        },
        () => {
          console.log('[DB] Database opened successfully');
        },
        (error: any) => {
          console.error('[DB] Error opening database:', error);
          throw error;
        }
      );

      if (!this.db) {
        throw new Error('Failed to open database');
      }

      // Create all tables
      await this.createTables();

      // Create all indexes
      await this.createIndexes();

      // Check and run migrations if needed
      await this.runMigrations();

      this.isInitialized = true;
      console.log('[DB] Database initialization complete');
    } catch (error) {
      console.error('[DB] Initialization failed:', error);
      this.db = null;
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Create all tables defined in schema
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const statement of CREATE_TABLE_STATEMENTS) {
      try {
        await this.db.executeSql(statement);
      } catch (error: any) {
        // Table already exists - this is fine
        if (!error?.message?.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('[DB] Tables created/verified');
  }

  /**
   * Create all indexes for performance
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const statement of CREATE_INDEX_STATEMENTS) {
      try {
        await this.db.executeSql(statement);
      } catch (error: any) {
        // Index already exists - this is fine
        if (!error?.message?.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('[DB] Indexes created/verified');
  }

  /**
   * Run database migrations
   * Currently minimal - expand as schema evolves
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.query('SELECT value FROM sync_metadata WHERE key = ?', [
        'db_version',
      ]);

      const currentVersion = result.rows[0]?.value ? parseInt(result.rows[0].value, 10) : 0;

      if (currentVersion < DATABASE_VERSION) {
        console.log(
          `[DB] Running migrations from version ${currentVersion} to ${DATABASE_VERSION}`
        );

        // Add future migrations here
        // Example:
        // if (currentVersion < 2) await this.migrationV1ToV2();

        await this.updateSyncMetadata('db_version', DATABASE_VERSION.toString());
      }
    } catch (error: any) {
      // First run - set initial version
      if (error?.message?.includes('no such table')) {
        await this.updateSyncMetadata('db_version', DATABASE_VERSION.toString());
      } else {
        throw error;
      }
    }
  }

  /**
   * Execute a SQL query
   *
   * @param sql - SQL statement
   * @param params - Optional query parameters
   * @returns Query result with rows array
   *
   * EXAMPLE:
   * const result = await db.query('SELECT * FROM repositories WHERE stars > ?', [100]);
   * const repos = result.rows;
   */
  async query<T = any>(sql: string, params: (string | number)[] = []): Promise<DbQueryResult<T>> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.executeSql(sql, params);

      if (!result || !result[0]) {
        return { rowsAffected: 0, rows: [] };
      }

      const resultSet = result[0];

      // Convert iOS result format to common format
      const rows: T[] = [];
      for (let i = 0; i < resultSet.rows.length; i++) {
        rows.push(resultSet.rows.item(i) as T);
      }

      return {
        rowsAffected: resultSet.rowsAffected,
        insertId: resultSet.insertId,
        rows,
      };
    } catch (error) {
      console.error('[DB] Query error:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   *
   * @param callback - Function that executes queries
   * @returns Transaction result
   *
   * EXAMPLE:
   * await db.transaction(async () => {
   *   await db.query('INSERT INTO repos ...');
   *   await db.query('UPDATE cache ...');
   * });
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql('BEGIN TRANSACTION');
      const result = await callback();
      await this.db.executeSql('COMMIT');
      return result;
    } catch (error: any) {
      try {
        await this.db.executeSql('ROLLBACK');
      } catch (rollbackError: any) {
        console.error('[DB] Rollback failed:', rollbackError);
      }
      throw error;
    }
  }

  /**
   * Update sync metadata (helper)
   */
  async updateSyncMetadata(key: string, value: string): Promise<void> {
    const now = Date.now();

    try {
      await this.query(
        `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
         VALUES (?, ?, ?)`,
        [key, value, now.toString()]
      );
    } catch (error: any) {
      console.error('[DB] Failed to update sync metadata:', error);
      throw error;
    }
  }

  /**
   * Get sync metadata value
   */
  async getSyncMetadata(key: string): Promise<string | null> {
    try {
      const result = await this.query('SELECT value FROM sync_metadata WHERE key = ?', [key]);

      return result.rows[0]?.value ?? null;
    } catch (error: any) {
      console.error('[DB] Failed to get sync metadata:', error);
      return null;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        this.isInitialized = false;
        console.log('[DB] Database closed');
      } catch (error: any) {
        console.error('[DB] Error closing database:', error);
        throw error;
      }
    }
  }

  /**
   * Clear all data (for testing/development)
   */
  async clear(): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.query('DELETE FROM search_results');
      await this.query('DELETE FROM search_cache');
      await this.query('DELETE FROM repositories');
      await this.query('DELETE FROM sync_metadata');
      console.log('[DB] All data cleared');
    } catch (error: any) {
      console.error('[DB] Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Get database stats (for debugging)
   */
  async getStats(): Promise<{
    repositoriesCount: number;
    searchCacheCount: number;
    databaseSize: number;
  }> {
    const repos = await this.query('SELECT COUNT(*) as count FROM repositories');
    const searches = await this.query('SELECT COUNT(*) as count FROM search_cache');

    return {
      repositoriesCount: repos.rows[0]?.count ?? 0,
      searchCacheCount: searches.rows[0]?.count ?? 0,
      databaseSize: 0, // Platform-specific, would need native code
    };
  }
}

// Export singleton instance
export const DatabaseService = DatabaseServiceImpl.getInstance();

/**
 * Repository Repository
 *
 * Data access object for repositories table
 * Handles CRUD operations for cached GitHub repositories
 */

import { DatabaseService } from '../DatabaseService';
import type { GitHubRepository } from '../../../types/api';
import { CACHE_TTL } from '../schema';

// ============================================================================
// TYPES
// ============================================================================

export interface RepositoryEntity {
  id: number;
  name: string;
  owner: string;
  full_name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  is_fork: number;
  created_at: string | null;
  updated_at: string | null;
  github_data: string; // JSON string
  cached_at: number;
  source: string; // 'search' | 'trending' | 'user'
}

// ============================================================================
// REPOSITORY REPOSITORY
// ============================================================================

class RepositoryRepositoryImpl {
  private static instance: RepositoryRepositoryImpl;

  static getInstance(): RepositoryRepositoryImpl {
    if (!RepositoryRepositoryImpl.instance) {
      RepositoryRepositoryImpl.instance = new RepositoryRepositoryImpl();
    }
    return RepositoryRepositoryImpl.instance;
  }

  /**
   * Insert or update a repository
   *
   * Uses INSERT OR REPLACE to handle both new and existing repos
   */
  async upsert(repo: GitHubRepository, source: string = 'api'): Promise<number> {
    const now = Date.now();
    const githubData = JSON.stringify(repo);

    const result = await DatabaseService.query(
      `
      INSERT OR REPLACE INTO repositories (
        id, name, owner, full_name, description, url, stars, forks, language,
        is_fork, created_at, updated_at, github_data, cached_at, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        repo.id,
        repo.name,
        repo.owner.login,
        repo.full_name,
        repo.description || '',
        repo.html_url,
        repo.stargazers_count,
        repo.forks_count,
        repo.language || '',
        repo.fork ? 1 : 0,
        repo.created_at,
        repo.updated_at,
        githubData,
        now.toString(),
        source,
      ]
    );

    return result.insertId || repo.id;
  }

  /**
   * Batch insert or update repositories
   */
  async upsertBatch(repos: GitHubRepository[], source: string = 'api'): Promise<void> {
    await DatabaseService.transaction(async () => {
      for (const repo of repos) {
        await this.upsert(repo, source);
      }
    });
  }

  /**
   * Get repository by GitHub ID
   */
  async getById(id: number): Promise<RepositoryEntity | null> {
    const result = await DatabaseService.query('SELECT * FROM repositories WHERE id = ?', [
      id.toString(),
    ]);

    return result.rows[0] || null;
  }

  /**
   * Get repository by full_name (owner/repo)
   */
  async getByFullName(fullName: string): Promise<RepositoryEntity | null> {
    const result = await DatabaseService.query('SELECT * FROM repositories WHERE full_name = ?', [
      fullName,
    ]);

    return result.rows[0] || null;
  }

  /**
   * Get repositories by owner
   */
  async getByOwner(owner: string, limit: number = 100): Promise<RepositoryEntity[]> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM repositories
      WHERE owner = ?
      ORDER BY stars DESC
      LIMIT ?
      `,
      [owner, limit.toString()]
    );

    return result.rows;
  }

  /**
   * Get repositories by language
   */
  async getByLanguage(language: string, limit: number = 100): Promise<RepositoryEntity[]> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM repositories
      WHERE language = ? AND language != ''
      ORDER BY stars DESC
      LIMIT ?
      `,
      [language, limit.toString()]
    );

    return result.rows;
  }

  /**
   * Search repositories by name or description
   */
  async search(query: string, limit: number = 50): Promise<RepositoryEntity[]> {
    const searchTerm = `%${query}%`;

    const result = await DatabaseService.query(
      `
      SELECT * FROM repositories
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY stars DESC
      LIMIT ?
      `,
      [searchTerm, searchTerm, limit.toString()]
    );

    return result.rows;
  }

  /**
   * Get top repositories by stars
   */
  async getTopByStars(limit: number = 50, language?: string): Promise<RepositoryEntity[]> {
    let query = `
      SELECT * FROM repositories
      ${language ? 'WHERE language = ?' : ''}
      ORDER BY stars DESC
      LIMIT ?
    `;

    const params: (string | number)[] = language
      ? [language, limit.toString()]
      : [limit.toString()];

    const result = await DatabaseService.query(query, params);
    return result.rows;
  }

  /**
   * Get recently cached repositories
   */
  async getRecent(limit: number = 50): Promise<RepositoryEntity[]> {
    const result = await DatabaseService.query(
      `
      SELECT * FROM repositories
      ORDER BY cached_at DESC
      LIMIT ?
      `,
      [limit.toString()]
    );

    return result.rows;
  }

  /**
   * Get stale repositories (older than TTL)
   */
  async getStale(ttlMs: number = CACHE_TTL.REPOSITORY_DETAIL): Promise<RepositoryEntity[]> {
    const staleTimestamp = (Date.now() - ttlMs).toString();

    const result = await DatabaseService.query(
      `
      SELECT * FROM repositories
      WHERE cached_at < ?
      ORDER BY cached_at ASC
      `,
      [staleTimestamp]
    );

    return result.rows;
  }

  /**
   * Delete repository by ID
   */
  async delete(id: number): Promise<void> {
    await DatabaseService.query('DELETE FROM repositories WHERE id = ?', [id.toString()]);
  }

  /**
   * Delete repositories by source
   */
  async deleteBySource(source: string): Promise<number> {
    const result = await DatabaseService.query('DELETE FROM repositories WHERE source = ?', [
      source,
    ]);

    return result.rowsAffected;
  }

  /**
   * Delete all repositories
   */
  async deleteAll(): Promise<number> {
    const result = await DatabaseService.query('DELETE FROM repositories');
    return result.rowsAffected;
  }

  /**
   * Count total repositories in cache
   */
  async count(): Promise<number> {
    const result = await DatabaseService.query('SELECT COUNT(*) as count FROM repositories');
    return result.rows[0]?.count ?? 0;
  }

  /**
   * Clear old cache entries (cleanup)
   * Removes repositories older than specified TTL
   */
  async cleanup(ttlMs: number = CACHE_TTL.REPOSITORY_DETAIL): Promise<number> {
    const staleTimestamp = (Date.now() - ttlMs).toString();

    const result = await DatabaseService.query('DELETE FROM repositories WHERE cached_at < ?', [
      staleTimestamp,
    ]);

    if (__DEV__) {
      console.log(`[DB] Cleaned up ${result.rowsAffected} stale repositories`);
    }
    return result.rowsAffected;
  }
}

export const RepositoryRepository = RepositoryRepositoryImpl.getInstance();

/**
 * API Response Types
 *
 * Typed responses from GitHub API
 * Ensures type safety throughout the application
 */

// ============================================================================
// GitHub Repository Response
// ============================================================================

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
}

// ============================================================================
// GitHub User Response
// ============================================================================

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'User' | 'Organization';
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  bio: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  company: string | null;
}

// ============================================================================
// GitHub Issue Response
// ============================================================================

export interface GitHubIssue {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  id_number: number;
  title: string;
  user: GitHubUser;
  labels: Array<{
    id: number;
    url: string;
    name: string;
    color: string;
    default: boolean;
  }>;
  state: 'open' | 'closed';
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    state: 'open' | 'closed';
    title: string;
    description: string;
    creator: GitHubUser;
    open_issues: number;
    closed_issues: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    due_on: string | null;
  } | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  headers: {
    link?: string; // GitHub pagination link header
    'x-ratelimit-limit': number;
    'x-ratelimit-remaining': number;
    'x-ratelimit-reset': number;
  };
}

// ============================================================================
// Search Response (different structure from regular endpoints)
// ============================================================================

export interface SearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

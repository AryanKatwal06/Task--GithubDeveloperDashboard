import type { GitHubRepository } from '../../../types/api';

export interface SearchRepositoriesPayload {
  query: string;
  page?: number;
  perPage?: number;
  language?: string;
  forceRefresh?: boolean;
}

export interface SearchRepositoriesResponse {
  repositories: GitHubRepository[];
  totalCount: number;
  query: string;
  filters: {
    language?: string;
  };
  page: number;
  perPage: number;
  fromCache?: boolean;
}

export interface GetRepositoryDetailsPayload {
  owner: string;
  repo: string;
  forceRefresh?: boolean;
}

export interface GetRepositoryDetailsResponse {
  repository: GitHubRepository;
  readme: string;
  fromCache?: boolean;
}

export interface GetTrendingRepositoriesPayload {
  language?: string;
  page?: number;
  perPage?: number;
  forceRefresh?: boolean;
}

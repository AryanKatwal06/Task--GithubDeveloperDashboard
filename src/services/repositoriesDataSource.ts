import { githubAPI } from './githubAPI';
import { networkStateManager } from './networkStateManager';
import { RepositoryRepository, SearchCacheRepository } from './database';
import type { GitHubRepository, SearchResponse } from '../types/api';
import { AppError, ErrorCode } from '../types/error';
import type {
  GetRepositoryDetailsPayload,
  GetRepositoryDetailsResponse,
  GetTrendingRepositoriesPayload,
  SearchRepositoriesPayload,
  SearchRepositoriesResponse,
} from '../store/slices/repositories/contracts';

const parseCachedRepository = (
  rawRepository: Awaited<ReturnType<typeof RepositoryRepository.getById>>
): GitHubRepository | null => {
  if (!rawRepository?.github_data) {
    return null;
  }

  try {
    return JSON.parse(rawRepository.github_data) as GitHubRepository;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Repositories] Failed to parse cached repository payload', error);
    }
    return null;
  }
};

const getRepositoriesByIdsFromCache = async (
  repositoryIds: number[]
): Promise<GitHubRepository[]> => {
  const cachedRows = await Promise.all(repositoryIds.map((id) => RepositoryRepository.getById(id)));

  const parsedRepositories = cachedRows
    .map((cachedRow) => parseCachedRepository(cachedRow))
    .filter(Boolean) as GitHubRepository[];

  const parsedById = new Map(parsedRepositories.map((repo) => [repo.id, repo]));
  return repositoryIds.map((id) => parsedById.get(id)).filter(Boolean) as GitHubRepository[];
};

const getCachedSearchResponse = async (
  query: string,
  language: string | undefined,
  page: number,
  fallbackPerPage: number
): Promise<SearchRepositoriesResponse | null> => {
  const cachedSearch = await SearchCacheRepository.getCachedSearch(query, language, page);

  if (!cachedSearch || cachedSearch.isExpired || cachedSearch.repositoryIds.length === 0) {
    return null;
  }

  const repositories = await getRepositoriesByIdsFromCache(cachedSearch.repositoryIds);
  if (repositories.length === 0) {
    return null;
  }

  return {
    repositories,
    totalCount: cachedSearch.cache.total_count || repositories.length,
    query,
    filters: { language },
    page: cachedSearch.cache.page || page,
    perPage: cachedSearch.cache.per_page || fallbackPerPage,
    fromCache: true,
  };
};

const ensureOnlineOrThrow = (message: string): void => {
  if (networkStateManager.isOnline()) {
    return;
  }

  throw new AppError(message, ErrorCode.NO_INTERNET, { retryable: true });
};

export const repositoriesDataSource = {
  async searchRepositories(
    payload: SearchRepositoriesPayload
  ): Promise<SearchRepositoriesResponse> {
    const { query, language, page = 1, perPage = 30, forceRefresh = false } = payload;

    if (!forceRefresh) {
      const cachedResponse = await getCachedSearchResponse(query, language, page, perPage);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    ensureOnlineOrThrow('No internet connection and no cached search results available.');

    const effectiveQuery = language ? `${query} language:${language}` : query;
    const response: SearchResponse<GitHubRepository> = await githubAPI.searchRepositories(
      effectiveQuery,
      page,
      perPage
    );

    return {
      repositories: response.items,
      totalCount: response.total_count,
      query,
      filters: { language },
      page,
      perPage,
      fromCache: false,
    };
  },

  async getRepositoryDetails(
    payload: GetRepositoryDetailsPayload
  ): Promise<GetRepositoryDetailsResponse> {
    const { owner, repo, forceRefresh = false } = payload;
    const fullName = `${owner}/${repo}`;

    if (!forceRefresh) {
      const cachedRepository = await RepositoryRepository.getByFullName(fullName);
      const parsedRepository = parseCachedRepository(cachedRepository);

      if (parsedRepository) {
        return {
          repository: parsedRepository,
          readme: 'README preview unavailable in offline cache mode.',
          fromCache: true,
        };
      }
    }

    ensureOnlineOrThrow('No internet connection and no cached repository details available.');

    const [repository, readme] = await Promise.all([
      githubAPI.getRepository(owner, repo),
      githubAPI.getRepositoryReadme(owner, repo),
    ]);

    return {
      repository,
      readme,
      fromCache: false,
    };
  },

  async getTrendingRepositories(
    payload: GetTrendingRepositoriesPayload
  ): Promise<SearchRepositoriesResponse> {
    const { language, page = 1, perPage = 30, forceRefresh = false } = payload;
    const trendingQuery = language ? `trending:${language}` : 'trending';

    if (!forceRefresh) {
      const cachedResponse = await getCachedSearchResponse(trendingQuery, language, page, perPage);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    ensureOnlineOrThrow('No internet connection and no cached trending repositories available.');

    const response: SearchResponse<GitHubRepository> = await githubAPI.getTrendingRepositories(
      language,
      page,
      perPage
    );

    return {
      repositories: response.items,
      totalCount: response.total_count,
      query: trendingQuery,
      filters: { language },
      page,
      perPage,
      fromCache: false,
    };
  },
};

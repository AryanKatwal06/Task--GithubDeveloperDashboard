import { preloadCacheData } from '../src/services/database/cacheSyncMiddleware';
import { RepositoryRepository, SearchCacheRepository } from '../src/services/database/repositories';

describe('cache preload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls repository and search cache repo methods to restore cache', async () => {
    const repoSpy = jest
      .spyOn(RepositoryRepository, 'getRecent')
      .mockResolvedValue([{ id: 1, github_data: JSON.stringify({ id: 1, name: 'repo' }) } as any]);

    const searchSpy = jest
      .spyOn(SearchCacheRepository, 'getSearchHistory')
      .mockResolvedValue(['react', 'vue']);

    await expect(preloadCacheData()).resolves.toBeUndefined();

    expect(repoSpy).toHaveBeenCalledWith(50);
    expect(searchSpy).toHaveBeenCalledWith(20);
  });
});

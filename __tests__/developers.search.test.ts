import { searchDevelopers } from '../src/store/slices/developers';
import { githubAPI } from '../src/services/githubAPI';
import { AppError, ErrorCode } from '../src/types/error';

jest.mock('../src/services/githubAPI', () => ({
  githubAPI: {
    searchUsers: jest.fn(),
    getUser: jest.fn(),
  },
}));

describe('searchDevelopers', () => {
  it('returns search results without fetching each profile', async () => {
    const mockedSearchUsers = githubAPI.searchUsers as jest.MockedFunction<typeof githubAPI.searchUsers>;
    const mockedGetUser = githubAPI.getUser as jest.MockedFunction<typeof githubAPI.getUser>;

    mockedSearchUsers.mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          login: 'octocat',
          id: 1,
          node_id: 'MDQ6VXNlcjE=',
          avatar_url: 'https://example.com/avatar.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/octocat',
          html_url: 'https://github.com/octocat',
          followers_url: 'https://api.github.com/users/octocat/followers',
          following_url: 'https://api.github.com/users/octocat/following{/other_user}',
          gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
          repos_url: 'https://api.github.com/users/octocat/repos',
          events_url: 'https://api.github.com/users/octocat/events{/privacy}',
          received_events_url: 'https://api.github.com/users/octocat/received_events',
          type: 'User',
          public_repos: 8,
          public_gists: 0,
          followers: 0,
          following: 0,
          created_at: '2011-01-25T18:44:36Z',
          updated_at: '2024-01-01T00:00:00Z',
          bio: null,
          blog: null,
          location: null,
          email: null,
          hireable: null,
          company: null,
        },
      ],
    });

    const dispatch = jest.fn();
    const getState = jest.fn(() => ({}));

    mockedGetUser.mockResolvedValue({
      login: 'octocat',
      id: 1,
      node_id: 'MDQ6VXNlcjE=',
      avatar_url: 'https://example.com/avatar.png',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      followers_url: 'https://api.github.com/users/octocat/followers',
      following_url: 'https://api.github.com/users/octocat/following{/other_user}',
      gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
      repos_url: 'https://api.github.com/users/octocat/repos',
      events_url: 'https://api.github.com/users/octocat/events{/privacy}',
      received_events_url: 'https://api.github.com/users/octocat/received_events',
      type: 'User',
      public_repos: 8,
      public_gists: 0,
      followers: 99,
      following: 0,
      created_at: '2011-01-25T18:44:36Z',
      updated_at: '2024-01-01T00:00:00Z',
      bio: 'Octocat bio',
      blog: null,
      location: null,
      email: null,
      hireable: null,
      company: 'GitHub',
    });

    const action = await searchDevelopers({ query: 'octocat', page: 1 })(dispatch, getState, undefined);

    expect(action.type).toBe('developers/searchDevelopers/fulfilled');
    expect(mockedSearchUsers).toHaveBeenCalledWith('octocat', 1);
    expect(mockedGetUser).toHaveBeenCalledWith('octocat');
    expect(action.payload).toHaveLength(1);
    expect(action.payload[0]?.login).toBe('octocat');
    expect(action.payload[0]?.bio).toBe('Octocat bio');
  });

  it('rejects with a serializable error payload', async () => {
    const mockedSearchUsers = githubAPI.searchUsers as jest.MockedFunction<typeof githubAPI.searchUsers>;

    mockedSearchUsers.mockRejectedValue(
      new AppError('Too many requests', ErrorCode.RATE_LIMITED, { statusCode: 403 })
    );

    const dispatch = jest.fn();
    const getState = jest.fn(() => ({}));

    const action = await searchDevelopers({ query: 'wcandillon', page: 1 })(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toBe('developers/searchDevelopers/rejected');
    expect(action.payload).toBe('Too many requests');
  });
});

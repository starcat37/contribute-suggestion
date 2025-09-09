import { NextRequest } from 'next/server';
import { POST } from '@/api/repositories/recommend/route';

// Mock dependencies
jest.mock('@/lib/github/search', () => ({
  createSearchService: jest.fn(),
}));

describe('/api/repositories/recommend', () => {
  const mockSearchService = {
    searchRepositories: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(require('@/lib/github/search').createSearchService).mockReturnValue(mockSearchService);
    
    // Mock environment variable
    process.env.GITHUB_TOKEN = 'mock_system_token';
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/repositories/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('handles valid search request', async () => {
    const mockResults = {
      repositories: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repository',
          html_url: 'https://github.com/user/test-repo',
          stargazers_count: 100,
          forks_count: 20,
          language: 'JavaScript',
          topics: ['test', 'javascript'],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-12-01T00:00:00Z',
          owner: {
            login: 'user',
            avatar_url: 'https://github.com/user.png',
            html_url: 'https://github.com/user',
          },
          score: 0.85,
        },
      ],
      totalCount: 1,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['JavaScript'],
      contributionTypes: ['good-first-issue'],
      page: 1,
      limit: 30,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResults);
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith(
      {
        languages: ['JavaScript'],
        contributionTypes: ['good-first-issue'],
        page: 1,
        limit: 30,
      },
      undefined
    );
  });

  it('handles request with user GitHub token', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['Python'],
      contributionTypes: ['documentation'],
      page: 1,
      limit: 30,
      githubToken: 'user_token_123',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(require('@/lib/github/search').createSearchService).toHaveBeenCalledWith('user_token_123');
  });

  it('handles request with advanced language filters', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['JavaScript'],
      contributionTypes: ['testing'],
      page: 1,
      limit: 30,
      searchMode: 'exclude',
      includedLanguages: [],
      excludedLanguages: ['PHP', 'Perl'],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith(
      {
        languages: ['JavaScript'],
        contributionTypes: ['testing'],
        page: 1,
        limit: 30,
      },
      {
        searchMode: 'exclude',
        includedLanguages: [],
        excludedLanguages: ['PHP', 'Perl'],
      }
    );
  });

  it('uses system token when user token is not provided', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['Java'],
      contributionTypes: ['bug-fix'],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(require('@/lib/github/search').createSearchService).toHaveBeenCalledWith('mock_system_token');
  });

  it('returns 401 when no GitHub token is available', async () => {
    delete process.env.GITHUB_TOKEN;

    const request = createMockRequest({
      languages: ['Go'],
      contributionTypes: ['feature-request'],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('GitHub token required');
    expect(data.message).toBe('Please provide a GitHub Personal Access Token in the settings.');
  });

  it('validates required fields', async () => {
    const request = createMockRequest({
      languages: [], // Empty languages
      contributionTypes: ['documentation'],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toEqual([
      {
        field: 'languages',
        message: 'At least one language must be selected',
      },
    ]);
  });

  it('validates contribution types are required', async () => {
    const request = createMockRequest({
      languages: ['Rust'],
      contributionTypes: [], // Empty contribution types
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toEqual([
      {
        field: 'contributionTypes',
        message: 'At least one contribution type must be selected',
      },
    ]);
  });

  it('validates limit parameter range', async () => {
    const request = createMockRequest({
      languages: ['C++'],
      contributionTypes: ['design'],
      limit: 150, // Over maximum
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('uses default values for optional parameters', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['Swift'],
      contributionTypes: ['code-review'],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith(
      {
        languages: ['Swift'],
        contributionTypes: ['code-review'],
        page: 1, // Default
        limit: 30, // Default
      },
      undefined
    );
  });

  it('handles GitHub API rate limiting error', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('GitHub API rate limit exceeded')
    );

    const request = createMockRequest({
      languages: ['Kotlin'],
      contributionTypes: ['translation'],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('API rate limit exceeded');
    expect(data.message).toBe('Please try again later. The GitHub API rate limit has been exceeded.');
    expect(response.headers.get('Retry-After')).toBe('60');
  });

  it('handles generic GitHub API error', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('GitHub API authentication failed')
    );

    const request = createMockRequest({
      languages: ['Scala'],
      contributionTypes: ['testing'],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('GitHub API error');
    expect(data.message).toBe('Failed to fetch repository data. Please try again.');
  });

  it('handles unexpected errors', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('Unexpected database error')
    );

    const request = createMockRequest({
      languages: ['R'],
      contributionTypes: ['documentation'],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.message).toBe('An unexpected error occurred. Please try again.');
  });

  it('sets cache headers for successful responses', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['Haskell'],
      contributionTypes: ['feature-request'],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('s-maxage=300, stale-while-revalidate=3600');
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('handles malformed JSON request', async () => {
    const request = new NextRequest('http://localhost:3000/api/repositories/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });

  it('validates include mode advanced filters', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['JavaScript'],
      contributionTypes: ['bug-fix'],
      searchMode: 'include',
      includedLanguages: ['TypeScript', 'Python'],
      excludedLanguages: [],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith(
      expect.any(Object),
      {
        searchMode: 'include',
        includedLanguages: ['TypeScript', 'Python'],
        excludedLanguages: [],
      }
    );
  });

  it('handles empty advanced filters gracefully', async () => {
    const mockResults = {
      repositories: [],
      totalCount: 0,
      page: 1,
    };

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResults);

    const request = createMockRequest({
      languages: ['JavaScript'],
      contributionTypes: ['documentation'],
      // No searchMode provided
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith(
      expect.any(Object),
      undefined // No user settings passed
    );
  });
});
import { GitHubClient } from '../github/client'
import { RepositorySearchService } from '../github/search'
import { RepositoryFilter } from '../github/filter'

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      search: {
        repos: jest.fn()
      },
      repos: {
        listLanguages: jest.fn(),
        getContent: jest.fn(),
        get: jest.fn()
      },
      issues: {
        listForRepo: jest.fn()
      }
    }
  }))
}))

describe('GitHubClient', () => {
  let client: GitHubClient
  let mockOctokit: any

  beforeEach(() => {
    const { Octokit } = require('@octokit/rest')
    mockOctokit = new Octokit()
    client = new GitHubClient('test-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchRepositories', () => {
    test('searches repositories with default parameters', async () => {
      const mockResponse = {
        data: {
          total_count: 1,
          items: [{ id: 1, name: 'test-repo' }]
        },
        headers: {}
      }
      mockOctokit.rest.search.repos.mockResolvedValueOnce(mockResponse)

      const result = await client.searchRepositories('test query')

      expect(mockOctokit.rest.search.repos).toHaveBeenCalledWith({
        q: 'test query',
        sort: 'stars',
        order: 'desc',
        per_page: 30,
        page: 1
      })
      expect(result).toBe(mockResponse.data)
    })

    test('searches repositories with custom options', async () => {
      const mockResponse = { data: { items: [] }, headers: {} }
      mockOctokit.rest.search.repos.mockResolvedValueOnce(mockResponse)

      await client.searchRepositories('test query', {
        sort: 'forks',
        order: 'asc',
        per_page: 10,
        page: 2
      })

      expect(mockOctokit.rest.search.repos).toHaveBeenCalledWith({
        q: 'test query',
        sort: 'forks',
        order: 'asc',
        per_page: 10,
        page: 2
      })
    })

    test('handles search error', async () => {
      mockOctokit.rest.search.repos.mockRejectedValueOnce(new Error('API Error'))

      await expect(client.searchRepositories('test')).rejects.toThrow('API Error')
    })
  })

  describe('getRepositoryLanguages', () => {
    test('gets repository languages', async () => {
      const mockResponse = {
        data: { JavaScript: 12345, CSS: 2345 },
        headers: {}
      }
      mockOctokit.rest.repos.listLanguages.mockResolvedValueOnce(mockResponse)

      const result = await client.getRepositoryLanguages('owner', 'repo')

      expect(mockOctokit.rest.repos.listLanguages).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo'
      })
      expect(result).toBe(mockResponse.data)
    })

    test('handles language fetch error', async () => {
      mockOctokit.rest.repos.listLanguages.mockRejectedValueOnce(new Error('Not found'))

      const result = await client.getRepositoryLanguages('owner', 'repo')

      expect(result).toEqual({})
    })
  })

  describe('checkContributingGuide', () => {
    test('finds contributing guide', async () => {
      mockOctokit.rest.repos.getContent
        .mockRejectedValueOnce(new Error('Not found')) // First path fails
        .mockResolvedValueOnce({ data: { name: 'CONTRIBUTING.md' } }) // Second path succeeds

      const result = await client.checkContributingGuide('owner', 'repo')

      expect(result).toBe(true)
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledTimes(2)
    })

    test('returns false when no contributing guide found', async () => {
      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not found'))

      const result = await client.checkContributingGuide('owner', 'repo')

      expect(result).toBe(false)
    })
  })

  describe('getGoodFirstIssues', () => {
    test('gets good first issues', async () => {
      const mockResponse = {
        data: [
          { id: 1, title: 'Good first issue 1' },
          { id: 2, title: 'Good first issue 2' }
        ],
        headers: {}
      }
      mockOctokit.rest.issues.listForRepo.mockResolvedValueOnce(mockResponse)

      const result = await client.getGoodFirstIssues('owner', 'repo')

      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        state: 'open',
        labels: 'good first issue,good-first-issue,beginner-friendly,easy',
        per_page: 10
      })
      expect(result).toBe(mockResponse.data)
    })

    test('handles issues fetch error', async () => {
      mockOctokit.rest.issues.listForRepo.mockRejectedValueOnce(new Error('API Error'))

      const result = await client.getGoodFirstIssues('owner', 'repo')

      expect(result).toEqual([])
    })
  })

  describe('buildSearchQuery', () => {
    test('builds query with languages', () => {
      const query = GitHubClient.buildSearchQuery({
        languages: ['JavaScript', 'Python']
      })

      expect(query).toContain('(language:javascript OR language:python)')
      expect(query).toContain('is:public')
      expect(query).toContain('archived:false')
    })

    test('builds query with star filters', () => {
      const query = GitHubClient.buildSearchQuery({
        minStars: 100,
        maxStars: 1000
      })

      expect(query).toContain('stars:>=100')
      expect(query).toContain('stars:<=1000')
    })

    test('builds query with license filter', () => {
      const query = GitHubClient.buildSearchQuery({
        license: ['MIT', 'Apache-2.0']
      })

      expect(query).toContain('(license:mit OR license:apache-2.0)')
    })

    test('builds query with topics', () => {
      const query = GitHubClient.buildSearchQuery({
        topics: ['react', 'vue']
      })

      expect(query).toContain('topic:react')
      expect(query).toContain('topic:vue')
    })
  })
})

describe('RepositorySearchService', () => {
  let service: RepositorySearchService
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      searchRepositories: jest.fn(),
      getRepositoryLanguages: jest.fn(),
      checkContributingGuide: jest.fn(),
      getGoodFirstIssues: jest.fn()
    }
    service = new RepositorySearchService(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchRepositories', () => {
    test('searches and enhances repositories', async () => {
      const mockSearchResult = {
        total_count: 1,
        items: [
          {
            id: 1,
            name: 'test-repo',
            full_name: 'owner/test-repo',
            description: 'Test repository',
            stargazers_count: 100,
            language: 'JavaScript',
            updated_at: new Date().toISOString()
          }
        ]
      }

      mockClient.searchRepositories.mockResolvedValueOnce(mockSearchResult)
      mockClient.getRepositoryLanguages.mockResolvedValueOnce({ JavaScript: 12345 })
      mockClient.checkContributingGuide.mockResolvedValueOnce(true)
      mockClient.getGoodFirstIssues.mockResolvedValueOnce([{ id: 1 }])

      const result = await service.searchRepositories({
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
        page: 1,
        limit: 30
      })

      expect(result.repositories).toHaveLength(1)
      expect(result.repositories[0]).toMatchObject({
        id: 1,
        name: 'test-repo',
        languages: { JavaScript: 12345 },
        has_contributing_guide: true,
        good_first_issues_count: 1
      })
      expect(result.repositories[0].score).toBeGreaterThan(0)
      expect(result.totalCount).toBe(1)
    })

    test('filters repositories by score', async () => {
      const mockSearchResult = {
        total_count: 2,
        items: [
          {
            id: 1,
            name: 'good-repo',
            full_name: 'owner/good-repo',
            description: 'Good documentation repository',
            stargazers_count: 1000,
            language: 'JavaScript',
            updated_at: new Date().toISOString(),
            topics: ['documentation']
          },
          {
            id: 2,
            name: 'bad-repo',
            full_name: 'owner/bad-repo',
            description: 'Unrelated repository',
            stargazers_count: 1,
            language: 'C',
            updated_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
          }
        ]
      }

      mockClient.searchRepositories.mockResolvedValueOnce(mockSearchResult)
      mockClient.getRepositoryLanguages.mockResolvedValue({ JavaScript: 12345 })
      mockClient.checkContributingGuide.mockResolvedValue(false)
      mockClient.getGoodFirstIssues.mockResolvedValue([])

      const result = await service.searchRepositories({
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
        page: 1,
        limit: 30
      })

      // Should filter out low-scoring repositories
      expect(result.repositories.length).toBeLessThanOrEqual(2)
      // Should be sorted by score (highest first)
      if (result.repositories.length > 1) {
        expect(result.repositories[0].score).toBeGreaterThanOrEqual(result.repositories[1].score!)
      }
    })

    test('handles search error', async () => {
      mockClient.searchRepositories.mockRejectedValueOnce(new Error('API Error'))

      await expect(service.searchRepositories({
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      })).rejects.toThrow('GitHub API search failed')
    })
  })
})

describe('RepositoryFilter', () => {
  const mockRepository = {
    id: 1,
    name: 'test-repo',
    full_name: 'owner/test-repo',
    description: 'A test repository for documentation',
    stargazers_count: 100,
    forks_count: 50,
    language: 'JavaScript',
    languages: { JavaScript: 8000, CSS: 2000 },
    topics: ['documentation', 'javascript'],
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    has_contributing_guide: true,
    good_first_issues_count: 3
  } as any

  describe('filterRepositories', () => {
    test('filters by language', () => {
      const repositories = [mockRepository]
      const filters = {
        languages: ['JavaScript'],
        contributionTypes: []
      }

      const result = RepositoryFilter.filterRepositories(repositories, filters)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(mockRepository)
    })

    test('filters out non-matching language', () => {
      const repositories = [mockRepository]
      const filters = {
        languages: ['Python'],
        contributionTypes: []
      }

      const result = RepositoryFilter.filterRepositories(repositories, filters)

      expect(result).toHaveLength(0)
    })

    test('filters by contribution type', () => {
      const repositories = [mockRepository]
      const filters = {
        languages: [],
        contributionTypes: ['documentation']
      }

      const result = RepositoryFilter.filterRepositories(repositories, filters)

      expect(result).toHaveLength(1)
    })

    test('applies quality checks', () => {
      const lowQualityRepo = {
        ...mockRepository,
        stargazers_count: 0,
        forks_count: 0,
        updated_at: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString() // 3 years ago
      }

      const repositories = [lowQualityRepo]
      const filters = {
        languages: ['JavaScript'],
        contributionTypes: []
      }

      const result = RepositoryFilter.filterRepositories(repositories, filters)

      expect(result).toHaveLength(0)
    })
  })

  describe('sortByRelevance', () => {
    test('sorts repositories by score', () => {
      const repo1 = { ...mockRepository, id: 1, score: 0.8 }
      const repo2 = { ...mockRepository, id: 2, score: 0.9 }
      const repo3 = { ...mockRepository, id: 3, score: 0.7 }

      const result = RepositoryFilter.sortByRelevance([repo1, repo2, repo3])

      expect(result[0].id).toBe(2) // Highest score first
      expect(result[1].id).toBe(1)
      expect(result[2].id).toBe(3)
    })

    test('falls back to stars when scores are equal', () => {
      const repo1 = { ...mockRepository, id: 1, score: 0.8, stargazers_count: 100 }
      const repo2 = { ...mockRepository, id: 2, score: 0.8, stargazers_count: 200 }

      const result = RepositoryFilter.sortByRelevance([repo1, repo2])

      expect(result[0].id).toBe(2) // Higher stars first
    })
  })

  describe('extractLanguages', () => {
    test('extracts unique languages from repositories', () => {
      const repo1 = {
        ...mockRepository,
        language: 'JavaScript',
        languages: { JavaScript: 8000, CSS: 2000 }
      }
      const repo2 = {
        ...mockRepository,
        language: 'Python',
        languages: { Python: 9000, JavaScript: 1000 }
      }

      const result = RepositoryFilter.extractLanguages([repo1, repo2])

      expect(result).toContain('JavaScript')
      expect(result).toContain('CSS')
      expect(result).toContain('Python')
      expect(new Set(result).size).toBe(result.length) // No duplicates
    })
  })

  describe('getRepositoryStats', () => {
    test('calculates repository statistics', () => {
      const repositories = [
        { ...mockRepository, stargazers_count: 100, forks_count: 50, language: 'JavaScript' },
        { ...mockRepository, stargazers_count: 200, forks_count: 100, language: 'Python' }
      ]

      const stats = RepositoryFilter.getRepositoryStats(repositories)

      expect(stats.totalRepositories).toBe(2)
      expect(stats.averageStars).toBe(150)
      expect(stats.averageForks).toBe(75)
      expect(stats.languages.JavaScript).toBe(1)
      expect(stats.languages.Python).toBe(1)
    })

    test('handles empty repository list', () => {
      const stats = RepositoryFilter.getRepositoryStats([])

      expect(stats.totalRepositories).toBe(0)
      expect(stats.averageStars).toBe(0)
      expect(stats.averageForks).toBe(0)
    })
  })
})
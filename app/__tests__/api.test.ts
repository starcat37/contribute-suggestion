/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http'
import { POST as recommendHandler } from '../api/repositories/recommend/route'
import { GET as searchHandler } from '../api/repositories/search/route'

// Mock the GitHub search service
jest.mock('../lib/github/search', () => ({
  createSearchService: jest.fn(() => ({
    searchRepositories: jest.fn()
  }))
}))

// Mock the GitHub client
jest.mock('../lib/github/client', () => ({
  getGitHubClient: jest.fn(() => ({
    searchRepositories: jest.fn()
  }))
}))

describe('/api/repositories/recommend', () => {
  let mockSearchService: any

  beforeEach(() => {
    mockSearchService = {
      searchRepositories: jest.fn()
    }
    const { createSearchService } = require('../lib/github/search')
    createSearchService.mockReturnValue(mockSearchService)
    
    // Mock environment variable
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.GITHUB_TOKEN
  })

  test('returns recommendations for valid request', async () => {
    const mockResponse = {
      repositories: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repository',
          stargazers_count: 100,
          score: 0.85
        }
      ],
      totalCount: 1,
      page: 1
    }

    mockSearchService.searchRepositories.mockResolvedValueOnce(mockResponse)

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
        page: 1,
        limit: 30
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.repositories).toHaveLength(1)
    expect(data.totalCount).toBe(1)
    expect(mockSearchService.searchRepositories).toHaveBeenCalledWith({
      languages: ['JavaScript'],
      contributionTypes: ['documentation'],
      page: 1,
      limit: 30
    })
  })

  test('validates required fields', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: [], // Empty array should fail validation
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
    expect(data.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'languages',
          message: 'At least one language must be selected'
        })
      ])
    )
  })

  test('validates contribution types', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: [] // Empty array should fail validation
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
    expect(data.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'contributionTypes',
          message: 'At least one contribution type must be selected'
        })
      ])
    )
  })

  test('validates page parameter', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
        page: 0 // Invalid page number
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
  })

  test('validates limit parameter', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
        limit: 101 // Exceeds maximum
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
  })

  test('handles missing GitHub token', async () => {
    delete process.env.GITHUB_TOKEN

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('GitHub API token not configured')
  })

  test('handles GitHub API rate limit error', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('GitHub API rate limit exceeded')
    )

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('API rate limit exceeded')
    expect(response.headers.get('retry-after')).toBe('60')
  })

  test('handles GitHub API errors', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('GitHub API search failed')
    )

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toBe('GitHub API error')
  })

  test('handles unexpected errors', async () => {
    mockSearchService.searchRepositories.mockRejectedValueOnce(
      new Error('Unexpected error')
    )

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  test('sets proper cache headers', async () => {
    mockSearchService.searchRepositories.mockResolvedValueOnce({
      repositories: [],
      totalCount: 0,
      page: 1
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      }
    })

    const response = await recommendHandler(req as any)

    expect(response.headers.get('cache-control')).toBe('s-maxage=300, stale-while-revalidate=3600')
    expect(response.headers.get('content-type')).toBe('application/json')
  })
})

describe('/api/repositories/search', () => {
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      searchRepositories: jest.fn()
    }
    const { getGitHubClient } = require('../lib/github/client')
    getGitHubClient.mockReturnValue(mockClient)
    
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.GITHUB_TOKEN
  })

  test('searches repositories with query', async () => {
    const mockResponse = {
      total_count: 1,
      items: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repository'
        }
      ]
    }

    mockClient.searchRepositories.mockResolvedValueOnce(mockResponse)

    const { req } = createMocks({
      method: 'GET',
      query: {
        q: 'language:javascript stars:>100',
        sort: 'stars',
        per_page: '10'
      }
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total_count).toBe(1)
    expect(data.items).toHaveLength(1)
    expect(mockClient.searchRepositories).toHaveBeenCalledWith(
      'language:javascript stars:>100',
      {
        sort: 'stars',
        order: 'desc',
        per_page: 10,
        page: 1
      }
    )
  })

  test('validates required query parameter', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: {} // Missing 'q' parameter
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid query parameters')
    expect(data.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'q',
          message: 'Query parameter is required'
        })
      ])
    )
  })

  test('validates sort parameter', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: {
        q: 'test',
        sort: 'invalid-sort' // Invalid sort option
      }
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid query parameters')
  })

  test('validates per_page parameter', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: {
        q: 'test',
        per_page: '101' // Exceeds maximum
      }
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid query parameters')
  })

  test('uses default parameters', async () => {
    const mockResponse = { total_count: 0, items: [] }
    mockClient.searchRepositories.mockResolvedValueOnce(mockResponse)

    const { req } = createMocks({
      method: 'GET',
      query: { q: 'test' }
    })

    await searchHandler(req as any)

    expect(mockClient.searchRepositories).toHaveBeenCalledWith(
      'test',
      {
        sort: undefined,
        order: undefined,
        per_page: 30,
        page: 1
      }
    )
  })

  test('handles search errors', async () => {
    mockClient.searchRepositories.mockRejectedValueOnce(
      new Error('GitHub API error')
    )

    const { req } = createMocks({
      method: 'GET',
      query: { q: 'test' }
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Search failed')
  })

  test('handles rate limit errors', async () => {
    mockClient.searchRepositories.mockRejectedValueOnce(
      new Error('rate limit exceeded')
    )

    const { req } = createMocks({
      method: 'GET',
      query: { q: 'test' }
    })

    const response = await searchHandler(req as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('API rate limit exceeded')
    expect(response.headers.get('retry-after')).toBe('60')
  })

  test('sets proper cache headers', async () => {
    mockClient.searchRepositories.mockResolvedValueOnce({
      total_count: 0,
      items: []
    })

    const { req } = createMocks({
      method: 'GET',
      query: { q: 'test' }
    })

    const response = await searchHandler(req as any)

    expect(response.headers.get('cache-control')).toBe('s-maxage=180, stale-while-revalidate=1800')
    expect(response.headers.get('content-type')).toBe('application/json')
  })
})
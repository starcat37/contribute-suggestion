import { renderHook, act } from '@testing-library/react'
import { useRepositorySearch, useLocalStorage, useSearchHistory } from '../useRepositorySearch'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('useRepositorySearch', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('initial state', () => {
    const { result } = renderHook(() => useRepositorySearch())
    
    expect(result.current.repositories).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.hasMore).toBe(true)
  })

  test('successful search request', async () => {
    const mockResponse = {
      repositories: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repository',
          html_url: 'https://github.com/user/test-repo',
          stargazers_count: 100,
          forks_count: 50,
          language: 'JavaScript'
        }
      ],
      totalCount: 1,
      page: 1
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => useRepositorySearch())

    await act(async () => {
      await result.current.search({
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      })
    })

    expect(result.current.repositories).toEqual(mockResponse.repositories)
    expect(result.current.totalCount).toBe(1)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  test('handles search error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API Error' }),
    } as Response)

    const { result } = renderHook(() => useRepositorySearch())

    await act(async () => {
      await result.current.search({
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      })
    })

    expect(result.current.repositories).toEqual([])
    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  test('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useRepositorySearch())

    await act(async () => {
      await result.current.search({
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      })
    })

    expect(result.current.error).toBe('Network error')
  })

  test('load more functionality', async () => {
    const firstPageResponse = {
      repositories: [{ id: 1, name: 'repo1' }],
      totalCount: 2,
      page: 1
    }

    const secondPageResponse = {
      repositories: [{ id: 2, name: 'repo2' }],
      totalCount: 2,
      page: 2
    }

    // First search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => firstPageResponse,
    } as Response)

    const { result } = renderHook(() => useRepositorySearch())

    await act(async () => {
      await result.current.search({
        languages: ['JavaScript'],
        contributionTypes: ['documentation']
      })
    })

    expect(result.current.repositories).toHaveLength(1)
    expect(result.current.hasMore).toBe(true)

    // Load more
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondPageResponse,
    } as Response)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.repositories).toHaveLength(2)
    expect(result.current.currentPage).toBe(2)
    expect(result.current.hasMore).toBe(false)
  })

  test('reset functionality', () => {
    const { result } = renderHook(() => useRepositorySearch())

    act(() => {
      result.current.reset()
    })

    expect(result.current.repositories).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.hasMore).toBe(true)
  })

  test('prevents multiple simultaneous requests', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ repositories: [], totalCount: 0, page: 1 }),
        } as Response), 100)
      )
    )

    const { result } = renderHook(() => useRepositorySearch())

    // Start multiple requests
    act(() => {
      result.current.search({ languages: ['JavaScript'], contributionTypes: ['documentation'] })
      result.current.search({ languages: ['Python'], contributionTypes: ['bug-fix'] })
    })

    // Should only make one request
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('useLocalStorage', () => {
  const key = 'test-key'
  const initialValue = 'initial'

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue))
    
    expect(result.current[0]).toBe(initialValue)
  })

  test('returns stored value from localStorage', () => {
    const storedValue = 'stored'
    localStorage.setItem(key, JSON.stringify(storedValue))
    
    const { result } = renderHook(() => useLocalStorage(key, initialValue))
    
    expect(result.current[0]).toBe(storedValue)
  })

  test('updates localStorage when value is set', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue))
    
    const newValue = 'new value'
    
    act(() => {
      result.current[1](newValue)
    })
    
    expect(result.current[0]).toBe(newValue)
    expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(newValue))
  })

  test('removes value from localStorage', () => {
    localStorage.setItem(key, JSON.stringify('some value'))
    
    const { result } = renderHook(() => useLocalStorage(key, initialValue))
    
    act(() => {
      result.current[2]() // removeValue
    })
    
    expect(result.current[0]).toBe(initialValue)
    expect(localStorage.removeItem).toHaveBeenCalledWith(key)
  })

  test('handles localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    localStorage.getItem = jest.fn().mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const { result } = renderHook(() => useLocalStorage(key, initialValue))
    
    expect(result.current[0]).toBe(initialValue)
  })

  test('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage(key, 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
  })
})

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('initial state is empty array', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    expect(result.current.searchHistory).toEqual([])
  })

  test('adds search to history', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      result.current.addToHistory(['JavaScript'], ['documentation'], 10)
    })
    
    expect(result.current.searchHistory).toHaveLength(1)
    expect(result.current.searchHistory[0]).toMatchObject({
      languages: ['JavaScript'],
      contributionTypes: ['documentation'],
      resultCount: 10
    })
  })

  test('removes duplicate searches', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      result.current.addToHistory(['JavaScript'], ['documentation'])
      result.current.addToHistory(['Python'], ['bug-fix'])
      result.current.addToHistory(['JavaScript'], ['documentation']) // Duplicate
    })
    
    expect(result.current.searchHistory).toHaveLength(2)
    // Most recent should be first
    expect(result.current.searchHistory[0].languages).toEqual(['JavaScript'])
    expect(result.current.searchHistory[1].languages).toEqual(['Python'])
  })

  test('limits history to 10 entries', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      // Add 15 entries
      for (let i = 0; i < 15; i++) {
        result.current.addToHistory([`Language${i}`], ['documentation'])
      }
    })
    
    expect(result.current.searchHistory).toHaveLength(10)
  })

  test('clears history', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      result.current.addToHistory(['JavaScript'], ['documentation'])
      result.current.clearHistory()
    })
    
    expect(result.current.searchHistory).toEqual([])
  })

  test('gets recent languages', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      result.current.addToHistory(['JavaScript'], ['documentation'])
      result.current.addToHistory(['Python'], ['bug-fix'])
      result.current.addToHistory(['JavaScript'], ['testing']) // JavaScript appears again
    })
    
    const recentLanguages = result.current.getRecentLanguages()
    expect(recentLanguages[0]).toBe('JavaScript') // Most frequent
    expect(recentLanguages).toContain('Python')
  })

  test('gets recent contribution types', () => {
    const { result } = renderHook(() => useSearchHistory())
    
    act(() => {
      result.current.addToHistory(['JavaScript'], ['documentation'])
      result.current.addToHistory(['Python'], ['documentation']) // documentation appears again
      result.current.addToHistory(['Go'], ['bug-fix'])
    })
    
    const recentTypes = result.current.getRecentContributionTypes()
    expect(recentTypes[0]).toBe('documentation') // Most frequent
    expect(recentTypes).toContain('bug-fix')
  })
})
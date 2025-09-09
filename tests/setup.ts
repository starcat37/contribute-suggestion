import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      route: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock window.confirm and window.alert
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Set up test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset document.documentElement.classList
  document.documentElement.className = '';
});

// Add global test utilities
global.testUtils = {
  // Create a mock repository object
  createMockRepository: (overrides = {}) => ({
    id: 1,
    name: 'test-repo',
    full_name: 'user/test-repo',
    description: 'A test repository',
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
    languages: { JavaScript: 80, TypeScript: 20 },
    has_contributing_guide: true,
    good_first_issues_count: 5,
    ...overrides,
  }),
  
  // Create mock search filters
  createMockFilters: (overrides = {}) => ({
    languages: ['JavaScript'],
    contributionTypes: ['good-first-issue'],
    page: 1,
    limit: 30,
    ...overrides,
  }),
  
  // Create mock settings
  createMockSettings: (overrides = {}) => ({
    theme: 'light' as const,
    language: 'ko' as const,
    githubToken: undefined,
    ...overrides,
  }),
};

// Type declarations for global test utilities
declare global {
  namespace globalThis {
    var testUtils: {
      createMockRepository: (overrides?: any) => any;
      createMockFilters: (overrides?: any) => any;
      createMockSettings: (overrides?: any) => any;
    };
  }
}

export {};
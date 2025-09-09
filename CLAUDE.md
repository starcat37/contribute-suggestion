# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a smart algorithm-based open source contribution recommendation system built with Next.js 15.5.2, TypeScript, and the GitHub API. It helps developers find suitable open source projects to contribute to based on their programming language preferences and contribution types using sophisticated pattern matching and scoring algorithms.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Testing Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run CI tests
npm run test:ci

# Run a single test file
npm test -- path/to/test-file.test.ts
```

## Architecture Overview

### Core Architecture Pattern
The application follows a client-server architecture with:
- **Frontend**: React with Next.js App Router, using Server Components where possible
- **Backend**: Next.js API Routes as serverless functions
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with utility-first approach
- **Type Safety**: Full TypeScript implementation with Zod for runtime validation

### Key Architectural Decisions

1. **API Layer** (`app/api/repositories/`)
   - `recommend/route.ts`: Handles repository recommendations with AI scoring
   - `search/route.ts`: Direct GitHub search functionality
   - Uses rate limiting middleware to prevent API abuse
   - Implements server-side caching for performance

2. **GitHub Integration** (`app/lib/github/`)
   - `client.ts`: Octokit wrapper with authentication and rate limit handling
   - `search.ts`: Complex search logic including language filtering, contribution type matching, and algorithmic scoring
   - `filter.ts`: Advanced filtering logic for repositories

3. **Advanced Analysis** (`app/lib/ai/`)
   - `readme-analyzer.ts`: Analyzes README content using 300+ patterns and keywords to determine contribution friendliness
   - Implements sophisticated scoring algorithms based on multiple factors (language match, activity, beginner-friendliness)
   - Uses rule-based analysis with contextual understanding for accurate scoring

4. **Internationalization** (`app/lib/i18n/`)
   - Support for 12 languages
   - Client-side translation system using localStorage for persistence
   - Dynamic language switching without page reload

5. **Component Architecture** (`app/components/`)
   - **Smart Components**: Handle business logic and state (SearchForm, RepositoryList)
   - **Presentational Components**: Pure UI components (RepositoryCard, LoadingSpinner)
   - **Provider Components**: Context providers for theme and settings (ThemeProvider)
   - **Modal Components**: Isolated modal logic (SettingsModal)

6. **Custom Hooks** (`app/hooks/`)
   - `useRepositorySearch`: Manages search state and API calls with TanStack Query
   - `useSettings`: Handles user preferences with localStorage persistence
   - `useTranslation`: Provides i18n functionality

### Data Flow
1. User inputs search criteria → SearchForm component
2. Form submission → useRepositorySearch hook → API route
3. API route → GitHub API client → Data processing & algorithmic scoring
4. Response → TanStack Query cache → UI update
5. User settings persisted in localStorage → Available on next session

### Environment Variables
Required in `.env.local`:
- `GITHUB_TOKEN`: GitHub Personal Access Token for API calls
- `NEXT_PUBLIC_APP_URL`: Application URL for absolute paths

### Testing Strategy
- **Unit Tests**: Components and utilities using Jest and React Testing Library
- **API Tests**: Route handlers with mocked GitHub responses
- **Coverage Requirements**: 70% minimum for branches, functions, lines, and statements
- **Test Location**: Tests are co-located with source files in `__tests__` directories

### Performance Considerations
- Server Components used where possible to reduce client bundle
- API responses cached with appropriate headers
- Debounced search inputs to reduce API calls
- Virtual scrolling for large result sets
- Image optimization with Next.js Image component

### Security Measures
- Rate limiting on API routes (100 requests/hour)
- GitHub token stored server-side only
- Input validation with Zod schemas
- CSRF protection via Next.js middleware
- Content Security Policy headers configured

## Code Conventions

### TypeScript
- Strict mode enabled
- All functions and components must be typed
- Use interface for object shapes, type for unions/intersections
- Avoid `any` type - use `unknown` if type is truly unknown

### React Components
- Functional components only (no class components)
- Use TypeScript for prop types (no PropTypes)
- Components should be pure when possible
- Custom hooks for complex logic extraction

### File Organization
- Components in `app/components/`
- API routes in `app/api/`
- Utility functions in `app/lib/utils/`
- Types in `app/types/` or co-located with usage
- Tests in `__tests__` directories next to source files

### Naming Conventions
- Components: PascalCase (e.g., `RepositoryCard.tsx`)
- Utilities: camelCase (e.g., `formatNumber.ts`)
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase with 'I' prefix for interfaces when needed

### Import Paths
- Use `@/` alias for absolute imports from app directory
- Example: `import { SearchForm } from '@/components/SearchForm'`
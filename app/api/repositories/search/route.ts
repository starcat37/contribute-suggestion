import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

// Query parameter validation schema
const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Query parameter is required'),
  sort: z.enum(['stars', 'forks', 'help-wanted-issues', 'updated']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(30),
  page: z.coerce.number().int().positive().optional().default(1),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = SearchQuerySchema.parse(queryParams);

    // Check for GitHub token
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub API token not configured' },
        { status: 500 }
      );
    }

    // Create GitHub client and search
    const client = getGitHubClient();
    const searchResult = await client.searchRepositories(validatedParams.q, {
      sort: validatedParams.sort,
      order: validatedParams.order,
      per_page: validatedParams.per_page,
      page: validatedParams.page,
    });

    // Return search results
    return NextResponse.json(searchResult, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=180, stale-while-revalidate=1800', // Cache for 3 minutes, serve stale for 30 minutes
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Repository search error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle GitHub API rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'API rate limit exceeded',
          message: 'Please try again later. The GitHub API rate limit has been exceeded.'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: 'An error occurred while searching repositories. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to search repositories.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to search repositories.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to search repositories.' },
    { status: 405 }
  );
}
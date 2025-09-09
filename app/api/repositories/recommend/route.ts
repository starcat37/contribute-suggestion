import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSearchService } from '@/lib/github/search';
import { SearchFilters } from '@/types';

// Request validation schema
const RecommendRequestSchema = z.object({
  languages: z.array(z.string()).min(1, 'At least one language must be selected'),
  contributionTypes: z.array(z.string()).min(1, 'At least one contribution type must be selected'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(30),
  githubToken: z.string().optional(), // User's GitHub token
  // User language settings
  searchMode: z.enum(['include', 'exclude']).optional(),
  includedLanguages: z.array(z.string()).optional().default([]),
  excludedLanguages: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = RecommendRequestSchema.parse(body);

    // Use user's token if provided, otherwise fallback to system token
    const githubToken = validatedData.githubToken || process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json(
        { 
          error: 'GitHub token required',
          message: 'Please provide a GitHub Personal Access Token in the settings.'
        },
        { status: 401 }
      );
    }

    // Create search filters
    const filters: SearchFilters = {
      languages: validatedData.languages,
      contributionTypes: validatedData.contributionTypes,
      page: validatedData.page,
      limit: validatedData.limit,
    };

    // Prepare user settings for language filtering
    const userSettings = validatedData.searchMode ? {
      searchMode: validatedData.searchMode,
      includedLanguages: validatedData.includedLanguages || [],
      excludedLanguages: validatedData.excludedLanguages || [],
    } : undefined;

    // Perform search with custom token
    const searchService = createSearchService(githubToken);
    const result = await searchService.searchRepositories(filters, userSettings);

    // Return results with cache headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600', // Cache for 5 minutes, serve stale for 1 hour
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Repository recommendation error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
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
            'Retry-After': '60' // Suggest retry after 60 seconds
          }
        }
      );
    }

    // Handle other GitHub API errors
    if (error instanceof Error && error.message.includes('GitHub API')) {
      return NextResponse.json(
        { 
          error: 'GitHub API error',
          message: 'Failed to fetch repository data. Please try again.'
        },
        { status: 502 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get repository recommendations.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get repository recommendations.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get repository recommendations.' },
    { status: 405 }
  );
}
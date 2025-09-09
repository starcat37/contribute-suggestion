import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Maximum requests per window
};

function getRateLimitKey(request: NextRequest): string {
  // Use IP address as the key for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return { allowed: true };
  }

  // Reset counter if window has expired
  if (now - record.lastReset > RATE_LIMIT.windowMs) {
    record.count = 1;
    record.lastReset = now;
    return { allowed: true };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT.maxRequests) {
    return { 
      allowed: false, 
      resetTime: record.lastReset + RATE_LIMIT.windowMs 
    };
  }

  // Increment counter
  record.count += 1;
  return { allowed: true };
}

export function middleware(request: NextRequest) {
  // Only apply middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = checkRateLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime!.toString(),
          }
        }
      );
    }

    // Add security headers
    const response = NextResponse.next();
    
    // CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Rate limit headers
    const currentRecord = rateLimitMap.get(rateLimitKey);
    if (currentRecord) {
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT.maxRequests - currentRecord.count).toString());
      response.headers.set('X-RateLimit-Reset', (currentRecord.lastReset + RATE_LIMIT.windowMs).toString());
    }

    return response;
  }

  // For non-API routes, add basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
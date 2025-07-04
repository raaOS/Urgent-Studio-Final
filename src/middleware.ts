import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently disabled because the login system has been removed.
// It simply passes all requests through without any checks.
// To re-enable protection for routes, you can add logic here and update the matcher.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// By default, this middleware will not run on any path.
// To protect specific paths, add them to the matcher array.
// For example, to protect all panel routes: export const config = { matcher: '/panel/:path*' }
export const config = {
  matcher: [],
};

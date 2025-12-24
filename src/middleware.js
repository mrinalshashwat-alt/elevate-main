/**
 * Next.js Middleware for Subdomain Routing
 *
 * Routes requests based on subdomain:
 * - admin.elevatecareer.ai → /admin/* pages
 * - assess.elevatecareer.ai → /user/* pages
 * - elevatecareer.ai → marketing/home pages
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Skip middleware for static files and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Admin portal: admin.elevatecareer.ai or admin.localhost (for local dev)
  if (hostname.startsWith('admin.')) {
    // If not already on an /admin/* path, rewrite to /admin/*
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Candidate portal: assess.elevatecareer.ai or assess.localhost (for local dev)
  else if (hostname.startsWith('assess.')) {
    // If not already on a /user/* path, rewrite to /user/*
    if (!url.pathname.startsWith('/user')) {
      url.pathname = `/user${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Main site: elevatecareer.ai or www.elevatecareer.ai or localhost
  // Serve home/marketing pages as-is

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};

import { NextResponse } from 'next/server';

const BLOCKED_REPOSITORY_PATHS = [
  '/.git',
  '/.hg',
  '/.svn',
];

const BLOCKED_SECRET_FILES = [
  '/.env',
  '/.env.local',
  '/.env.development',
  '/.env.production',
];

function isBlockedProbePath(pathname) {
  return (
    BLOCKED_REPOSITORY_PATHS.some(
      (blockedPath) => pathname === blockedPath || pathname.startsWith(`${blockedPath}/`),
    ) || BLOCKED_SECRET_FILES.includes(pathname)
  );
}

export function middleware(request) {
  if (isBlockedProbePath(request.nextUrl.pathname)) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/.git/:path*',
    '/.hg/:path*',
    '/.svn/:path*',
    '/.env',
    '/.env.local',
    '/.env.development',
    '/.env.production',
  ],
};

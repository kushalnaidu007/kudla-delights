import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_PATH = '/admin';
const PROTECTED_PATHS = ['/checkout', '/account'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith(ADMIN_PATH);
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isAdmin && !isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && token.role !== 'ADMIN') {
    return new NextResponse('Not authorized', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/checkout', '/account/:path*'],
};

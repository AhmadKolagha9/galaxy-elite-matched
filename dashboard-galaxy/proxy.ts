import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, hasAdminAccess, hasSuperAdminAccess, verifyAdminTokenWithBackend } from '@/lib/admin-auth'

const publicPrefixes = ['/login', '/api/admin-session']
const superAdminPrefixes = ['/taxonomy', '/audit-log', '/admin/taxonomy', '/admin/audit-log', '/api/control/taxonomy', '/api/control/audit-log']

function isPublicPath(pathname: string) {
  return publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

function isSuperAdminPath(pathname: string) {
  return superAdminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
  const response = NextResponse.redirect(url)
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const idToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || ''

  if (isPublicPath(pathname)) {
    if (pathname === '/login' && idToken) {
      const session = await verifyAdminTokenWithBackend(idToken).catch(() => null)
      if (hasAdminAccess(session)) return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  const session = idToken ? await verifyAdminTokenWithBackend(idToken).catch(() => null) : null
  if (!hasAdminAccess(session)) return redirectToLogin(request)
  if (isSuperAdminPath(pathname) && !hasSuperAdminAccess(session)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'SuperAdmin claim required.' }, { status: 403 })
    }
    const response = NextResponse.next()
    response.headers.set('x-admin-forbidden', 'super-admin-required')
    response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
    response.headers.set('x-admin-role', session!.roles.join(','))
    return response
  }

  const response = NextResponse.next()
  response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
  response.headers.set('x-admin-role', session!.roles.join(','))
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|manifest.webmanifest).*)']
}

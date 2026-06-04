import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { BACKEND_AUTH_COOKIE, DEMO_COOKIE } from '@/lib/auth-constants'
import { getSupabaseKey, isSupabaseConfigured } from '@/lib/env'

const protectedPrefixes = ['/dashboard', '/admin']

export async function proxy(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  const hasBackendCookie = Boolean(request.cookies.get(BACKEND_AUTH_COOKIE)?.value)
  if (hasBackendCookie) return NextResponse.next()

  if (!isSupabaseConfigured()) {
    const hasDemoCookie = Boolean(request.cookies.get(DEMO_COOKIE)?.value)
    if (!hasDemoCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      }
    }
  })

  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image).*)']
}

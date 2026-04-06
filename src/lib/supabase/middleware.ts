import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // API routes are handled by their own auth checks — skip middleware protection
  if (request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // Build a public paths list
  const publicPaths = ['/auth', '/', '/alpha-database']
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  if (!user && !isPublicPath) {
    // No user and not on a public path, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // User is authenticated — fetch their profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as string | undefined

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth')) {
      const url = request.nextUrl.clone()
      if (role === 'ADMIN') {
        url.pathname = '/admin'
      } else if (role === 'ADMIN_KEUANGAN') {
        url.pathname = '/keuangan'
      } else {
        url.pathname = '/saksi'
      }
      return NextResponse.redirect(url)
    }

    // Role-based route protection
    if (request.nextUrl.pathname.startsWith('/saksi') && role !== 'SAKSI') {
      const url = request.nextUrl.clone()
      if (role === 'ADMIN') url.pathname = '/admin'
      else if (role === 'ADMIN_KEUANGAN') url.pathname = '/keuangan'
      else url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
      const url = request.nextUrl.clone()
      if (role === 'ADMIN_KEUANGAN') url.pathname = '/keuangan'
      else if (role === 'SAKSI') url.pathname = '/saksi'
      else url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/keuangan') && role !== 'ADMIN_KEUANGAN') {
      const url = request.nextUrl.clone()
      if (role === 'ADMIN') url.pathname = '/admin'
      else if (role === 'SAKSI') url.pathname = '/saksi'
      else url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make
  // sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

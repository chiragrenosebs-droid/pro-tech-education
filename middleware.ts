import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/dashboard', '/courses', '/admin', '/profile']
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session) {
    // Get user profile to check role and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session.user.id)
      .single()

    // Block pending students
    if (profile?.role === 'student' && profile?.status !== 'approved') {
      if (!req.nextUrl.pathname.startsWith('/pending')) {
        return NextResponse.redirect(new URL('/pending', req.url))
      }
    }

    // Optionally, redirect admins to /admin if they go to student routes?
    // We'll keep it simple for now.
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
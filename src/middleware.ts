// src/middleware.ts - Authentication middleware
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding', '/profile']
  const authRoutes = ['/auth/login', '/auth/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If user is trying to access protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (isAuthRoute && session) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, is_profile_complete')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        if (profile.user_type === 'freelancer') {
          const redirectUrl = profile.is_profile_complete 
            ? '/dashboard/freelancer' 
            : '/onboarding/skills'
          return NextResponse.redirect(new URL(redirectUrl, req.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard/recruiter', req.url))
        }
      }
    } catch (error) {
      // If there's an error fetching profile, let them continue to auth
      console.error('Error fetching user profile:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = [
  '/',
  '/jobs',
  '/auth/signin',
  '/auth/signup',
  '/api',
  '/favicon.ico',
  '/_next',
  '/public',
]

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // If not authenticated and not on a public page, redirect to signin
  if (!token && !isPublic) {
    const signinUrl = req.nextUrl.clone()
    signinUrl.pathname = '/auth/signin'
    return NextResponse.redirect(signinUrl)
  }

  // If authenticated and on signin/signup, redirect based on role
  if (token && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    const url = req.nextUrl.clone()
    if (token.role === 'ADMIN') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/profile'
    }
    return NextResponse.redirect(url)
  }

  // Optionally, restrict admin pages to admins only
  if (pathname.startsWith('/admin') && token && token.role !== 'ADMIN') {
    const url = req.nextUrl.clone()
    url.pathname = '/profile'
    return NextResponse.redirect(url)
  }

  // Optionally, restrict user-only pages
  if ((pathname.startsWith('/profile') || pathname.startsWith('/applications')) && token && token.role !== 'USER') {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|public|api).*)',
  ],
} 
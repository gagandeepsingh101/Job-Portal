'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="12" cy="11.37" r="3"/></svg>
              <span className="text-xl font-bold text-gray-900">RecruitPro</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
              Jobs
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ADMIN' ? (
                  <>
                    <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/admin/jobs/create" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Post Job
                    </Link>
                    <Link href="/admin/applications" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                      My Profile
                    </Link>
                    <Link href="/applications" className="text-gray-700 hover:text-blue-600 transition-colors">
                      My Applications
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/jobs"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Jobs
              </Link>
              
              {session ? (
                <>
                  {session.user.role === 'ADMIN' ? (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/jobs/create"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Post Job
                      </Link>
                      <Link
                        href="/admin/applications"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Applications
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/applications"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        My Applications
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
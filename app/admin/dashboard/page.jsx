"use client"

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-gray-100 text-gray-700',
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session?.user) return
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/jobs?limit=100&status=ALL`)
        const data = await res.json()
        if (res.ok) {
          // Only show jobs created by this admin
          setJobs(data.jobs.filter(j => j.user?.email === session.user.email))
        } else {
          setError(data.error || 'Failed to fetch jobs')
        }
      } catch (e) {
        setError('Failed to fetch jobs')
      }
      setLoading(false)
    }
    fetchJobs()
  }, [session])

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="p-8 text-red-600">Unauthorized: Admins only.</div>
  }

  // Stats
  const total = jobs.length
  const active = jobs.filter(j => j.status === 'ACTIVE').length
  const closed = jobs.filter(j => j.status === 'CLOSED').length
  const draft = jobs.filter(j => j.status === 'DRAFT').length

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...job, status: newStatus })
      })
      if (res.ok) {
        setJobs(jobs => jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j))
        toast.success(`Job status updated to ${newStatus}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (job) => {
    if (!window.confirm(`Are you sure you want to delete the job "${job.title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
      if (res.ok) {
        setJobs(jobs => jobs.filter(j => j.id !== job.id))
        toast.success('Job deleted successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete job')
      }
    } catch {
      toast.error('Failed to delete job')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 text-black">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 p-6 rounded shadow text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-gray-700 mt-1">Total Jobs</div>
        </div>
        <div className="bg-green-50 p-6 rounded shadow text-center">
          <div className="text-2xl font-bold">{active}</div>
          <div className="text-gray-700 mt-1">Active</div>
        </div>
        <div className="bg-red-50 p-6 rounded shadow text-center">
          <div className="text-2xl font-bold">{closed}</div>
          <div className="text-gray-700 mt-1">Closed</div>
        </div>
        <div className="bg-gray-50 p-6 rounded shadow text-center">
          <div className="text-2xl font-bold">{draft}</div>
          <div className="text-gray-700 mt-1">Draft</div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Posted Jobs</h2>
        {loading ? (
          <div className="text-gray-500">Loading jobs...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-gray-500">No jobs posted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">Title</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Applicants</th>
                  <th className="py-2 px-3 text-left">Created</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b last:border-b-0`}
                    style={{ borderRadius: '0.5rem' }}
                  >
                    <td className="py-3 px-4 font-semibold text-blue-700 whitespace-nowrap">
                      <Link href={`/jobs/${job.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[job.status] || ''}`}>{job.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">{job._count?.applications ?? 0}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 space-x-2">
                      <Link
                        href={`/admin/jobs/edit/${job.id}`}
                        className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Edit
                      </Link>
                      <button
                        className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 font-medium transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        title="Toggle Status"
                        onClick={() => handleToggleStatus(job)}
                      >
                        {job.status === 'ACTIVE' ? 'Close' : 'Activate'}
                      </button>
                      <button
                        className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 font-medium transition focus:outline-none focus:ring-2 focus:ring-red-300"
                        title="Delete"
                        onClick={() => handleDelete(job)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 
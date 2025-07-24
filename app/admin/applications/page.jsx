"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ON_HOLD', label: 'On Hold' },
]

export default function AdminApplications() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const [statusSuccess, setStatusSuccess] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [logs, setLogs] = useState([])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/applications?admin=1')
      const data = await res.json()
      if (res.ok) {
        setApplications(data.applications || [])
      } else {
        setError(data.error || 'Failed to fetch applications')
      }
    } catch (e) {
      setError('Failed to fetch applications')
    }
    setLoading(false)
  }
  useEffect(() => {
    if (!session?.user) return
    fetchApplications()
  }, [session])

  const handleStatusChange = async (id, newStatus) => {
    setStatusUpdating(true)
    setStatusError(null)
    setStatusSuccess(null)
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setApplications(applications => applications.map(app => app.id === id ? { ...app, status: newStatus } : app))
        setStatusSuccess('Status updated!')
        toast.success("Application status update successfully")
      } else {
        const data = await res.json()
        setStatusError(data.error || 'Failed to update status')
      }
    } catch (e) {
      setStatusError('Failed to update status')
    }
    setStatusUpdating(false)
    setTimeout(() => setStatusSuccess(null), 1500)
  }

  const openModal = async (app) => {
    setSelected(app)
    setShowModal(true)
    // Fetch logs
    try {
      const res = await fetch(`/api/applications/${app.id}/logs`)
      const data = await res.json()
      if (res.ok) setLogs(data.logs || [])
      else setLogs([])
    } catch {
      setLogs([])
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="p-8 text-red-600">Unauthorized: Admins only.</div>
  }

  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Applications</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">All Applications</h2>
        {loading ? (
          <div className="text-gray-500">Loading applications...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-gray-500">No applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">Applicant</th>
                  <th className="py-2 px-3 text-left">Job</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Resume</th>
                  <th className="py-2 px-3 text-left">Applied</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-b last:border-b-0 hover:bg-blue-50 cursor-pointer">
                    <td className="py-2 px-3 font-medium text-gray-800" onClick={() => openModal(app)}>
                      {app.user?.name || app.user?.email}
                    </td>
                    <td className="py-2 px-3" onClick={() => openModal(app)}>
                      {app.job?.title}
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                        className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        disabled={statusUpdating}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      {app.resumeUrl ? (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => openModal(app)} className="text-blue-600 hover:underline">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {statusError && <div className="text-red-600 mt-2">{statusError}</div>}
            {statusSuccess && <div className="text-green-600 mt-2">{statusSuccess}</div>}
          </div>
        )}
      </div>
      {/* Modal for application details */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-[#00000080] bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h3 className="text-xl font-bold mb-4">Application Details</h3>
            <div className="mb-2"><span className="font-medium">Applicant:</span> {selected.user?.name || selected.user?.email}</div>
            <div className="mb-2"><span className="font-medium">Job:</span> {selected.job?.title}</div>
            <div className="mb-2"><span className="font-medium">Status:</span> {selected.status}</div>
            <div className="mb-2"><span className="font-medium">Resume:</span> {selected.resumeUrl ? <a href={selected.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : <span className="text-gray-400">N/A</span>}</div>
            <div className="mb-2"><span className="font-medium">Applied:</span> {new Date(selected.createdAt).toLocaleDateString()}</div>
            <div className="mb-4"><span className="font-medium">Answers:</span>
              <ul className="list-disc ml-6 mt-1">
                {selected.answers && Object.entries(selected.answers).map(([k, v]) => (
                  <li key={k}><span className="font-semibold">{k}:</span> {String(v)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Status Logs</h4>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {logs.length === 0 ? <div className="text-gray-400">No logs.</div> : logs.map((log, i) => (
                  <div key={i} className="mb-1 text-xs">
                    <span className="font-semibold">{log.status}</span> - {log.notes || 'No notes'} <span className="text-gray-400">({new Date(log.createdAt).toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
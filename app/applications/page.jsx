"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ON_HOLD: 'bg-gray-100 text-gray-700',
}

export default function MyApplications() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    const fetchApplications = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/applications')
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
    fetchApplications()
  }, [session])

  if (!session || session.user.role !== 'USER') {
    return <div className="p-8 text-red-600">Unauthorized: Job seekers only.</div>
  }

  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">My Applications</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Applications</h2>
        {loading ? (
          <div className="text-gray-500">Loading applications...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-gray-500">You have not applied to any jobs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">Job</th>
                  <th className="py-2 px-3 text-left">Department</th>
                  <th className="py-2 px-3 text-left">Location</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Resume</th>
                  <th className="py-2 px-3 text-left">Applied</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-b last:border-b-0 hover:bg-blue-50 cursor-pointer">
                    <td className="py-2 px-3 font-medium text-blue-700" onClick={() => { setSelected(app); setShowModal(true) }}>{app.job?.title}</td>
                    <td className="py-2 px-3" onClick={() => { setSelected(app); setShowModal(true) }}>{app.job?.department}</td>
                    <td className="py-2 px-3" onClick={() => { setSelected(app); setShowModal(true) }}>{app.job?.location}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[app.status] || ''}`}>{app.status}</span>
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
                      <button onClick={() => { setSelected(app); setShowModal(true) }} className="text-blue-600 hover:underline">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal for application details */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h3 className="text-xl font-bold mb-4">Application Details</h3>
            <div className="mb-2"><span className="font-medium">Job:</span> {selected.job?.title}</div>
            <div className="mb-2"><span className="font-medium">Department:</span> {selected.job?.department}</div>
            <div className="mb-2"><span className="font-medium">Location:</span> {selected.job?.location}</div>
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
                {selected.statusLogs && selected.statusLogs.length === 0 ? <div className="text-gray-400">No logs.</div> : (selected.statusLogs || []).map((log, i) => (
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
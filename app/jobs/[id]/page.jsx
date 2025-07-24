'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Building, DollarSign, Clock, FileText, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import FileUpload from '@/components/FileUpload'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'


export default function JobDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [formData, setFormData] = useState({})
  const [resume, setResume] = useState(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const { id } = useParams()
  console.log(id)
  useEffect(() => {
    fetchJob()
    checkApplicationStatus()
  }, [id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`)
      const data = await response.json()
      setJob(data)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/applications?jobId=${id}`)
      const data = await response.json()
      setHasApplied(data.applications.length > 0)
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const uploadResume = async (file) => {
    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading resume:', error)
      throw error
    } finally {
      setUploadingResume(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setApplying(true)

    try {
      let resumeUrl = ''
      if (resume) {
        resumeUrl = await uploadResume(resume)
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: id,
          answers: formData,
          resumeUrl,
        }),
      })

      if (response.ok) {
        setHasApplied(true)
        toast.success(data.message || "Application submitted successfully!")
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying:', error)
      toast.error('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Job Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {/* {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })} */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              <span>Posted by {job.user.name}</span>
            </div>
          </div>

          {/* Job Details */}
          <div className="p-6">
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="text-gray-700 whitespace-pre-line">{job.description}</div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Requirements</h2>
              <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
            </div>

            {/* Application Form */}
            {session?.user?.role === 'USER' && (
              <div className="border-t border-gray-200 pt-8">
                {hasApplied ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800 font-medium">
                      You have already applied to this job. Check your application status in your profile.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply for this Job</h2>

                    <form onSubmit={handleApply} className="space-y-6">
                      {/* Resume Upload */}
                      {job.resumeRequired && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resume (Required) <span className="text-red-500">*</span>
                          </label>
                          <FileUpload
                            onFileSelect={setResume}
                            accept=".pdf"
                            maxSize={5 * 1024 * 1024}
                          />
                        </div>
                      )}

                      {/* Custom Fields */}
                      {job.customFields?.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>

                          {field.type === 'text' && (
                            <input
                              type="text"
                              required={field.required}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              required={field.required}
                              rows={4}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'select' && (
                            <select
                              required={field.required}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select an option</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-2">
                              {field.options?.map((option) => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    required={field.required}
                                    checked={formData[field.id] === option}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={applying || uploadingResume || (job.resumeRequired && !resume)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applying ? 'Submitting...' : uploadingResume ? 'Uploading Resume...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {!session && (
              <div className="border-t border-gray-200 pt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800">
                    <span className="font-medium">Want to apply for this job?</span>{' '}
                    <a href="/auth/signin" className="underline hover:no-underline">
                      Sign in
                    </a>{' '}
                    or{' '}
                    <a href="/auth/signup" className="underline hover:no-underline">
                      create an account
                    </a>{' '}
                    to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
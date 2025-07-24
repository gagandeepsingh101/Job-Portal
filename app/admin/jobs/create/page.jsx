"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { jobSchema } from '@/lib/validations'
import toast from 'react-hot-toast'

const simpleJobSchema = jobSchema.omit({ customFields: true })

const questionTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' }
]

export default function AdminJobCreate() {
  const { data: session } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    department: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    resumeRequired: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [customFields, setCustomFields] = useState([])

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="p-8 text-red-600">Unauthorized: Admins only.</div>
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddQuestion = () => {
    setCustomFields(prev => [
      ...prev,
      { id: Date.now().toString(), label: '', type: 'text', required: false, options: [] }
    ])
  }

  const handleRemoveQuestion = (id) => {
    setCustomFields(prev => prev.filter(q => q.id !== id))
  }

  const handleQuestionChange = (id, field, value) => {
    setCustomFields(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleOptionChange = (id, options) => {
    setCustomFields(prev => prev.map(q => q.id === id ? { ...q, options } : q))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)
    try {
      const validated = jobSchema.parse({ ...form, customFields })
      setLoading(true)
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      })
      setLoading(false)
      if (res.ok) {
        setSuccess(true)
        setForm({
          title: '',
          department: '',
          location: '',
          salary: '',
          description: '',
          requirements: '',
          resumeRequired: false
        })
        setCustomFields([])
        toast.success("New Job add successfully")
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        setErrors({ api: data.error || 'Failed to create job.' })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {}
        err.errors.forEach(e => {
          fieldErrors[e.path[0]] = e.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ api: 'Something went wrong.' })
      }
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Post a New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Details Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1 text-gray-700">Title<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Frontend Developer"
                />
                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700">Department<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Engineering"
                />
                {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700">Location<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Remote, New York"
                />
                {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700">Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
            </div>
          </div>

          {/* Description & Requirements Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Description<span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={4}
                placeholder="Describe the job role, responsibilities, etc."
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Requirements<span className="text-red-500">*</span></label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={4}
                placeholder="List required skills, experience, etc."
              />
              {errors.requirements && <p className="text-red-600 text-xs mt-1">{errors.requirements}</p>}
            </div>
          </div>

          {/* Resume Required Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="resumeRequired"
              checked={form.resumeRequired}
              onChange={handleChange}
              id="resumeRequired"
              className="accent-blue-600 w-5 h-5"
            />
            <label htmlFor="resumeRequired" className="font-medium text-gray-700">Resume Required</label>
          </div>

          {/* Custom Questions Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Custom Questions</h2>
            <div className="space-y-4">
              {customFields.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 p-4 rounded bg-gray-50 relative">
                  <div className="flex flex-col md:flex-row gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Question label"
                      value={q.label}
                      onChange={e => handleQuestionChange(q.id, 'label', e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <select
                      value={q.type}
                      onChange={e => handleQuestionChange(q.id, 'type', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {questionTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-gray-700">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={e => handleQuestionChange(q.id, 'required', e.target.checked)}
                        className="accent-blue-600"
                      />
                      Required
                    </label>
                    <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 hover:text-red-700 ml-2 text-sm font-medium">Remove</button>
                  </div>
                  {(q.type === 'select' || q.type === 'radio') && (
                    <div className="mb-2">
                      <label className="block text-sm text-gray-600 mb-1">Options <span className="text-gray-400">(comma separated)</span></label>
                      <input
                        type="text"
                        value={q.options ? q.options.join(',') : ''}
                        onChange={e => handleOptionChange(q.id, e.target.value.split(',').map(opt => opt.trim()).filter(Boolean))}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g. Option 1, Option 2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddQuestion} className="mt-2 bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 border border-blue-200 font-medium transition">+ Add Question</button>
          </div>

          {/* Error & Success Feedback */}
          {errors.api && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2 text-sm">{errors.api}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-2 text-sm">Job posted successfully!</div>}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 font-semibold text-lg transition"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
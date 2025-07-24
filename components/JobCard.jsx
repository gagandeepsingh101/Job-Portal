import Link from 'next/link'
import { MapPin, Building, DollarSign, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'



export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
          <Link href={`/jobs/${job.id}`}>
            {job.title}
          </Link>
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-2" />
          <span>{job.department}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{job.location}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <Link
          href={`/jobs/${job.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
        
        {job._count && (
          <span className="text-sm text-gray-500">
            {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
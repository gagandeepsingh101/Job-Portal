export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">RecruitPro</h3>
            <p className="text-gray-300 mb-4">
              Your premier destination for finding the perfect job opportunities and top talent.
              Connect with leading companies and talented professionals.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="/auth/signup" className="hover:text-white transition-colors">Create Account</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profile</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/admin/jobs/create" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/admin/applications" className="hover:text-white transition-colors">Manage Applications</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 RecruitPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
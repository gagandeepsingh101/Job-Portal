"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (status === 'authenticated') {
      try {
        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        setProfile(profileData);

        const appsRes = await fetch('/api/applications');
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);

        setLoading(false);
      } catch (error) {
        setError('Failed to load data');
        setLoading(false);
      }
    }
  };
  useEffect(() => {

    fetchData();
  }, [status]);
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name || '',
          phone: profile.phone || '',
          location: profile.location || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') return <LoadingSpinner />;
  if (!profile) return <div className="p-8">No profile found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input type="email" value={profile.email} disabled className="w-full border rounded p-2 bg-gray-100" />
        </div>
        <div>
          <label className="block font-medium">Name</label>
          <input name="name" value={profile.name || ''} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Phone</label>
          <input name="phone" value={profile.phone || ''} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Location</label>
          <input name="location" value={profile.location || ''} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
      <h2 className="text-xl font-bold mt-8 mb-4">My Applications</h2>
      <div className="space-y-2">
        {applications.length === 0 ? (
          <div>No applications found.</div>
        ) : (
          applications.map(app => (
            <div key={app.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">{app.jobTitle}</div>
                <div className="text-sm text-gray-600">Status: {app.status}</div>
              </div>
              <div className="text-sm text-gray-500">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
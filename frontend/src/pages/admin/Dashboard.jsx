import React, { useEffect, useState } from 'react'
import api from '../../api'

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ interns: 0, tasks: 0, pending: 0, announcements: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/interns'),
      api.get('/tasks'),
      api.get('/announcements'),
    ]).then(([i, t, a]) => {
      setStats({
        interns: i.data.length,
        tasks: t.data.length,
        pending: t.data.filter(t => t.status === 'pending').length,
        announcements: a.data.length,
      })
      setAnnouncements(a.data.slice(-3).reverse())
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Interns" value={stats.interns} icon="👥" color="border-blue-500" />
        <StatCard label="Total Tasks" value={stats.tasks} icon="✅" color="border-green-500" />
        <StatCard label="Pending Tasks" value={stats.pending} icon="⏳" color="border-yellow-500" />
        <StatCard label="Announcements" value={stats.announcements} icon="📢" color="border-purple-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{a.title}</h3>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

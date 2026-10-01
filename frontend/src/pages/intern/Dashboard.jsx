import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function InternDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/tasks'),
      api.get('/announcements'),
      api.get('/attendance'),
    ]).then(([t, a, att]) => {
      setTasks(t.data)
      setAnnouncements(a.data.reverse().slice(0, 3))
      setAttendance(att.data[0] || null)
    }).finally(() => setLoading(false))
  }, [])

  const checkin = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/checkin')
      setAttendance(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const checkout = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/checkout')
      setAttendance(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>

  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const pending = tasks.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{completed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{pending}</p>
        </div>
      </div>

      {/* Attendance Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
        {attendance ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500">Check In</p>
              <p className="font-semibold text-green-600">{formatTime(attendance.checkIn)}</p>
            </div>
            {attendance.checkOut ? (
              <div>
                <p className="text-xs text-gray-500">Check Out</p>
                <p className="font-semibold text-red-500">{formatTime(attendance.checkOut)}</p>
              </div>
            ) : (
              <button onClick={checkout} disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {actionLoading ? 'Processing...' : '🚪 Check Out'}
              </button>
            )}
            {attendance.checkOut && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Done for today</span>
            )}
          </div>
        ) : (
          <button onClick={checkin} disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {actionLoading ? 'Processing...' : '✅ Check In'}
          </button>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{task.title}</p>
                  {task.dueDate && <p className="text-xs text-gray-400 mt-0.5">Due: {task.dueDate}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 text-sm">{a.title}</h3>
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

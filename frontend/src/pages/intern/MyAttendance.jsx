import React, { useEffect, useState } from 'react'
import api from '../../api'

export default function MyAttendance() {
  const [records, setRecords] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAttendance = async () => {
    const res = await api.get('/attendance')
    setRecords(res.data)
    setAttendance(res.data[0] || null)
    setLoading(false)
  }

  useEffect(() => { fetchAttendance() }, [])

  const checkin = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/checkin')
      setAttendance(res.data)
      setRecords([res.data])
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
      setRecords(prev => prev.map(r => r.id === res.data.id ? res.data : r))
    } catch (err) {
      setError(err.response?.data?.error || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  const todayCheckedIn = attendance && !attendance.checkOut
  const todayDone = attendance && attendance.checkOut

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

      {/* Today's status card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Today</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}

        {!attendance && (
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm">You haven't checked in yet today.</p>
            <button onClick={checkin} disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
              {actionLoading ? 'Processing...' : '✅ Check In'}
            </button>
          </div>
        )}

        {todayCheckedIn && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Active since {formatTime(attendance.checkIn)}</span>
            </div>
            <button onClick={checkout} disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
              {actionLoading ? 'Processing...' : '🚪 Check Out'}
            </button>
          </div>
        )}

        {todayDone && (
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-gray-500">Check In</p>
              <p className="font-semibold text-green-600">{formatTime(attendance.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Check Out</p>
              <p className="font-semibold text-red-500">{formatTime(attendance.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold text-gray-700">
                {Math.round((new Date(attendance.checkOut) - new Date(attendance.checkIn)) / 3600000 * 10) / 10}h
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Done for today ✓</span>
          </div>
        )}
      </div>

      {/* Records table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Date', 'Check In', 'Check Out', 'Duration'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(r => {
              const duration = r.checkOut
                ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000 * 10) / 10 + 'h'
                : 'Active'
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTime(r.checkIn)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTime(r.checkOut)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${duration === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {duration}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-center py-10 text-gray-500">No attendance records yet.</p>}
      </div>
    </div>
  )
}

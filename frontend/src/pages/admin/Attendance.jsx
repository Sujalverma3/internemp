import React, { useEffect, useState } from 'react'
import api from '../../api'

export default function AdminAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance').then(r => { setRecords(r.data); setLoading(false) })
  }, [])

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Today's Attendance</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Intern', 'Check In', 'Check Out', 'Duration'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(r => {
              const duration = r.checkOut ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000 * 10) / 10 + 'h' : 'Active'
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm">{r.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTime(r.checkIn)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTime(r.checkOut)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${duration === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{duration}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-center py-10 text-gray-500">No attendance records for today.</p>}
      </div>
    </div>
  )
}

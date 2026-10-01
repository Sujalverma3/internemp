import React, { useEffect, useState } from 'react'
import api from '../../api'

const emptyForm = { name: '', email: '', password: '', department: '', startDate: '' }

export default function Interns() {
  const [interns, setInterns] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchInterns = async () => {
    const res = await api.get('/interns')
    setInterns(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchInterns() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/interns/${editing}`, form)
    } else {
      await api.post('/interns', form)
    }
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
    fetchInterns()
  }

  const handleEdit = (intern) => {
    setForm({ name: intern.name, email: intern.email, password: '', department: intern.department || '', startDate: intern.startDate || '' })
    setEditing(intern.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this intern?')) return
    await api.delete(`/interns/${id}`)
    fetchInterns()
  }

  const statusBadge = (status) => {
    const colors = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-600' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Interns</h1>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Add Intern
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Intern' : 'Add Intern'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['name', 'email', 'department'].map(f => (
                <div key={f}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f}</label>
                  <input type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required={f !== 'department'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {editing && '(leave blank to keep)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Email', 'Department', 'Start Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interns.map(intern => (
              <tr key={intern.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-xs font-bold">{intern.name?.[0]}</span>
                    </div>
                    <span className="font-medium text-sm">{intern.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{intern.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{intern.department || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{intern.startDate || '—'}</td>
                <td className="px-6 py-4">{statusBadge(intern.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(intern)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(intern.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {interns.length === 0 && <p className="text-center py-10 text-gray-500">No interns found.</p>}
      </div>
    </div>
  )
}

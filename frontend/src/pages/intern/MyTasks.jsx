import React, { useEffect, useState } from 'react'
import api from '../../api'

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const statusOptions = ['pending', 'in-progress', 'completed']
const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchTasks = async () => {
    const res = await api.get('/tasks')
    setTasks(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId)
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">No tasks assigned to you yet.</div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                  {task.description && <p className="text-sm text-gray-500 mb-3">{task.description}</p>}
                  {task.dueDate && <p className="text-xs text-gray-400 mb-3">📅 Due: {task.dueDate}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[task.status]}`}>{task.status}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(task.id, s)}
                    disabled={task.status === s || updating === task.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      task.status === s
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                    }`}>
                    {updating === task.id && task.status !== s ? '...' : s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

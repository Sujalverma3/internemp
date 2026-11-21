import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion'
import { Search, CheckCircle2, Clock, Hourglass, ArrowRight } from 'lucide-react'

const statusVariant = { completed: 'success', 'in-progress': 'info', pending: 'muted' }
const priorityVariant = { high: 'destructive', medium: 'warning', low: 'muted' }
const nextStatusMap = { pending: 'in-progress', 'in-progress': 'completed' }

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const updateStatus = async (task, nextStatus) => {
    await api.put(`/tasks/${task.id}`, { status: nextStatus })
    fetchTasks()
  }

  const filtered = tasks.filter(t => {
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading tasks…</div>

  const countPending = tasks.filter(t => t.status === 'pending').length
  const countInProgress = tasks.filter(t => t.status === 'in-progress').length
  const countCompleted = tasks.filter(t => t.status === 'completed').length

  return (
    <PageTransition className="space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Assigned Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.length} total tasks • {countCompleted} completed
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant={filterStatus === '' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('')}
            >
              All ({tasks.length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({countPending})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('in-progress')}
            >
              In Progress ({countInProgress})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({countCompleted})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <StaggerList className="space-y-2.5">
        {filtered.map(task => (
          <StaggerItem key={task.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{task.title}</h3>
                    <Badge variant={priorityVariant[task.priority] || 'muted'}>{task.priority}</Badge>
                    <Badge variant={statusVariant[task.status] || 'muted'}>{task.status}</Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-zinc-400 font-mono">Target Due: {task.dueDate}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(task, 'in-progress')}
                      className="text-xs"
                    >
                      Start Task <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                  {task.status === 'in-progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(task, 'completed')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                    </Button>
                  )}
                  {task.status === 'completed' && (
                    <Badge variant="success" className="text-xs py-1">
                      Completed ✓
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-14 text-center text-sm text-muted-foreground">
              {tasks.length === 0
                ? 'No tasks assigned yet. You are all caught up!'
                : 'No tasks match your selected filter.'}
            </CardContent>
          </Card>
        )}
      </StaggerList>
    </PageTransition>
  )
}

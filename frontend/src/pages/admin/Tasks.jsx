import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion'

const emptyForm = { title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'pending' }
const priorityVariant = { high: 'destructive', medium: 'warning', low: 'muted' }
const statusVariant = { completed: 'success', 'in-progress': 'info', pending: 'muted' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [interns, setInterns] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIntern, setFilterIntern] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const [t, i] = await Promise.all([api.get('/tasks'), api.get('/interns')])
    setTasks(t.data); setInterns(i.data); setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) { await api.put(`/tasks/${editing}`, form) }
    else { await api.post('/tasks', form) }
    setForm(emptyForm); setEditing(null); setShowForm(false); fetchData()
  }

  const openEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', assignedTo: task.assignedTo || '', priority: task.priority || 'medium', dueDate: task.dueDate || '', status: task.status || 'pending' })
    setEditing(task.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/tasks/${id}`); fetchData()
  }

  const internName = (id) => interns.find(i => i.id === id)?.name || '—'

  const filtered = tasks.filter(t => {
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchIntern = !filterIntern || t.assignedTo === filterIntern
    return matchStatus && matchIntern
  })

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading…</div>

  return (
    <PageTransition className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} total</p>
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}>
          <Plus className="w-4 h-4" /> New task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filterIntern} onChange={e => setFilterIntern(e.target.value)} className="h-9 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All interns</option>
            {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {(filterStatus || filterIntern) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(''); setFilterIntern('') }}>Clear</Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {tasks.length}</span>
        </CardContent>
      </Card>

      {/* Task list */}
      <StaggerList className="space-y-2">
        {filtered.map(task => (
          <StaggerItem key={task.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                    <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground mb-1.5">{task.description}</p>}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{internName(task.assignedTo)}</span>
                    {task.dueDate && <span>Due {task.dueDate}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(task)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
            {tasks.length === 0 ? 'No tasks yet. Create your first.' : 'No tasks match the filters.'}
          </CardContent></Card>
        )}
      </StaggerList>

      {/* Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit task' : 'New task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="flex w-full border border-input rounded-md px-3 py-2 text-sm bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} required className="flex h-9 w-full border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select intern…</option>
                {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="flex h-9 w-full border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="flex h-9 w-full border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1">{editing ? 'Save changes' : 'Create task'}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageTransition, AnimatedRow } from '@/components/motion'

const emptyForm = { name: '', email: '', password: '', department: '', startDate: '', status: 'active' }

export default function Interns() {
  const [interns, setInterns] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formError, setFormError] = useState('')

  const fetchInterns = async () => {
    const res = await api.get('/interns')
    setInterns(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchInterns() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const payload = { ...form }
    if (editing && !payload.password) delete payload.password
    try {
      if (editing) { await api.put(`/interns/${editing}`, payload) }
      else { await api.post('/interns', payload) }
      setForm(emptyForm); setEditing(null); setShowForm(false); fetchInterns()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed. Please verify the input.')
    }
  }

  const handleEdit = (intern) => {
    setFormError('')
    setForm({ name: intern.name, email: intern.email, password: '', department: intern.department || '', startDate: intern.startDate || '', status: intern.status || 'active' })
    setEditing(intern.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this intern?')) return
    await api.delete(`/interns/${id}`); fetchInterns()
  }

  const filtered = interns.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !q || i.name?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q) || i.department?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || i.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading…</div>

  return (
    <PageTransition className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Interns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{interns.length} total</p>
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}>
          <Plus className="w-4 h-4" /> Add intern
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name, email or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-9 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || filterStatus) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterStatus('') }}>Clear</Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {interns.length}</span>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Department</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Start</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((intern, idx) => (
                <AnimatedRow key={intern.id} index={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-semibold">{intern.name?.[0]}</span>
                      </div>
                      <span className="font-medium">{intern.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{intern.email}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{intern.department || '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{intern.startDate || '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={intern.status === 'active' ? 'success' : 'muted'}>{intern.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(intern)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(intern.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </AnimatedRow>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                  {interns.length === 0 ? 'No interns yet. Add your first one.' : 'No results for current filters.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setFormError(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit intern' : 'Add intern'}</DialogTitle>
          </DialogHeader>
          {formError && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            {['name', 'email', 'department'].map(f => (
              <div key={f} className="space-y-1.5">
                <Label className="capitalize">{f}</Label>
                <Input type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required={f !== 'department'} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>{editing ? 'New password (optional)' : 'Password'}</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="flex h-9 w-full border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1">{editing ? 'Save changes' : 'Add intern'}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

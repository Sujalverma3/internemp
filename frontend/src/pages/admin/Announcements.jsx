import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState({ title: '', content: '' })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAnnouncements = async () => {
    const res = await api.get('/announcements')
    setAnnouncements(res.data.reverse()); setLoading(false)
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/announcements', form)
    setForm({ title: '', content: '' }); setShowForm(false); fetchAnnouncements()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    await api.delete(`/announcements/${id}`); fetchAnnouncements()
  }

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading…</div>

  return (
    <PageTransition className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{announcements.length} posted</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New announcement
        </Button>
      </div>

      <StaggerList className="space-y-3">
        {announcements.map(a => (
          <StaggerItem key={a.id}>
            <Card>
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{a.title}</h3>
                      <span className="text-xs text-muted-foreground">· {a.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">by {a.author}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
        {announcements.length === 0 && (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No announcements yet.</CardContent></Card>
        )}
      </StaggerList>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} required className="flex w-full border border-input rounded-md px-3 py-2 text-sm bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1">Post</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

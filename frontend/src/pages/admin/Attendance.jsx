import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageTransition, AnimatedRow } from '@/components/motion'

export default function AdminAttendance() {
  const [records, setRecords] = useState([])
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0])
  const [filterIntern, setFilterIntern] = useState('')
  const [showAll, setShowAll] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const url = showAll ? '/attendance?history=true' : '/attendance'
    const [rec, intern] = await Promise.all([api.get(url), api.get('/interns')])
    setRecords(rec.data); setInterns(intern.data); setLoading(false)
  }

  useEffect(() => { fetchData() }, [showAll])

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const filtered = records.filter(r => {
    const matchDate = showAll ? (!filterDate || r.date === filterDate) : true
    const matchIntern = !filterIntern || r.userId === filterIntern
    return matchDate && matchIntern
  })

  const totalPresent = new Set(filtered.map(r => r.userId)).size

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading…</div>

  return (
    <PageTransition className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {showAll ? 'Attendance history' : "Today's attendance"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalPresent} intern{totalPresent !== 1 ? 's' : ''} · {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant={showAll ? 'default' : 'outline'} size="sm" onClick={() => { setShowAll(!showAll); setFilterDate('') }}>
          {showAll ? 'Back to today' : 'View all history'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          {showAll && (
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="h-9 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}
          <select value={filterIntern} onChange={e => setFilterIntern(e.target.value)} className="h-9 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All interns</option>
            {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {(filterDate || filterIntern) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterDate(''); setFilterIntern('') }}>Clear</Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Intern</th>
                {showAll && <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>}
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Check in</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Check out</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const durationMs = r.checkOut ? new Date(r.checkOut) - new Date(r.checkIn) : null
                const durationH = durationMs ? Math.round(durationMs / 3600000 * 10) / 10 : null
                return (
                  <AnimatedRow key={r.id} index={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-semibold">{r.userName?.[0]}</span>
                        </div>
                        <span className="font-medium">{r.userName}</span>
                      </div>
                    </td>
                    {showAll && <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>}
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{formatTime(r.checkIn)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{formatTime(r.checkOut)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{durationH !== null ? `${durationH}h` : '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={r.checkOut ? 'muted' : 'success'}>{r.checkOut ? 'Checked out' : 'Active'}</Badge>
                    </td>
                  </AnimatedRow>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={showAll ? 6 : 5} className="text-center py-12 text-sm text-muted-foreground">
                  {records.length === 0
                    ? (showAll ? 'No attendance records found.' : 'No attendance for today.')
                    : 'No records match the filters.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  )
}

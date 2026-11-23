import React, { useEffect, useState } from 'react'
import api from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogIn, LogOut, CalendarDays, Clock, CheckCircle, Flame } from 'lucide-react'
import { PageTransition, AnimatedRow, AnimatedCard } from '@/components/motion'

export default function MyAttendance() {
  const [attendance, setAttendance] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const [att, hist] = await Promise.all([
        api.get('/attendance'),
        api.get('/attendance?history=true'),
      ])
      setAttendance(att.data[0] || null)
      setRecords(hist.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const checkin = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/checkin')
      setAttendance(res.data)
      fetchData()
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
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const formatDuration = (checkIn, checkOut, durationMinutes) => {
    if (!checkIn) return '—'
    if (!checkOut) return 'In session'
    const totalMin = durationMinutes !== undefined && durationMinutes !== null
      ? durationMinutes
      : Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 60000))
    const hrs = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    if (hrs === 0) return `${mins}m`
    if (mins === 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  if (loading) return <div className="text-center py-20 text-sm text-muted-foreground">Loading attendance…</div>

  const todayCheckedIn = attendance && !attendance.checkOut
  const todayDone = attendance && attendance.checkOut

  // Calculate summary stats
  const totalDays = records.length
  const totalHours = records.reduce((acc, r) => {
    if (!r.checkIn || !r.checkOut) return acc
    const diff = (new Date(r.checkOut) - new Date(r.checkIn)) / 3600000
    return acc + Math.max(0, diff)
  }, 0)
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0

  return (
    <PageTransition className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Attendance Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track daily work check-ins, logged durations, and your overall attendance streak.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AnimatedCard>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Days Present</p>
                <p className="text-xl font-bold tracking-tight tabular-nums">{totalDays} days</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hours Logged</p>
                <p className="text-xl font-bold tracking-tight tabular-nums">{totalHours.toFixed(1)} hrs</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Daily Hours</p>
                <p className="text-xl font-bold tracking-tight tabular-nums">{avgHours} hrs/day</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Today's Check In Station */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-3 text-zinc-950 dark:text-zinc-50">Today's Session</h2>
          {error && (
            <div className="mb-3 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          {!attendance && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">You haven't checked in yet today.</p>
                <p className="text-xs text-muted-foreground mt-0.5">Click below to record your arrival time.</p>
              </div>
              <Button size="sm" onClick={checkin} disabled={actionLoading}>
                <LogIn className="w-3.5 h-3.5 mr-1" />
                {actionLoading ? 'Recording…' : 'Check In Today'}
              </Button>
            </div>
          )}

          {todayCheckedIn && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Active Session in Progress
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                    Checked in at {formatTime(attendance.checkIn)}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={checkout} disabled={actionLoading} className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                {actionLoading ? 'Recording…' : 'Check Out for Today'}
              </Button>
            </div>
          )}

          {todayDone && (
            <div className="flex items-center gap-6 flex-wrap p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Check In</p>
                <p className="font-semibold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatTime(attendance.checkIn)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Check Out</p>
                <p className="font-semibold text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatTime(attendance.checkOut)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total Duration</p>
                <p className="font-semibold text-sm tabular-nums">
                  {Math.round(((new Date(attendance.checkOut) - new Date(attendance.checkIn)) / 3600000) * 10) / 10} hrs
                </p>
              </div>
              <Badge variant="success" className="ml-auto">
                Completed for Today ✓
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History Table */}
      <Card>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Attendance History Records</h2>
          <span className="text-xs text-muted-foreground font-mono">{records.length} logged entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Check In</th>
                <th className="px-5 py-3 text-left font-medium">Check Out</th>
                <th className="px-5 py-3 text-left font-medium">Duration</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const durationMs = r.checkOut ? new Date(r.checkOut) - new Date(r.checkIn) : null
                const durationH = durationMs ? Math.round((durationMs / 3600000) * 10) / 10 : null
                return (
                  <AnimatedRow
                    key={r.id}
                    index={idx}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium font-mono">{r.date}</td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums font-mono">
                      {formatTime(r.checkIn)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums font-mono">
                      {formatTime(r.checkOut)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums font-mono">
                      {formatDuration(r.checkIn, r.checkOut, r.durationMinutes)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={r.checkOut ? 'muted' : 'success'}>
                        {r.checkOut ? 'Logged' : 'Active'}
                      </Badge>
                    </td>
                  </AnimatedRow>
                )
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    No attendance records found yet. Check in above to start logging.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  )
}

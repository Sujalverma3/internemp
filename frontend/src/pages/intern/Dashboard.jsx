import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { PageTransition, StaggerList, StaggerItem, AnimatedCard, AnimatedBar } from '@/components/motion'
import { useCountUp } from '@/hooks/useCountUp'
import {
  CheckCircle2, Clock, Hourglass, Calendar, LogIn, LogOut,
  ChevronRight, ArrowUpRight, Flame, BookOpen, UserCheck
} from 'lucide-react'

const statusVariant = { completed: 'success', 'in-progress': 'info', pending: 'muted' }
const priorityVariant = { high: 'destructive', medium: 'warning', low: 'muted' }
const nextStatusMap = { pending: 'in-progress', 'in-progress': 'completed' }

export default function InternDashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [tasks, setTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const [tRes, aRes, attTodayRes, attHistRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/announcements'),
        api.get('/attendance'),
        api.get('/attendance?history=true'),
      ])
      setTasks(tRes.data)
      setAnnouncements(aRes.data.reverse().slice(0, 3))
      setTodayAttendance(attTodayRes.data[0] || null)
      setAttendanceHistory(attHistRes.data)
    } catch (err) {
      console.error(err)
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
      setTodayAttendance(res.data)
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
      setTodayAttendance(res.data)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const advanceTaskStatus = async (task) => {
    const next = nextStatusMap[task.status]
    if (!next) return
    try {
      await api.put(`/tasks/${task.id}`, { status: next })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t))
    } catch (err) {
      console.error(err)
    }
  }

  const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null)

  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0

  const completedCount = useCountUp(completed, 600)
  const inProgressCount = useCountUp(inProgress, 600)
  const pendingCount = useCountUp(pending, 600)
  const daysAttended = attendanceHistory.length
  const daysCount = useCountUp(daysAttended, 600)

  // Chart data: hours logged per day for last 7 days
  const isDark = theme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const gridColor = isDark ? '#27272a' : '#f4f4f5'

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyHours = last7Days.map(dateStr => {
    const record = attendanceHistory.find(r => r.date === dateStr)
    if (!record || !record.checkIn || !record.checkOut) return 0
    const diff = (new Date(record.checkOut) - new Date(record.checkIn)) / 3600000
    return Math.max(0, Math.round(diff * 10) / 10)
  })

  const barChartOption = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'DM Sans, sans-serif', color: textColor },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#fff',
      borderColor: isDark ? '#3f3f46' : '#e4e4e7',
      textStyle: { color: isDark ? '#fafafa' : '#09090b' },
      formatter: (params) => `${params[0].name}: <strong>${params[0].value} hrs</strong>`
    },
    grid: { left: 24, right: 16, top: 20, bottom: 24, containLabel: false },
    xAxis: {
      type: 'category',
      data: last7Days.map(d => d.slice(5)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: dailyHours,
      barWidth: '40%',
      itemStyle: {
        color: '#3b82f6',
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable rows={4} />
      </div>
    )
  }

  return (
    <PageTransition className="space-y-6 max-w-5xl">
      {/* Header Profile / Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
            <span>{user?.department || 'Engineering'} Intern</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Flame className="w-3.5 h-3.5" /> {daysAttended}-day attendance streak
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/intern/tasks">
            <Button variant="outline" size="sm">
              My Tasks <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/intern/attendance">
            <Button size="sm">
              Attendance History <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StaggerItem>
          <AnimatedCard>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    {completionRate}% rate
                  </span>
                </div>
                <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums">
                  {completedCount}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Completed Tasks</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums">
                  {inProgressCount}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">In Progress</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Hourglass className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums">
                  {pendingCount}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Pending Assignments</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums">
                  {daysCount}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Days Logged</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>
      </StaggerList>

      {/* Today's Attendance Banner & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Check-in Action Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Today's Attendance Station
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            {todayAttendance ? (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Check In</p>
                    <p className="font-semibold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatTime(todayAttendance.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Check Out</p>
                    <p className="font-semibold text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                      {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : 'In Session'}
                    </p>
                  </div>
                </div>

                {todayAttendance.checkOut ? (
                  <Badge variant="success">Completed for Today ✓</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={checkout} disabled={actionLoading}>
                    <LogOut className="w-4 h-4 mr-1 text-rose-500" />
                    {actionLoading ? 'Recording…' : 'Check Out Now'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border">
                <div>
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">You haven't checked in yet today</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Log your start time to record attendance and track your hours.
                  </p>
                </div>
                <Button size="sm" onClick={checkin} disabled={actionLoading}>
                  <LogIn className="w-4 h-4 mr-1 text-emerald-300" />
                  {actionLoading ? 'Recording…' : 'Check In Today'}
                </Button>
              </div>
            )}

            {/* Task completion progress bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Cohort Project Progress</span>
                <span className="font-semibold tabular-nums">{completionRate}%</span>
              </div>
              <AnimatedBar value={completionRate} />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Hours Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Hours Worked (Past 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ReactECharts option={barChartOption} style={{ height: 160 }} theme={isDark ? 'dark' : undefined} />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Assigned Tasks & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assigned Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                My Assigned Tasks ({tasks.length})
              </CardTitle>
              <Link to="/intern/tasks" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-zinc-500">
                No tasks assigned yet. Check back soon!
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {task.title}
                        </p>
                        <Badge variant={priorityVariant[task.priority] || 'muted'}>
                          {task.priority}
                        </Badge>
                        <Badge variant={statusVariant[task.status] || 'muted'}>
                          {task.status}
                        </Badge>
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-zinc-400 font-mono">
                          Due {task.dueDate}
                        </p>
                      )}
                    </div>
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-primary shrink-0 hover:bg-primary/10"
                        onClick={() => advanceTaskStatus(task)}
                      >
                        → {nextStatusMap[task.status]}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cohort Announcements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Announcements & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {announcements.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">No announcements posted.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="p-3.5 rounded-lg border border-border/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.title}</p>
                      <span className="text-xs text-zinc-400 font-mono shrink-0">{a.date}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {a.content}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-2">Posted by {a.author}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

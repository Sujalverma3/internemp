import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import api from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { PageTransition, StaggerList, StaggerItem, AnimatedCard, AnimatedBar } from '@/components/motion'
import { useCountUp } from '@/hooks/useCountUp'
import { Users, CheckSquare, Clock, Trophy, Megaphone, UserCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

function StatCard({ label, value, icon: Icon, to, iconClass, trend, delay = 0 }) {
  const count = useCountUp(value, 700)
  const content = (
    <AnimatedCard>
      <Card className="cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            {trend !== undefined && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${trend >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums">{count}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{label}</p>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
  return to ? <Link to={to} className="block">{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [tasksByStatus, setTasksByStatus] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    Promise.all([
      api.get('/interns'), api.get('/tasks'), api.get('/announcements'), api.get('/attendance?history=true'),
    ]).then(([i, t, a, att]) => {
      const tasks = t.data
      const attendance = att.data
      setStats({
        interns: i.data.length, tasks: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        announcements: a.data.length,
        presentToday: new Set(attendance.filter(r => r.date === new Date().toISOString().split('T')[0]).map(r => r.userId)).size,
      })
      setTasksByStatus([
        { value: tasks.filter(t => t.status === 'pending').length, name: 'Pending' },
        { value: tasks.filter(t => t.status === 'in-progress').length, name: 'In Progress' },
        { value: tasks.filter(t => t.status === 'completed').length, name: 'Completed' },
      ])
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      setAttendanceTrend(days.map(date => ({
        date: date.slice(5),
        count: new Set(attendance.filter(r => r.date === date).map(r => r.userId)).size,
      })))
      setAnnouncements(a.data.slice(-3).reverse())
      setRecentTasks(tasks.slice(-5).reverse())
    }).finally(() => setLoading(false))
  }, [])

  const isDark = theme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const gridColor = isDark ? '#27272a' : '#f4f4f5'

  const donutOption = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'DM Sans, sans-serif', color: textColor },
    tooltip: { trigger: 'item', backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', textStyle: { color: isDark ? '#fafafa' : '#09090b' } },
    legend: { bottom: 0, textStyle: { color: textColor, fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['50%', '75%'], center: ['50%', '45%'],
      label: { show: false },
      data: tasksByStatus,
      color: ['#f59e0b', '#3b82f6', '#10b981'],
      itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: isDark ? '#09090b' : '#fff' },
    }],
  }

  const lineOption = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'DM Sans, sans-serif', color: textColor },
    tooltip: { trigger: 'axis', backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', textStyle: { color: isDark ? '#fafafa' : '#09090b' }, axisPointer: { lineStyle: { color: gridColor } } },
    grid: { left: 32, right: 16, top: 16, bottom: 24, containLabel: false },
    xAxis: { type: 'category', data: attendanceTrend.map(d => d.date), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: textColor, fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: gridColor } }, axisLabel: { color: textColor, fontSize: 11 }, minInterval: 1 },
    series: [{
      type: 'line', data: attendanceTrend.map(d => d.count),
      smooth: true, symbol: 'circle', symbolSize: 6,
      lineStyle: { color: '#3b82f6', width: 2 },
      itemStyle: { color: '#3b82f6' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } },
    }],
  }

  const statusVariant = { completed: 'success', 'in-progress': 'info', pending: 'muted' }

  if (loading) return (
    <div className="space-y-5 max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      <SkeletonTable rows={4} />
    </div>
  )

  const completionRate = stats.tasks > 0 ? Math.round(stats.completed / stats.tasks * 100) : 0

  return (
    <PageTransition className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your internship program at a glance.</p>
      </div>

      {/* KPI Cards — staggered entrance */}
      <StaggerList className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Interns', value: stats.interns, icon: Users, to: '/admin/interns', iconClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { label: 'Present Today', value: stats.presentToday, icon: UserCheck, to: '/admin/attendance', iconClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Tasks', value: stats.tasks, icon: CheckSquare, to: '/admin/tasks', iconClass: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
          { label: 'Pending', value: stats.pending, icon: Clock, to: '/admin/tasks', iconClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          { label: 'Completed', value: stats.completed, icon: Trophy, to: '/admin/tasks', iconClass: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', trend: completionRate },
          { label: 'Announcements', value: stats.announcements, icon: Megaphone, to: '/admin/announcements', iconClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
        ].map((s, i) => (
          <StaggerItem key={s.label}>
            <StatCard {...s} />
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Animated progress bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Task completion</span>
            <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{completionRate}%</span>
          </div>
          <AnimatedBar value={completionRate} />
          <div className="flex gap-4 text-xs text-zinc-400 mt-2">
            <span>{stats.completed} completed</span>
            <span>{stats.pending} pending</span>
            <span>{stats.inProgress} in progress</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <StaggerList className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StaggerItem className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-1">Attendance — last 7 days</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Unique interns checked in per day</p>
              <ReactECharts option={lineOption} style={{ height: 160 }} theme={isDark ? 'dark' : undefined} />
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-1">Tasks by status</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{completionRate}% completion rate</p>
              <ReactECharts option={donutOption} style={{ height: 180 }} theme={isDark ? 'dark' : undefined} />
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>

      {/* Tables */}
      <StaggerList className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StaggerItem>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-950 dark:text-zinc-50 text-sm font-semibold">Recent tasks</CardTitle>
                <Link to="/admin/tasks" className="text-xs text-primary hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentTasks.length === 0 ? <p className="text-sm text-zinc-500 py-4">No tasks yet.</p> : (
                <div className="space-y-1">
                  {recentTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.title}</p>
                        {t.dueDate && <p className="text-xs text-zinc-400 mt-0.5 font-mono">Due {t.dueDate}</p>}
                      </div>
                      <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-950 dark:text-zinc-50 text-sm font-semibold">Announcements</CardTitle>
                <Link to="/admin/announcements" className="text-xs text-primary hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {announcements.length === 0 ? <p className="text-sm text-zinc-500 py-4">No announcements yet.</p> : (
                <div className="space-y-1">
                  {announcements.map(a => (
                    <div key={a.id} className="py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <div className="flex justify-between gap-2 mb-0.5">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.title}</p>
                        <span className="text-xs text-zinc-400 font-mono shrink-0">{a.date}</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>
    </PageTransition>
  )
}

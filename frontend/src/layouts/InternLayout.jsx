import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, CheckSquare, CalendarDays, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'

const navItems = [
  { to: '/intern', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/intern/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/intern/attendance', label: 'Attendance', icon: CalendarDays },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 h-14 border-b border-sidebar-border">
        <Logo size="sm" showText={true} textClassName="text-sidebar-foreground font-semibold text-sm tracking-tight" />
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-widest">Intern</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">{user?.name?.[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/40">Intern</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </button>
      </div>
    </div>
  )
}

export default function InternLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 z-50">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 flex items-center justify-between px-6 border-b bg-background shrink-0">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Hi, {user?.name}</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <button onClick={toggle} className="ml-auto p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

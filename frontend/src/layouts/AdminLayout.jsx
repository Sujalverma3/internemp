import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/interns', label: 'Interns', icon: '👥' },
  { to: '/admin/tasks', label: 'Tasks', icon: '✅' },
  { to: '/admin/attendance', label: 'Attendance', icon: '📅' },
  { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-blue-700 font-bold text-sm">IE</span>
          </div>
          <div>
            <h1 className="text-white font-bold">InterneMP</h1>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${ isActive ? 'bg-white text-blue-700' : 'text-blue-100 hover:bg-blue-700' }`}>
            <span>{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user?.name?.[0]}</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-blue-300 text-xs">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-blue-200 hover:text-white hover:bg-blue-700 text-sm py-2 px-4 rounded-lg transition text-left">🚪 Logout</button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-800 flex-shrink-0">
        <Sidebar />
      </aside>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-blue-800 z-50"><Sidebar /></aside>
        </div>
      )}
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>☰</button>
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

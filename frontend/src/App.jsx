import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import InternLayout from './layouts/InternLayout'
import AdminDashboard from './pages/admin/Dashboard'
import Interns from './pages/admin/Interns'
import AdminTasks from './pages/admin/Tasks'
import AdminAttendance from './pages/admin/Attendance'
import Announcements from './pages/admin/Announcements'
import InternDashboard from './pages/intern/Dashboard'
import MyTasks from './pages/intern/MyTasks'
import MyAttendance from './pages/intern/MyAttendance'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/intern" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="interns" element={<Interns />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>
          <Route path="/intern" element={<ProtectedRoute role="intern"><InternLayout /></ProtectedRoute>}>
            <Route index element={<InternDashboard />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="attendance" element={<MyAttendance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

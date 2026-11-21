import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy-load all views for instant initial page loading & smaller bundles
const Login = lazy(() => import('./pages/Login'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const InternLayout = lazy(() => import('./layouts/InternLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Interns = lazy(() => import('./pages/admin/Interns'))
const AdminTasks = lazy(() => import('./pages/admin/Tasks'))
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'))
const Announcements = lazy(() => import('./pages/admin/Announcements'))
const InternDashboard = lazy(() => import('./pages/intern/Dashboard'))
const MyTasks = lazy(() => import('./pages/intern/MyTasks'))
const MyAttendance = lazy(() => import('./pages/intern/MyAttendance'))

function PageFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading…</span>
      </div>
    </div>
  )
}

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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

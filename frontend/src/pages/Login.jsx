import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/intern')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0f172a] p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xs">IE</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">InterneMP</span>
        </div>
        <div>
          <blockquote className="text-white/70 text-lg font-light leading-relaxed max-w-sm">
            "Manage your internship program without the spreadsheet chaos."
          </blockquote>
          <p className="text-white/40 text-sm mt-4">Intern Management Portal</p>
        </div>
        <p className="text-white/20 text-xs">© 2024 InterneMP</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xs">IE</span>
            </div>
            <span className="font-semibold tracking-tight">InterneMP</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-md bg-muted border border-border text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Demo credentials</p>
            <p>Admin: admin@internemp.com / admin123</p>
            <p>Intern: intern@internemp.com / intern123</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

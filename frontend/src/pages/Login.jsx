import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye, EyeOff, ShieldCheck, UserCheck, CalendarDays,
  CheckCircle2, Sun, Moon, ArrowRight, Sparkles, Building2
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleFillDemo = (role, demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setSelectedRole(role)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/intern')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      {/* Left Panel — Editorial Product Showcase (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 text-zinc-100 p-12 relative overflow-hidden border-r border-zinc-800/80">
        {/* Subtle Ambient Radial Gradients (Grounded & Non-Cheesy) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm tracking-wider">IE</span>
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-zinc-100">InterneMP</span>
            <span className="text-xs text-zinc-500 block -mt-0.5 font-mono">v1.0 • Portal</span>
          </div>
        </div>

        {/* Center Live Product Preview Mockup */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fall Cohort 2026 Session Live</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 mb-4 leading-tight">
              A clean workspace for teams managing internships.
            </h2>

            <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
              Track attendance timestamps, assign cohort deliverables, and review individual progression without sprawling spreadsheets.
            </p>

            {/* Micro Dashboard Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" /> Engineering & Design Cohort
                </span>
                <span className="text-emerald-400 font-mono font-medium">94% On Track</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <p className="text-[11px] text-zinc-500">Active Interns</p>
                  <p className="text-lg font-bold font-mono text-zinc-100 mt-0.5">4</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <p className="text-[11px] text-zinc-500">Completed</p>
                  <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">10</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <p className="text-[11px] text-zinc-500">In Progress</p>
                  <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">3</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-zinc-300 truncate max-w-[220px]">Build Login Page & Auth Flow</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Role-Based JWT
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-400" /> Daily Check-In
            </span>
          </div>
          <span className="font-mono text-zinc-600">v1.0.0</span>
        </div>
      </div>

      {/* Right Panel — Interactive Form Area */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 relative">
        {/* Top Utility Nav (Theme Switcher & Mobile Brand) */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-sm">
              IE
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">InterneMP</span>
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Login Form */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your work credentials to access your portal.
              </p>
            </div>

            {/* Quick Demo Fill Buttons (High UX Polish) */}
            <div className="mb-6 p-1.5 rounded-xl bg-muted/60 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-1.5">
                Quick-Fill Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'admin@internemp.com', 'admin123')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('intern', 'intern@internemp.com', 'intern123')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    selectedRole === 'intern'
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Intern</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setSelectedRole(null)
                  }}
                  placeholder="name@company.com"
                  required
                  className="h-10 bg-background/50 border-input focus-visible:ring-primary/40 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setSelectedRole(null)
                    }}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10 bg-background/50 border-input focus-visible:ring-primary/40 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 mt-2 font-medium tracking-tight shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign in to Portal <ArrowRight className="w-4 h-4 ml-0.5" />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-muted-foreground/60 py-2">
          Protected session • InterneMP Portal
        </div>
      </div>
    </div>
  )
}

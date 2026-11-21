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
  Eye, EyeOff, Sun, Moon, ArrowRight
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
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
      setError(err.response?.data?.error || 'Invalid email or password. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      {/* Left Panel — Full-Bleed Architectural Visual Experience (Desktop) */}
      <div className="hidden lg:relative lg:flex flex-col justify-between w-1/2 min-h-screen p-12 overflow-hidden border-r border-border/60">
        {/* College Students Collaboration Hero Image */}
        <img
          src="/login-hero.jpg"
          alt="College interns collaborating on a tech project"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-transform duration-700 hover:scale-[1.02]"
        />

        {/* Sophisticated Dark Gradient Scrim to ensure crisp branding and high contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
        <div className="absolute inset-0 bg-zinc-950/20 mix-blend-multiply" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm tracking-wider">IE</span>
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white drop-shadow-sm">InterneMP</span>
              <span className="text-xs text-white/70 block -mt-0.5 font-mono">Workspace</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-md text-xs text-white/90 font-medium">
            Cohort 2026
          </div>
        </div>

        {/* Bottom Minimalist Editorial Tagline (Image-driven, letting the visual breathe) */}
        <div className="relative z-10 space-y-2 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Empowering the next generation of builders.
          </h2>
          <p className="text-xs font-mono text-white/70 tracking-wider uppercase">
            InterneMP • Talent Management Portal
          </p>
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
                  onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
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

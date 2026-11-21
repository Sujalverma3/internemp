import React from 'react'
import { cn } from '@/lib/utils'

// Skeleton loader per skill: animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded
export function Skeleton({ className, ...props }) {
  return (
    <div className={cn('animate-pulse rounded bg-zinc-200 dark:bg-zinc-800', className)} {...props} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

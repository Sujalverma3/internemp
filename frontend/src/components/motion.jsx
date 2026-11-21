import { motion, AnimatePresence } from 'framer-motion'

// ─── Variants ──────────────────────────────────────────────────────────────────

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 },
}

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.95 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
}

// ─── Components ────────────────────────────────────────────────────────────────

/** Wraps a page — fade-up on mount, fade-out on unmount */
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Staggered grid/list container */
export function StaggerList({ children, className = '' }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** An item inside <StaggerList> */
export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

/** Card that lifts on hover */
export function AnimatedCard({ children, className = '', onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

/** Animated table row */
export function AnimatedRow({ children, className = '', index = 0 }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.tr>
  )
}

/** Progress bar that animates width on mount */
export function AnimatedBar({ value, className = '', barClass = '' }) {
  return (
    <div className={`w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-primary ${barClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      />
    </div>
  )
}

/** Slide-in panel (sidebar mobile / detail pane) */
export function SlidePanel({ children, isOpen, direction = 'left', className = '' }) {
  const variants = {
    left:  { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    right: { initial: { x: '100%' },  animate: { x: 0 }, exit: { x: '100%' } },
  }
  const v = variants[direction]
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Overlay backdrop */
export function Backdrop({ isOpen, onClick }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClick}
        />
      )}
    </AnimatePresence>
  )
}

export { motion, AnimatePresence }

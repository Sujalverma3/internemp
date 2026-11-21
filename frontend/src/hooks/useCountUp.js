import { useEffect, useRef, useState } from 'react'

/**
 * Counts up from 0 to `end` over `duration` ms.
 * Re-triggers whenever `end` changes.
 */
export function useCountUp(end, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (end === 0) { setValue(0); return }
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * end))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [end, duration])

  return value
}

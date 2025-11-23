import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook
 * 
 * Detects if the current viewport is mobile-sized (< 768px).
 * Uses matchMedia for efficient monitoring and debouncing for stability.
 * 
 * Features:
 * - Server-side rendering compatible
 * - Debounced resize handling (150ms)
 * - Proper cleanup of event listeners
 * - Error resilient with defensive checks
 * 
 * @returns {boolean} True if viewport width is less than MOBILE_BREAKPOINT
 */
export function useIsMobile() {
  // Initialize with actual value instead of undefined to prevent layout shifts
  // Defensive: Check if window is available (SSR compatibility)
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    // Defensive: Exit early if window is not available
    if (typeof window === 'undefined') {
      // Return no-op cleanup function
      return () => {}
    }

    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      let timeoutId: NodeJS.Timeout | undefined

      const onChange = () => {
        try {
          // Debounce to prevent rapid state changes during resize
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
          }, 150) // 150ms debounce - balances responsiveness and stability
        } catch (error) {
          console.error('useIsMobile: Error in resize handler', error)
        }
      }

      mql.addEventListener("change", onChange)
      // Set initial value after mounting
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

      return () => {
        try {
          clearTimeout(timeoutId)
          mql.removeEventListener("change", onChange)
        } catch (error) {
          console.error('useIsMobile: Error cleaning up listeners', error)
        }
      }
    } catch (error) {
      console.error('useIsMobile: Error setting up media query listener', error)
      // Return cleanup function even on error
      return () => {}
    }
  }, [])

  return isMobile
}

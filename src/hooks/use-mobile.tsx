import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with actual value instead of undefined to prevent layout shifts
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    let timeoutId: NodeJS.Timeout | undefined

    const onChange = () => {
      // Debounce to prevent rapid state changes during resize
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }, 150) // 150ms debounce - balances responsiveness and stability
    }

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => {
      clearTimeout(timeoutId)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}

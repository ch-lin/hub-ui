import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (event: MediaQueryListEvent) => {
      const isNowMobile = event.matches;
      setIsMobile(isNowMobile);
      console.info(`[Viewport Tracking] Viewport changed. Is mobile: ${isNowMobile}`);
    }
    mql.addEventListener("change", onChange)
    // Set the initial state
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

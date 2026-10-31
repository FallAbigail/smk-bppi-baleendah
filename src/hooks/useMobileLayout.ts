import { useEffect, useState } from 'react'

// Match the site's desktop navigation breakpoint so mobile refinements stay scoped.
export function useMobileLayout() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)')
    const update = () => setMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return mobile
}

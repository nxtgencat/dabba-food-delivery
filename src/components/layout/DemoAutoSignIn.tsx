import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useApp'
import { demoCredentials } from '../../context/AuthContext'
import { PageSkeleton } from '../ui/PageSkeleton'

/**
 * `?demo=1` opens the service board with the demo manager account. It is the
 * same sign-in the "Use it" button performs, kept for share links, screenshots
 * and anyone reviewing the build without an account.
 */
export function DemoAutoSignIn({ children }: { children: React.ReactNode }) {
  const { user, signIn } = useAuth()
  const [params] = useSearchParams()
  const wantsDemo = params.get('demo') === '1'
  const [working, setWorking] = useState(!user && wantsDemo)

  useEffect(() => {
    if (user || !wantsDemo) {
      setWorking(false)
      return
    }
    let cancelled = false
    signIn(demoCredentials.email, demoCredentials.password).finally(() => {
      if (!cancelled) setWorking(false)
    })
    return () => {
      cancelled = true
    }
  }, [user, wantsDemo, signIn])

  if (working && !user) return <PageSkeleton bare />
  return <>{children}</>
}

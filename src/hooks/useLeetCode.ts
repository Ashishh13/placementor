import { useState, useEffect } from 'react'

export function useLeetCode(username: string | null) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setError(null)
    fetch(`/api/integrations/leetcode?username=${username}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to fetch'))
      .finally(() => setLoading(false))
  }, [username])

  return { data, loading, error }
}
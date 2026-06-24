import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'
export function useLocalDate() {
  const [date, setDate] = useState(getLocalDate())
  useEffect(() => {
    const interval = setInterval(() => { setDate(getLocalDate()) }, 60000)
    return () => clearInterval(interval)
  }, [])
  return date
}

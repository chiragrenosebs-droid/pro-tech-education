'use client'

import { createClient } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return { user, isAdmin }
}
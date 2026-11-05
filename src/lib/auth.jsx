import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // undefined = cargando · null = el usuario aún no tiene óptica · objeto = { optica_id, nombre, rol }
  const [membresia, setMembresia] = useState(undefined)
  const [listo, setListo] = useState(false)
  const ultimoUsuario = useRef(null)

  const cargarMembresia = useCallback(async (userId) => {
    if (!userId) {
      setMembresia(null)
      return
    }
    setMembresia(undefined)
    const { data, error } = await supabase
      .from('miembros')
      .select('optica_id, nombre, rol')
      .eq('user_id', userId)
      .order('creado', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) console.error('No se pudo cargar la membresía', error)
    setMembresia(data ?? null)
  }, [])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSession(nueva)
      setListo(true)
      const id = nueva?.user?.id ?? null
      if (id !== ultimoUsuario.current) {
        ultimoUsuario.current = id
        // Se difiere para no hacer consultas dentro del callback de Supabase
        setTimeout(() => cargarMembresia(id), 0)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [cargarMembresia])

  const valor = {
    session,
    user: session?.user ?? null,
    membresia,
    cargando: !listo || (session && membresia === undefined),
    recargarMembresia: () => cargarMembresia(session?.user?.id),
    salir: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

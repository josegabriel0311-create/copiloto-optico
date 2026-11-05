import { useState } from 'react'
import { ArrowRight, LogOut } from 'lucide-react'
import { Button, Card, Input } from '../components/ui/index.jsx'
import { Pantalla } from './Login.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function CrearOptica() {
  const { user, recargarMembresia, salir } = useAuth()
  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const crear = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error: err } = await supabase.rpc('crear_optica', { p_nombre: nombre.trim(), p_usuario: usuario.trim() })
    if (err) {
      setError(
        /function .*crear_optica/i.test(err.message)
          ? 'La base de datos aún no está configurada. Falta ejecutar el archivo schema.sql en Supabase.'
          : err.message,
      )
      setEnviando(false)
      return
    }
    await recargarMembresia()
  }

  return (
    <Pantalla>
      <Card>
        <h2 className="text-lg font-bold">Configura tu óptica</h2>
        <p className="mt-1 text-sm text-muted">Un último paso. Puedes cambiar estos datos después en Ajustes.</p>
        <form onSubmit={crear} className="mt-6 space-y-4">
          <Input label="Nombre de la óptica" placeholder="Ej.: Óptica Visión Clara" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Input label="Tu nombre" placeholder="Ej.: José Gabriel" value={usuario} onChange={(e) => setUsuario(e.target.value)} hint="Aparece en el historial de cambios" required />
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" iconRight={ArrowRight} disabled={enviando || !nombre.trim() || !usuario.trim()}>
            {enviando ? 'Creando…' : 'Empezar'}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-xs text-muted">
        Sesión iniciada como {user?.email} ·{' '}
        <button onClick={salir} className="inline-flex items-center gap-1 font-semibold hover:text-ink">
          <LogOut className="h-3 w-3" /> Salir
        </button>
      </p>
    </Pantalla>
  )
}

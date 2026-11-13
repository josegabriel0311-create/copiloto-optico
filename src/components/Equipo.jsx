import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Trash2, Mail, Clock } from 'lucide-react'
import { Badge, Button, Card, Input, Select } from './ui/index.jsx'
import BotonWhatsApp from './BotonWhatsApp.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { useStore } from '../lib/store.jsx'
import { DESCRIPCION_ROL, ROLES } from '../lib/permisos.js'

const URL_APP = typeof window !== 'undefined' ? window.location.origin : 'https://copiloto-optico.vercel.app'

const mensajeInvitacion = (nombre, optica, email) =>
  `Hola${nombre ? ` ${nombre.split(' ')[0]}` : ''}, te invité a ${optica || 'nuestra óptica'} en Copiloto Óptico. Entra a ${URL_APP}, haz clic en "Créala gratis" y regístrate con este correo: ${email}. Al confirmar tu correo entrarás directo a la óptica.`

export default function Equipo() {
  const { membresia, user } = useAuth()
  const { optica } = useStore()
  const opticaId = membresia?.optica_id
  const [miembros, setMiembros] = useState([])
  const [invitaciones, setInvitaciones] = useState([])
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'recepcion' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [recien, setRecien] = useState(null)

  const cargar = useCallback(async () => {
    if (!opticaId) return
    const [m, i] = await Promise.all([
      supabase.from('miembros').select('user_id, nombre, rol, email, creado').eq('optica_id', opticaId).order('creado'),
      supabase.from('invitaciones').select('*').eq('optica_id', opticaId).order('creada'),
    ])
    if (m.error || i.error) {
      const e = m.error || i.error
      setError(
        ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(e.code)
          ? 'Falta ejecutar el archivo 03_cobros_whatsapp_equipo.sql en Supabase para gestionar el equipo.'
          : `No se pudo cargar el equipo. ${e.message ?? ''}`,
      )
      return
    }
    setMiembros(m.data)
    setInvitaciones(i.data)
  }, [opticaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const invitar = async (e) => {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email) return
    if (miembros.some((m) => m.email?.toLowerCase() === email)) {
      setError('Esa persona ya es parte del equipo.')
      return
    }
    setEnviando(true)
    setError('')
    const { data, error: err } = await supabase
      .from('invitaciones')
      .upsert({ optica_id: opticaId, email, nombre: form.nombre.trim(), rol: form.rol }, { onConflict: 'optica_id,email' })
      .select()
      .single()
    setEnviando(false)
    if (err) {
      setError(`No se pudo crear la invitación. ${err.message ?? ''}`)
      return
    }
    setInvitaciones((xs) => [...xs.filter((x) => x.id !== data.id), data])
    setRecien(data)
    setForm({ nombre: '', email: '', rol: form.rol })
  }

  const cancelarInvitacion = async (id) => {
    const { error: err } = await supabase.from('invitaciones').delete().eq('id', id)
    if (err) return setError(`No se pudo cancelar la invitación. ${err.message ?? ''}`)
    setInvitaciones((xs) => xs.filter((x) => x.id !== id))
    if (recien?.id === id) setRecien(null)
  }

  const cambiarRol = async (userId, rol) => {
    const { error: err } = await supabase.from('miembros').update({ rol }).eq('optica_id', opticaId).eq('user_id', userId)
    if (err) return setError(`No se pudo cambiar el rol. ${err.message ?? ''}`)
    setMiembros((xs) => xs.map((x) => (x.user_id === userId ? { ...x, rol } : x)))
  }

  const quitar = async (m) => {
    if (!confirm(`¿Quitar a ${m.nombre || m.email} del equipo? Ya no podrá entrar a la óptica.`)) return
    const { error: err } = await supabase.from('miembros').delete().eq('optica_id', opticaId).eq('user_id', m.user_id)
    if (err) return setError(`No se pudo quitar a la persona. ${err.message ?? ''}`)
    setMiembros((xs) => xs.filter((x) => x.user_id !== m.user_id))
  }

  return (
    <Card>
      <h2 className="font-bold">Equipo</h2>
      <p className="mt-1 text-sm text-muted">Invita a tus empleados. Cada uno ve solo las secciones de su rol.</p>

      {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
        {miembros.map((m) => {
          const yo = m.user_id === user?.id
          return (
            <li key={m.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-500 dark:text-brand-300">
                {(m.nombre || m.email || '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.nombre || m.email} {yo && <span className="font-normal text-muted">(tú)</span>}
                </p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              {yo ? (
                <Badge tone="violet">{ROLES[m.rol] ?? m.rol}</Badge>
              ) : (
                <>
                  <select
                    value={m.rol}
                    onChange={(e) => cambiarRol(m.user_id, e.target.value)}
                    className="h-9 rounded-xl border border-line bg-surface2/40 px-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                    aria-label="Rol"
                  >
                    {Object.entries(ROLES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => quitar(m)} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-red-500" aria-label="Quitar del equipo">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          )
        })}
        {invitaciones.map((inv) => (
          <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-muted">
              <Clock className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{inv.nombre || inv.email}</p>
              <p className="truncate text-xs text-muted">
                {inv.email} · invitación pendiente
              </p>
            </div>
            <Badge>{ROLES[inv.rol] ?? inv.rol}</Badge>
            <BotonWhatsApp telefono="" mensaje={mensajeInvitacion(inv.nombre, optica?.nombre, inv.email)} size="icon" title="Enviar la invitación por WhatsApp" />
            <button onClick={() => cancelarInvitacion(inv.id)} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-red-500" aria-label="Cancelar invitación">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {recien && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-semibold">Invitación lista para {recien.email}</p>
          <p className="mt-1 text-muted">
            Pídele que entre a la app y cree su cuenta con ese mismo correo. Al confirmarlo, entrará directo a tu óptica como {ROLES[recien.rol]}.
          </p>
          <BotonWhatsApp className="mt-3" telefono="" mensaje={mensajeInvitacion(recien.nombre, optica?.nombre, recien.email)}>
            Enviarle las instrucciones por WhatsApp
          </BotonWhatsApp>
        </div>
      )}

      <form onSubmit={invitar} className="mt-6 border-t border-line pt-5">
        <h3 className="mb-3 text-sm font-bold">Invitar a alguien</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Nombre" placeholder="Ej.: Laura Gómez" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          <Input label="Correo" type="email" placeholder="laura@correo.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <Select label="Rol" value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))} hint={DESCRIPCION_ROL[form.rol]}>
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" icon={enviando ? Mail : UserPlus} disabled={enviando || !form.email.trim()}>
            {enviando ? 'Creando…' : 'Crear invitación'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

import { useState } from 'react'
import { Moon, Save, Sun, MessageCircle, RotateCcw } from 'lucide-react'
import { Button, Card, Input, Textarea } from '../components/ui/index.jsx'
import Equipo from '../components/Equipo.jsx'
import { useStore } from '../lib/store.jsx'
import { useTheme } from '../lib/theme.js'
import { esAdmin } from '../lib/permisos.js'
import { PLANTILLA_LISTA, VARIABLES, mensajeLista } from '../lib/whatsapp.js'

function DatosOptica() {
  const { optica, guardarOptica } = useStore()
  const [form, setForm] = useState({ nombre: optica?.nombre ?? '', nit: optica?.nit ?? '', telefono: optica?.telefono ?? '', ciudad: optica?.ciudad ?? '' })
  const [guardado, setGuardado] = useState(false)
  const set = (k) => (e) => {
    setGuardado(false)
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (await guardarOptica(form)) setGuardado(true)
  }

  return (
    <Card>
      <h2 className="mb-4 font-bold">Datos de la óptica</h2>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre" value={form.nombre} onChange={set('nombre')} />
        <Input label="NIT" placeholder="900.123.456-7" value={form.nit} onChange={set('nit')} />
        <Input label="Teléfono" placeholder="300 123 4567" value={form.telefono} onChange={set('telefono')} />
        <Input label="Ciudad" placeholder="Medellín" value={form.ciudad} onChange={set('ciudad')} />
        <div className="flex items-center justify-end gap-3 sm:col-span-2">
          {guardado && <span className="text-sm text-emerald-500">Cambios guardados</span>}
          <Button type="submit" icon={Save}>
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function MensajeWhatsApp() {
  const { optica, guardarOptica } = useStore()
  const [texto, setTexto] = useState(optica?.mensaje_lista?.trim() || PLANTILLA_LISTA)
  const [guardado, setGuardado] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    const valor = texto.trim() === PLANTILLA_LISTA ? '' : texto.trim()
    if (await guardarOptica({ mensaje_lista: valor })) setGuardado(true)
  }

  return (
    <Card>
      <h2 className="flex items-center gap-2 font-bold">
        <MessageCircle className="h-5 w-5 text-emerald-500" /> Mensaje de “gafas listas”
      </h2>
      <p className="mt-1 text-sm text-muted">Es el texto que se abre en WhatsApp al avisar a un paciente.</p>
      <form onSubmit={guardar} className="mt-4 space-y-3">
        <Textarea
          value={texto}
          onChange={(e) => {
            setGuardado(false)
            setTexto(e.target.value)
          }}
        />
        <ul className="space-y-0.5 text-xs text-muted">
          {VARIABLES.map(([v, d]) => (
            <li key={v}>
              <code className="rounded bg-surface2 px-1 font-semibold text-ink">{v}</code> {d}
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-line bg-surface2/40 p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Vista previa (con saldo de $50.000)</p>
          <p>{mensajeLista({ paciente: 'María Fernanda Rojas', optica, saldo: 50000, plantilla: texto })}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {guardado && <span className="text-sm text-emerald-500">Mensaje guardado</span>}
          <Button
            type="button"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              setGuardado(false)
              setTexto(PLANTILLA_LISTA)
            }}
          >
            Usar el mensaje original
          </Button>
          <Button type="submit" icon={Save}>
            Guardar mensaje
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default function Ajustes() {
  const { usuario } = useStore()
  const { dark, toggle } = useTheme()
  const admin = esAdmin(usuario.rol)

  return (
    <div className="max-w-3xl space-y-6">
      {admin && <DatosOptica />}
      {admin && <MensajeWhatsApp />}
      {admin && <Equipo />}

      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Apariencia</h2>
          <p className="text-sm text-muted">Tema {dark ? 'oscuro' : 'claro'}</p>
        </div>
        <Button variant="outline" icon={dark ? Sun : Moon} onClick={toggle}>
          Cambiar a {dark ? 'claro' : 'oscuro'}
        </Button>
      </Card>

      {!admin && (
        <p className="text-sm text-muted">
          Tu rol es {usuario.rolNombre}. Los datos de la óptica y el equipo los maneja el administrador.
        </p>
      )}
    </div>
  )
}

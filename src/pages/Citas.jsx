import { useState } from 'react'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Input, Select, EmptyState } from '../components/ui/index.jsx'
import { useStore } from '../lib/store.jsx'
import { hoyISO } from '../lib/utils.js'

const MOTIVOS = ['Examen visual', 'Entrega de gafas', 'Ajuste de montura', 'Control', 'Lentes de contacto']

const fechaLarga = (f) =>
  new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function Citas() {
  const { citas, crearCita, eliminarCita } = useStore()
  const [form, setForm] = useState({ paciente: '', telefono: '', fecha: hoyISO(), hora: '09:00', motivo: MOTIVOS[0] })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = (e) => {
    e.preventDefault()
    if (!form.paciente.trim()) return
    crearCita({ ...form, paciente: form.paciente.trim() })
    setForm((f) => ({ ...f, paciente: '', telefono: '' }))
  }

  const proximas = citas
    .filter((c) => c.fecha >= hoyISO())
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))

  const porDia = proximas.reduce((acc, c) => {
    ;(acc[c.fecha] ||= []).push(c)
    return acc
  }, {})

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <h2 className="mb-4 font-bold">Agendar cita</h2>
        <form onSubmit={guardar} className="space-y-4">
          <Input label="Paciente" placeholder="Nombre completo" value={form.paciente} onChange={set('paciente')} required />
          <Input label="Teléfono" placeholder="300 123 4567" value={form.telefono} onChange={set('telefono')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" min={hoyISO()} value={form.fecha} onChange={set('fecha')} />
            <Input label="Hora" type="time" value={form.hora} onChange={set('hora')} />
          </div>
          <Select label="Motivo" value={form.motivo} onChange={set('motivo')}>
            {MOTIVOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
          <Button type="submit" icon={Plus} className="w-full">
            Agendar
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 font-bold">Próximas citas</h2>
        {proximas.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No hay citas agendadas" description="Las citas que agendes aparecerán aquí, ordenadas por día." />
        ) : (
          <div className="space-y-5">
            {Object.entries(porDia).map(([fecha, lista]) => (
              <div key={fecha}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{fechaLarga(fecha)}</p>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {lista.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-12 shrink-0 text-sm font-bold text-brand-500">{c.hora}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{c.paciente}</p>
                        <p className="text-xs text-muted">
                          {c.motivo}
                          {c.telefono ? ` · ${c.telefono}` : ''}
                        </p>
                      </div>
                      <button onClick={() => eliminarCita(c.id)} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-red-500" aria-label="Eliminar cita">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

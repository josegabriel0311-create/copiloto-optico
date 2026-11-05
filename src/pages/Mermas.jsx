import { useState } from 'react'
import { FileSpreadsheet, Plus } from 'lucide-react'
import { Button, Card, Field, Input, Select, Badge } from '../components/ui/index.jsx'
import { useStore } from '../lib/store.jsx'
import { claveMes, exportarExcel, hoyISO, mesActual, nombreMes } from '../lib/utils.js'

const TIPOS = ['Lente', 'Montura', 'Lente de contacto', 'Accesorio', 'Otro']

export default function Mermas() {
  const { mermas, registrarMerma } = useStore()
  const [mes, setMes] = useState(mesActual())
  const [form, setForm] = useState({ fecha: hoyISO(), tipo: TIPOS[0], referencia: '', motivo: '', cantidad: '1' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const delMes = mermas.filter((m) => claveMes(`${m.fecha}T12:00:00`) === mes)

  const guardar = (e) => {
    e.preventDefault()
    registrarMerma({ ...form, cantidad: Math.max(1, Number(form.cantidad) || 1) })
    setForm((f) => ({ ...f, referencia: '', motivo: '', cantidad: '1' }))
  }

  const exportar = () =>
    exportarExcel(`mermas-${mes}`, [
      { label: 'Fecha', value: 'fecha' },
      { label: 'Tipo', value: 'tipo' },
      { label: 'Referencia', value: 'referencia' },
      { label: 'Motivo', value: 'motivo' },
      { label: 'Cantidad', value: 'cantidad' },
      { label: 'Registrado por', value: 'usuario' },
    ], delMes)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-end gap-2">
        <Field label="Mes">
          <input
            type="month"
            value={mes}
            onChange={(e) => e.target.value && setMes(e.target.value)}
            className="h-12 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-ink focus:border-brand-500 focus:outline-none"
          />
        </Field>
        <Button variant="outline" size="lg" icon={FileSpreadsheet} onClick={exportar}>
          Exportar Excel
        </Button>
      </div>

      <Card>
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <Input label="Fecha" type="date" value={form.fecha} onChange={set('fecha')} required />
          <Select label="Tipo" value={form.tipo} onChange={set('tipo')}>
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Input label="Referencia" placeholder="Paciente o código" value={form.referencia} onChange={set('referencia')} />
          <Input label="Motivo" placeholder="Ej.: rotura en taller" value={form.motivo} onChange={set('motivo')} />
          <Input label="Cantidad" type="number" min="1" value={form.cantidad} onChange={set('cantidad')} />
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" icon={Plus}>
              Registrar merma
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold capitalize">{nombreMes(mes)}</h2>
          <Badge tone={delMes.length ? 'red' : 'neutral'}>
            {delMes.reduce((s, m) => s + Number(m.cantidad || 0), 0)} un.
          </Badge>
        </div>
        {delMes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No hay mermas registradas en este mes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-semibold">Fecha</th>
                  <th className="py-2 pr-4 font-semibold">Tipo</th>
                  <th className="py-2 pr-4 font-semibold">Referencia</th>
                  <th className="py-2 pr-4 font-semibold">Motivo</th>
                  <th className="py-2 text-right font-semibold">Cant.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {delMes.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{m.fecha}</td>
                    <td className="py-2.5 pr-4">{m.tipo}</td>
                    <td className="py-2.5 pr-4">{m.referencia || '—'}</td>
                    <td className="py-2.5 pr-4 text-muted">{m.motivo || '—'}</td>
                    <td className="py-2.5 text-right font-bold">{m.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

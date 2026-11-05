import { Bell } from 'lucide-react'
import { Card, EmptyState } from '../components/ui/index.jsx'
import EstadoBadge from '../components/EstadoBadge.jsx'
import { useStore } from '../lib/store.jsx'
import { haceCuanto } from '../lib/utils.js'

export default function Avisos() {
  const { formulas } = useStore()

  // Cada cambio de estado (salvo la recepción) es un aviso
  const avisos = formulas
    .flatMap((f) =>
      f.historial
        .filter((h) => h.estado !== 'recibida')
        .map((h, i) => ({ key: `${f.id}-${i}-${h.estado}`, paciente: f.paciente, ...h })),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 50)

  return (
    <Card>
      {avisos.length === 0 ? (
        <EmptyState icon={Bell} title="Sin avisos" description="Aquí verás cada vez que una fórmula cambie de estado." />
      ) : (
        <ul className="divide-y divide-line">
          {avisos.map((a) => (
            <li key={a.key} className="flex items-center gap-4 py-3.5">
              <div className="w-36 shrink-0">
                <EstadoBadge estado={a.estado} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.paciente}</p>
                <p className="text-xs text-muted">
                  Registrado por {a.usuario} · {haceCuanto(a.fecha)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

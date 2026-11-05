import { Link } from 'react-router-dom'
import { Plus, ClipboardList, Hourglass, PackageCheck } from 'lucide-react'
import { Button, Card, StatCard, EmptyState } from '../components/ui/index.jsx'
import EstadoBadge from '../components/EstadoBadge.jsx'
import { useStore } from '../lib/store.jsx'
import { esHoy, haceCuanto } from '../lib/utils.js'

export default function Inicio() {
  const { formulas } = useStore()
  const deHoy = formulas.filter((f) => esHoy(f.creada)).length
  const enTaller = formulas.filter((f) => f.estado === 'taller').length
  const listas = formulas.filter((f) => f.estado === 'lista')

  // Fecha en que quedó lista (último cambio de estado)
  const desde = (f) => f.historial[f.historial.length - 1]?.fecha ?? f.creada

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Resumen de hoy</h1>
        <Link to="/nueva-formula">
          <Button size="lg" icon={Plus}>
            Nueva fórmula
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Fórmulas de hoy" value={deHoy} icon={ClipboardList} tone="violet" />
        <StatCard label="En taller" value={enTaller} icon={Hourglass} tone="amber" />
        <StatCard label="Listas para entrega" value={listas.length} icon={PackageCheck} tone="green" />
      </div>

      <Card className="mt-6">
        <h2 className="mb-2 font-bold">Listas para entregar</h2>
        {listas.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Nada pendiente por entregar" description="Cuando el taller termine una fórmula aparecerá aquí." />
        ) : (
          <ul className="divide-y divide-line">
            {listas.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{f.paciente}</p>
                  <p className="text-xs text-muted">{haceCuanto(desde(f))}</p>
                </div>
                <EstadoBadge estado={f.estado} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}

import { Check } from 'lucide-react'
import { Badge, Button, Card } from '../components/ui/index.jsx'

const incluye = [
  'Fórmulas y seguimiento de taller ilimitados',
  'Inventario de monturas',
  'Registro de mermas',
  'Citas',
  'Reportes mensuales en Excel',
]

export default function Suscripcion() {
  return (
    <div className="max-w-2xl">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Tu plan</p>
            <h2 className="mt-1 text-2xl font-bold">Prueba gratuita</h2>
          </div>
          <Badge tone="violet">Activa</Badge>
        </div>
        <ul className="mt-6 space-y-2.5">
          {incluye.map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-brand-500">
                <Check className="h-3.5 w-3.5" />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-line pt-5">
          <Button disabled>Elegir plan (próximamente)</Button>
          <p className="mt-2 text-xs text-muted">Los pagos se conectan en una etapa posterior.</p>
        </div>
      </Card>
    </div>
  )
}

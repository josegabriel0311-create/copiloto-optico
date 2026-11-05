import { Plus, Glasses } from 'lucide-react'
import { PageHeader, Card, Button, Badge, Input, StatCard, EmptyState } from '../components/ui/index.jsx'

const brand = [
  ['50', '#F5F3FF'],
  ['100', '#EDE9FE'],
  ['200', '#DDD6FE'],
  ['300', '#C4B5FD'],
  ['400', '#A78BFA'],
  ['500', '#8B5CF6'],
  ['600', '#7C3AED'],
  ['700', '#6D28D9'],
  ['800', '#5B21B6'],
  ['900', '#4C1D95'],
]

const estados = [
  ['Éxito', '#10B981'],
  ['Alerta', '#F59E0B'],
  ['Error', '#EF4444'],
  ['Info', '#3B82F6'],
  ['Noite', '#1C1730'],
]

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignSystem() {
  return (
    <>
      <PageHeader title="Design system" description="Colores, tipografía y componentes base de Copiloto Óptico." />

      <Section title="Color de marca · Roxo Noite">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {brand.map(([step, hex]) => (
            <div key={step}>
              <div className="h-16 rounded-xl border border-slate-100" style={{ background: hex }} />
              <p className="mt-1.5 text-xs font-semibold text-slate-700">{step}</p>
              <p className="text-[11px] text-slate-400">{hex}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Colores de estado">
        <div className="flex flex-wrap gap-4">
          {estados.map(([name, hex]) => (
            <div key={name} className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl" style={{ background: hex }} />
              <div>
                <p className="text-sm font-semibold text-slate-700">{name}</p>
                <p className="text-xs text-slate-400">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía · Plus Jakarta Sans">
        <Card className="space-y-3">
          <p className="text-3xl font-bold tracking-tight text-slate-900">Título de página</p>
          <p className="text-lg font-semibold text-slate-900">Título de sección</p>
          <p className="text-base text-slate-700">Texto normal para contenido y formularios.</p>
          <p className="text-sm text-slate-500">Texto secundario y descripciones.</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Etiqueta</p>
        </Card>
      </Section>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Plus}>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Borde</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Eliminar</Button>
          <Button size="sm">Pequeño</Button>
          <Button size="lg">Grande</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      <Section title="Etiquetas de estado">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">Nuevo</Badge>
          <Badge tone="warning">En taller</Badge>
          <Badge tone="info">En laboratorio</Badge>
          <Badge tone="success">Listo para entregar</Badge>
          <Badge tone="danger">Retrasado</Badge>
          <Badge>Entregado</Badge>
        </div>
      </Section>

      <Section title="Campos de formulario">
        <Card className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Input label="Nombre del cliente" placeholder="Ej: María Gómez" />
          <Input label="Teléfono" placeholder="300 123 4567" hint="Para avisar cuando esté listo" />
        </Card>
      </Section>

      <Section title="Tarjetas">
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Órdenes en taller" value="12" icon={Glasses} trend="3 más que ayer" />
          <EmptyState icon={Glasses} title="Estado vacío" description="Se muestra cuando aún no hay datos." />
        </div>
      </Section>
    </>
  )
}

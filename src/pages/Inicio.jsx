import { Link } from 'react-router-dom'
import { Store, Eye, Wrench, Users, ClipboardList, Clock, ArrowRight } from 'lucide-react'
import { PageHeader, StatCard, Card } from '../components/ui/index.jsx'

const modulos = [
  {
    to: '/mostrador',
    icon: Store,
    title: 'Mostrador',
    description: 'Atención al cliente, ventas y seguimiento de pedidos.',
  },
  {
    to: '/gabinete',
    icon: Eye,
    title: 'Gabinete',
    description: 'Exámenes visuales, historias clínicas y fórmulas.',
  },
  {
    to: '/taller',
    icon: Wrench,
    title: 'Taller',
    description: 'Órdenes de trabajo, montaje y control de calidad.',
  },
]

export default function Inicio() {
  return (
    <>
      <PageHeader title="Hola 👋" description="Este es el resumen de tu óptica hoy." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes atendidos hoy" value="0" icon={Users} />
        <StatCard label="Exámenes del día" value="0" icon={Eye} />
        <StatCard label="Órdenes en taller" value="0" icon={ClipboardList} />
        <StatCard label="Listas para entregar" value="0" icon={Clock} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Módulos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {modulos.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-brand-200">
              <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

import { Eye, Plus } from 'lucide-react'
import { PageHeader, EmptyState, Button } from '../components/ui/index.jsx'

export default function Gabinete() {
  return (
    <>
      <PageHeader
        title="Gabinete"
        description="Exámenes visuales, historias clínicas y fórmulas."
        actions={<Button icon={Plus}>Nuevo examen</Button>}
      />
      <EmptyState
        icon={Eye}
        title="Aún no hay exámenes"
        description="Registra el primer examen visual para empezar las historias clínicas."
        action={<Button variant="secondary" icon={Plus}>Registrar examen</Button>}
      />
    </>
  )
}

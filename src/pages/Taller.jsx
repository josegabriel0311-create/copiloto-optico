import { Wrench, Plus } from 'lucide-react'
import { PageHeader, EmptyState, Button } from '../components/ui/index.jsx'

export default function Taller() {
  return (
    <>
      <PageHeader
        title="Taller"
        description="Órdenes de trabajo, montaje y control de calidad."
        actions={<Button icon={Plus}>Nueva orden</Button>}
      />
      <EmptyState
        icon={Wrench}
        title="No hay órdenes en taller"
        description="Las órdenes creadas desde el mostrador aparecerán aquí para su montaje."
      />
    </>
  )
}

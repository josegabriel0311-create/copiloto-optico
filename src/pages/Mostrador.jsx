import { Store, Plus } from 'lucide-react'
import { PageHeader, EmptyState, Button } from '../components/ui/index.jsx'

export default function Mostrador() {
  return (
    <>
      <PageHeader
        title="Mostrador"
        description="Atención al cliente, ventas y seguimiento de pedidos."
        actions={<Button icon={Plus}>Nueva venta</Button>}
      />
      <EmptyState
        icon={Store}
        title="Aún no hay ventas registradas"
        description="Aquí verás las ventas del día y los pedidos de tus clientes."
        action={<Button variant="secondary" icon={Plus}>Registrar primera venta</Button>}
      />
    </>
  )
}

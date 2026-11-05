import { PageHeader, Card, Input, Button } from '../components/ui/index.jsx'

export default function Configuracion() {
  return (
    <>
      <PageHeader title="Configuración" description="Datos de tu óptica." />
      <Card className="max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre de la óptica" placeholder="Óptica Visión Clara" />
          <Input label="NIT" placeholder="900.123.456-7" />
          <Input label="Teléfono" placeholder="300 123 4567" />
          <Input label="Ciudad" placeholder="Medellín" />
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Guardar cambios</Button>
        </div>
      </Card>
    </>
  )
}

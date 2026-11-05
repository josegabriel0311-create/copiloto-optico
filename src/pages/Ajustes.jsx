import { useState } from 'react'
import { Moon, Save, Sun } from 'lucide-react'
import { Button, Card, Input } from '../components/ui/index.jsx'
import { useStore } from '../lib/store.jsx'
import { useTheme } from '../lib/theme.js'

export default function Ajustes() {
  const { optica, guardarOptica } = useStore()
  const { dark, toggle } = useTheme()
  const [form, setForm] = useState(optica)
  const [guardado, setGuardado] = useState(false)
  const set = (k) => (e) => {
    setGuardado(false)
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  const guardar = (e) => {
    e.preventDefault()
    guardarOptica(form)
    setGuardado(true)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h2 className="mb-4 font-bold">Datos de la óptica</h2>
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={set('nombre')} />
          <Input label="NIT" placeholder="900.123.456-7" value={form.nit} onChange={set('nit')} />
          <Input label="Teléfono" placeholder="300 123 4567" value={form.telefono} onChange={set('telefono')} />
          <Input label="Ciudad" placeholder="Medellín" value={form.ciudad} onChange={set('ciudad')} />
          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {guardado && <span className="text-sm text-emerald-500">Cambios guardados</span>}
            <Button type="submit" icon={Save}>
              Guardar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Apariencia</h2>
          <p className="text-sm text-muted">Tema {dark ? 'oscuro' : 'claro'}</p>
        </div>
        <Button variant="outline" icon={dark ? Sun : Moon} onClick={toggle}>
          Cambiar a {dark ? 'claro' : 'oscuro'}
        </Button>
      </Card>
    </div>
  )
}

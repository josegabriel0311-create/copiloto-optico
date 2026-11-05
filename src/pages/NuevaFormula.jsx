import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { Button, Card, Input, Select, Textarea } from '../components/ui/index.jsx'
import { useStore } from '../lib/store.jsx'

const ojoVacio = { esfera: '', cilindro: '', eje: '', adicion: '', dp: '' }
const camposOjo = [
  ['esfera', 'Esfera', '-1.25'],
  ['cilindro', 'Cilindro', '-0.50'],
  ['eje', 'Eje', '90'],
  ['adicion', 'Adición', '+2.00'],
  ['dp', 'DP', '31'],
]

const TIPOS = ['Monofocal', 'Bifocal', 'Progresivo', 'Ocupacional', 'Solar formulado']

function FilaOjo({ titulo, valor, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-brand-500">{titulo}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {camposOjo.map(([k, label, ph]) => (
          <Input key={k} label={label} placeholder={ph} value={valor[k]} onChange={(e) => onChange({ ...valor, [k]: e.target.value })} />
        ))}
      </div>
    </div>
  )
}

export default function NuevaFormula() {
  const { crearFormula, inventario } = useStore()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [od, setOd] = useState(ojoVacio)
  const [oi, setOi] = useState(ojoVacio)
  const [tipoLente, setTipoLente] = useState(TIPOS[0])
  const [montura, setMontura] = useState('')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!paciente.trim() || guardando) return
    setGuardando(true)
    const nueva = await crearFormula({ paciente: paciente.trim(), telefono, od, oi, tipoLente, montura, notas })
    setGuardando(false)
    if (nueva) navigate('/taller')
  }

  return (
    <form onSubmit={guardar} className="space-y-6">
      <Card>
        <h2 className="mb-4 font-bold">Paciente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre completo" placeholder="Ej.: María Fernanda Rojas" value={paciente} onChange={(e) => setPaciente(e.target.value)} required />
          <Input label="Teléfono" placeholder="300 123 4567" value={telefono} onChange={(e) => setTelefono(e.target.value)} hint="Para avisarle cuando esté lista" />
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-bold">Fórmula</h2>
        <FilaOjo titulo="Ojo derecho (OD)" valor={od} onChange={setOd} />
        <FilaOjo titulo="Ojo izquierdo (OI)" valor={oi} onChange={setOi} />
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Lente y montura</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Tipo de lente" value={tipoLente} onChange={(e) => setTipoLente(e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select label="Montura" value={montura} onChange={(e) => setMontura(e.target.value)}>
            <option value="">Montura propia del paciente</option>
            {inventario.map((m) => (
              <option key={m.id} value={m.codigo} disabled={m.cantidad === 0}>
                {m.marca} · {m.modelo} ({m.codigo}){m.cantidad === 0 ? ' — agotada' : ''}
              </option>
            ))}
          </Select>
          <Textarea className="sm:col-span-2" label="Observaciones" placeholder="Tratamientos, filtro azul, fotocromático…" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" icon={Save} disabled={!paciente.trim() || guardando}>
          {guardando ? 'Guardando…' : 'Guardar y enviar a taller'}
        </Button>
      </div>
    </form>
  )
}

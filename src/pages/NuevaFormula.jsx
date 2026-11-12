import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Save, Search, X, Copy, UserPlus, Phone, IdCard, History } from 'lucide-react'
import { Button, Card, Input, Select, Textarea } from '../components/ui/index.jsx'
import { pacienteVacio, normalizar, edad } from '../components/FormPaciente.jsx'
import { useStore } from '../lib/store.jsx'
import { cx } from '../lib/utils.js'

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
          <Input key={k} label={label} placeholder={ph} value={valor[k] ?? ''} onChange={(e) => onChange({ ...valor, [k]: e.target.value })} />
        ))}
      </div>
    </div>
  )
}

// Busca un paciente existente o deja escribir uno nuevo
function SelectorPaciente({ pacientes, seleccionado, onSeleccionar, nuevo, onNuevo }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  useEffect(() => {
    const cerrar = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false)
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  const texto = nuevo.nombre
  const sugerencias = useMemo(() => {
    const t = normalizar(texto.trim())
    const digitos = texto.replace(/\D/g, '')
    if (t.length < 2) return []
    return pacientes
      .filter((p) => normalizar(p.nombre).includes(t) || (digitos.length >= 3 && `${p.documento} ${p.telefono}`.replace(/\D/g, '').includes(digitos)))
      .slice(0, 6)
  }, [pacientes, texto])

  if (seleccionado) {
    const años = edad(seleccionado.fecha_nacimiento)
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-500/40 bg-brand-500/10 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 font-bold text-brand-600 dark:text-brand-300">
          {seleccionado.nombre.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <Link to={`/pacientes/${seleccionado.id}`} className="font-bold hover:underline">
            {seleccionado.nombre}
          </Link>
          <p className="flex flex-wrap gap-x-3 text-xs text-muted">
            {seleccionado.documento && <span>{seleccionado.documento}</span>}
            {seleccionado.telefono && <span>{seleccionado.telefono}</span>}
            {años !== null && <span>{años} años</span>}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" icon={X} onClick={() => onSeleccionar(null)}>
          Cambiar
        </Button>
      </div>
    )
  }

  const set = (k) => (e) => onNuevo({ ...nuevo, [k]: e.target.value })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="relative sm:col-span-2" ref={caja}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Nombre del paciente</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-line bg-surface2/40 pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Busca un paciente o escribe el nombre de uno nuevo"
              value={texto}
              onChange={(e) => {
                set('nombre')(e)
                setAbierto(true)
              }}
              onFocus={() => setAbierto(true)}
              autoComplete="off"
              required
            />
          </div>
        </label>
        {abierto && sugerencias.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
            {sugerencias.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSeleccionar(p)
                    setAbierto(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xs font-bold text-brand-500">
                    {p.nombre.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.nombre}</span>
                    <span className="flex gap-3 text-xs text-muted">
                      {p.documento && (
                        <span className="inline-flex items-center gap-1">
                          <IdCard className="h-3 w-3" /> {p.documento}
                        </span>
                      )}
                      {p.telefono && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {p.telefono}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {texto.trim().length >= 2 && (
          <p className={cx('mt-1.5 flex items-center gap-1.5 text-xs', sugerencias.length ? 'text-muted' : 'text-brand-500')}>
            <UserPlus className="h-3.5 w-3.5" />
            {sugerencias.length ? 'Elige uno de la lista o sigue escribiendo para crear un paciente nuevo.' : 'Paciente nuevo: se guardará en Pacientes.'}
          </p>
        )}
      </div>
      <Input label="Documento" placeholder="C.C. 1.020.304.050" value={nuevo.documento} onChange={set('documento')} />
      <Input label="Teléfono" placeholder="300 123 4567" value={nuevo.telefono} onChange={set('telefono')} hint="Para avisarle cuando esté lista" />
    </div>
  )
}

export default function NuevaFormula() {
  const { crearFormula, inventario, pacientes, formulas } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [pacienteId, setPacienteId] = useState(params.get('paciente'))
  const [nuevo, setNuevo] = useState(pacienteVacio)
  const [od, setOd] = useState(ojoVacio)
  const [oi, setOi] = useState(ojoVacio)
  const [tipoLente, setTipoLente] = useState(TIPOS[0])
  const [montura, setMontura] = useState('')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  const seleccionado = pacientes.find((p) => p.id === pacienteId) ?? null
  const ultima = seleccionado
    ? formulas.filter((f) => f.pacienteId === seleccionado.id).sort((a, b) => b.creada.localeCompare(a.creada))[0]
    : null

  const listo = seleccionado || nuevo.nombre.trim()

  const copiarUltima = () => {
    setOd({ ...ojoVacio, ...ultima.od })
    setOi({ ...ojoVacio, ...ultima.oi })
    if (ultima.tipoLente) setTipoLente(ultima.tipoLente)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!listo || guardando) return
    setGuardando(true)
    const creada = await crearFormula({
      pacienteId: seleccionado?.id,
      nuevoPaciente: nuevo,
      od,
      oi,
      tipoLente,
      montura,
      notas,
    })
    setGuardando(false)
    if (creada) navigate('/taller')
  }

  return (
    <form onSubmit={guardar} className="space-y-6">
      <Card>
        <h2 className="mb-4 font-bold">Paciente</h2>
        <SelectorPaciente
          pacientes={pacientes}
          seleccionado={seleccionado}
          onSeleccionar={(p) => {
            setPacienteId(p?.id ?? null)
            if (!p) setNuevo(pacienteVacio)
          }}
          nuevo={nuevo}
          onNuevo={setNuevo}
        />
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Fórmula</h2>
          {ultima && (
            <Button type="button" variant="outline" size="sm" icon={Copy} onClick={copiarUltima}>
              Copiar la última ({new Date(ultima.creada).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })})
            </Button>
          )}
        </div>
        {ultima && (
          <p className="-mt-2 flex items-center gap-1.5 text-xs text-muted">
            <History className="h-3.5 w-3.5" /> Útil cuando solo cambia la montura o el tipo de lente.
          </p>
        )}
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
        <Button type="submit" size="lg" icon={Save} disabled={!listo || guardando}>
          {guardando ? 'Guardando…' : 'Guardar y enviar a taller'}
        </Button>
      </div>
    </form>
  )
}

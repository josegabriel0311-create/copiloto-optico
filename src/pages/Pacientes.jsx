import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, ChevronRight, Phone, IdCard } from 'lucide-react'
import { Button, Card, SearchInput, EmptyState } from '../components/ui/index.jsx'
import FormPaciente, { pacienteVacio, normalizar } from '../components/FormPaciente.jsx'
import { useStore } from '../lib/store.jsx'
import { haceCuanto } from '../lib/utils.js'

function NuevoPaciente({ onCancelar }) {
  const { crearPaciente } = useStore()
  const navigate = useNavigate()
  const [p, setP] = useState(pacienteVacio)
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!p.nombre.trim()) return
    setGuardando(true)
    const nuevo = await crearPaciente(p)
    setGuardando(false)
    if (nuevo) navigate(`/pacientes/${nuevo.id}`)
  }

  return (
    <Card className="mb-6">
      <h2 className="mb-4 font-bold">Nuevo paciente</h2>
      <form onSubmit={guardar}>
        <FormPaciente valor={p} onChange={setP} autoFocus />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus} disabled={!p.nombre.trim() || guardando}>
            {guardando ? 'Guardando…' : 'Crear paciente'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default function Pacientes() {
  const { pacientes, formulas } = useStore()
  const [q, setQ] = useState('')
  const [creando, setCreando] = useState(false)

  // Número de fórmulas y última visita por paciente
  const resumen = useMemo(() => {
    const r = {}
    for (const f of formulas) {
      if (!f.pacienteId) continue
      const x = (r[f.pacienteId] ||= { total: 0, ultima: null })
      x.total++
      if (!x.ultima || f.creada > x.ultima) x.ultima = f.creada
    }
    return r
  }, [formulas])

  const visibles = useMemo(() => {
    const t = normalizar(q.trim())
    const digitos = q.replace(/\D/g, '')
    if (!t) return pacientes
    return pacientes.filter(
      (p) =>
        normalizar(p.nombre).includes(t) ||
        (digitos && ((p.documento ?? '').replace(/\D/g, '').includes(digitos) || (p.telefono ?? '').replace(/\D/g, '').includes(digitos))),
    )
  }, [pacientes, q])

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          className="min-w-[220px] flex-1 sm:max-w-md"
          placeholder="Buscar por nombre, documento o teléfono..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <p className="text-sm text-muted">
          {visibles.length} {visibles.length === 1 ? 'paciente' : 'pacientes'}
        </p>
        {!creando && (
          <Button className="ml-auto" size="lg" icon={Plus} onClick={() => setCreando(true)}>
            Nuevo paciente
          </Button>
        )}
      </div>

      {creando && <NuevoPaciente onCancelar={() => setCreando(false)} />}

      <Card className="p-2 sm:p-2">
        {visibles.length === 0 ? (
          <EmptyState
            icon={Users}
            title={pacientes.length ? 'Sin resultados' : 'Aún no hay pacientes'}
            description={
              pacientes.length
                ? 'Prueba con otro nombre, documento o teléfono.'
                : 'Se crean solos al registrar una fórmula, o puedes agregarlos aquí.'
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {visibles.map((p) => {
              const r = resumen[p.id]
              return (
                <li key={p.id}>
                  <Link to={`/pacientes/${p.id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface2/60 sm:px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-500 dark:text-brand-300">
                      {p.nombre.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.nombre}</p>
                      <p className="flex flex-wrap gap-x-3 text-xs text-muted">
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
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold">
                        {r?.total ?? 0} {r?.total === 1 ? 'fórmula' : 'fórmulas'}
                      </p>
                      <p className="text-xs text-muted">{r?.ultima ? `Última ${haceCuanto(r.ultima)}` : 'Sin fórmulas'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Save, Phone, Mail, IdCard, Cake, Glasses, UserX } from 'lucide-react'
import { Button, Card, EmptyState } from '../components/ui/index.jsx'
import FormPaciente, { edad } from '../components/FormPaciente.jsx'
import TablaFormula from '../components/TablaFormula.jsx'
import EstadoBadge from '../components/EstadoBadge.jsx'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import { ResumenCobro } from '../components/Cobro.jsx'
import { useStore } from '../lib/store.jsx'
import { puedeCobrar } from '../lib/permisos.js'
import { mensajeLista, mensajeSaludo } from '../lib/whatsapp.js'

const fechaLarga = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

function Dato({ icon: Icon, children }) {
  if (!children) return null
  return (
    <p className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  )
}

function DatosPaciente({ paciente }) {
  const { actualizarPaciente } = useStore()
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(paciente)
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    const ok = await actualizarPaciente(paciente.id, form)
    setGuardando(false)
    if (ok) setEditando(false)
  }

  if (editando) {
    return (
      <Card>
        <h2 className="mb-4 font-bold">Editar datos</h2>
        <form onSubmit={guardar}>
          <FormPaciente valor={form} onChange={setForm} />
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(paciente)
                setEditando(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" icon={Save} disabled={!form.nombre.trim() || guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  const años = edad(paciente.fecha_nacimiento)
  const sinDatos = !paciente.documento && !paciente.telefono && !paciente.email && !paciente.fecha_nacimiento

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-bold">Datos</h2>
        <Button
          variant="ghost"
          size="sm"
          icon={Pencil}
          onClick={() => {
            setForm(paciente)
            setEditando(true)
          }}
        >
          Editar
        </Button>
      </div>
      <div className="space-y-2.5">
        <Dato icon={IdCard}>{paciente.documento}</Dato>
        <Dato icon={Phone}>{paciente.telefono}</Dato>
        <Dato icon={Mail}>{paciente.email}</Dato>
        <Dato icon={Cake}>{paciente.fecha_nacimiento && `${fechaLarga(`${paciente.fecha_nacimiento}T12:00:00`)}${años !== null ? ` · ${años} años` : ''}`}</Dato>
        {sinDatos && <p className="text-sm text-muted">Sin datos de contacto. Agrégalos con “Editar”.</p>}
      </div>
      {paciente.notas && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Antecedentes y notas</p>
          <p className="whitespace-pre-line text-sm">{paciente.notas}</p>
        </div>
      )}
    </Card>
  )
}

export default function PacienteDetalle() {
  const { id } = useParams()
  const { pacientes, formulas, optica, usuario, cuentas, marcarAvisado } = useStore()
  const cobra = puedeCobrar(usuario.rol)
  const paciente = pacientes.find((p) => p.id === id)
  const historial = formulas.filter((f) => f.pacienteId === id).sort((a, b) => b.creada.localeCompare(a.creada))

  if (!paciente) {
    return (
      <Card>
        <EmptyState
          icon={UserX}
          title="No encontramos este paciente"
          action={
            <Link to="/pacientes">
              <Button variant="outline" icon={ArrowLeft}>
                Volver a pacientes
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <>
      <Link to="/pacientes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Pacientes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15 text-lg font-bold text-brand-500 dark:text-brand-300">
            {paciente.nombre.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold">{paciente.nombre}</h1>
            <p className="text-sm text-muted">
              {historial.length} {historial.length === 1 ? 'fórmula' : 'fórmulas'} · paciente desde {fechaLarga(paciente.creado)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonWhatsApp telefono={paciente.telefono} mensaje={mensajeSaludo({ paciente: paciente.nombre, optica })} size="md">
            Escribir
          </BotonWhatsApp>
          <Link to={`/nueva-formula?paciente=${paciente.id}`}>
            <Button size="lg" icon={Plus}>
              Nueva fórmula
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <DatosPaciente key={paciente.id} paciente={paciente} />

        <div>
          <h2 className="mb-3 font-bold">Historia de fórmulas</h2>
          {historial.length === 0 ? (
            <Card>
              <EmptyState icon={Glasses} title="Sin fórmulas todavía" description="La primera fórmula de este paciente aparecerá aquí." />
            </Card>
          ) : (
            <div className="space-y-4">
              {historial.map((f, i) => (
                <Card key={f.id}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">
                        {fechaLarga(f.creada)}
                        {i === 0 && <span className="ml-2 text-xs font-semibold text-brand-500">Más reciente</span>}
                      </p>
                      <p className="text-xs text-muted">
                        {[f.tipoLente, f.montura ? `Montura ${f.montura}` : 'Montura propia'].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <EstadoBadge estado={f.estado} />
                  </div>
                  <TablaFormula od={f.od} oi={f.oi} />
                  {f.notas && <p className="mt-3 whitespace-pre-line rounded-xl bg-surface2/60 px-3 py-2 text-sm text-muted">{f.notas}</p>}
                  {f.estado === 'lista' && (
                    <div className="mt-3">
                      <BotonWhatsApp
                        telefono={f.telefono || paciente.telefono}
                        mensaje={mensajeLista({ paciente: paciente.nombre, optica, saldo: cuentas[f.id]?.saldo ?? 0 })}
                        onEnviado={() => marcarAvisado(f.id)}
                      >
                        {f.avisadoEn ? 'Avisar de nuevo que está lista' : 'Avisar que está lista'}
                      </BotonWhatsApp>
                    </div>
                  )}
                  {cobra && <ResumenCobro formula={f} />}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
import { Plus, ClipboardList, Hourglass, PackageCheck, Wallet, CheckCheck } from 'lucide-react'
import { Button, Card, StatCard, EmptyState } from '../components/ui/index.jsx'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import { EtiquetaSaldo } from '../components/Cobro.jsx'
import { useStore } from '../lib/store.jsx'
import { puede, puedeCobrar } from '../lib/permisos.js'
import { mensajeLista } from '../lib/whatsapp.js'
import { cx, esHoy, haceCuanto, pesos } from '../lib/utils.js'

export default function Inicio() {
  const { formulas, cuentas, optica, usuario, marcarAvisado } = useStore()
  const cobra = puedeCobrar(usuario.rol)
  const deHoy = formulas.filter((f) => esHoy(f.creada)).length
  const enTaller = formulas.filter((f) => f.estado === 'taller').length
  const listas = formulas.filter((f) => f.estado === 'lista')
  const porCobrar = formulas.reduce((s, f) => s + (cuentas[f.id]?.saldo ?? 0), 0)

  // Fecha en que quedó lista (último cambio de estado)
  const desde = (f) => f.historial[f.historial.length - 1]?.fecha ?? f.creada

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Resumen de hoy</h1>
        {puede(usuario.rol, '/nueva-formula') && (
          <Link to="/nueva-formula">
            <Button size="lg" icon={Plus}>
              Nueva fórmula
            </Button>
          </Link>
        )}
      </div>

      <div className={cx('grid gap-4 sm:grid-cols-3', cobra && 'lg:grid-cols-4')}>
        <StatCard label="Fórmulas de hoy" value={deHoy} icon={ClipboardList} tone="violet" />
        <StatCard label="En taller" value={enTaller} icon={Hourglass} tone="amber" />
        <StatCard label="Listas para entrega" value={listas.length} icon={PackageCheck} tone="green" />
        {cobra && (
          <Link to="/cobros" className="sm:col-span-3 lg:col-span-1">
            <StatCard label="Por cobrar" value={pesos(porCobrar)} icon={Wallet} tone="blue" />
          </Link>
        )}
      </div>

      <Card className="mt-6">
        <h2 className="mb-2 font-bold">Listas para entregar</h2>
        {listas.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Nada pendiente por entregar" description="Cuando el taller termine una fórmula aparecerá aquí." />
        ) : (
          <ul className="divide-y divide-line">
            {listas.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  {f.pacienteId ? (
                    <Link to={`/pacientes/${f.pacienteId}`} className="block truncate font-semibold hover:text-brand-500 hover:underline">
                      {f.paciente}
                    </Link>
                  ) : (
                    <p className="truncate font-semibold">{f.paciente}</p>
                  )}
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span>Lista {haceCuanto(desde(f))}</span>
                    {f.avisadoEn && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> avisado {haceCuanto(f.avisadoEn)}
                      </span>
                    )}
                  </p>
                </div>
                {cobra && <EtiquetaSaldo formulaId={f.id} />}
                <BotonWhatsApp
                  telefono={f.telefono}
                  mensaje={mensajeLista({ paciente: f.paciente, optica, saldo: cuentas[f.id]?.saldo ?? 0 })}
                  onEnviado={() => marcarAvisado(f.id)}
                >
                  {f.avisadoEn ? 'Avisar de nuevo' : 'Avisar'}
                </BotonWhatsApp>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}

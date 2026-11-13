import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Banknote, CalendarRange, FileSpreadsheet, Plus, Trash2, CircleCheck } from 'lucide-react'
import { Button, Card, Field, StatCard, EmptyState } from '../components/ui/index.jsx'
import EstadoBadge from '../components/EstadoBadge.jsx'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import { FormAbono } from '../components/Cobro.jsx'
import { useStore } from '../lib/store.jsx'
import { esAdmin } from '../lib/permisos.js'
import { mensajeSaldo } from '../lib/whatsapp.js'
import { claveMes, exportarExcel, hoyISO, mesActual, pesos } from '../lib/utils.js'

const diaLocal = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '')

function Pendiente({ formula, cuenta, optica }) {
  const [abonando, setAbonando] = useState(false)
  return (
    <li className="py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          {formula.pacienteId ? (
            <Link to={`/pacientes/${formula.pacienteId}`} className="font-semibold hover:text-brand-500 hover:underline">
              {formula.paciente}
            </Link>
          ) : (
            <p className="font-semibold">{formula.paciente}</p>
          )}
          <p className="text-xs text-muted">
            {fechaCorta(formula.creada)} · Precio {pesos(cuenta.precio)} · Pagado {pesos(cuenta.pagado)}
          </p>
        </div>
        <EstadoBadge estado={formula.estado} />
        <p className="w-28 text-right font-bold text-amber-600 dark:text-amber-400">{pesos(cuenta.saldo)}</p>
        <div className="flex gap-2">
          <BotonWhatsApp telefono={formula.telefono} mensaje={mensajeSaldo({ paciente: formula.paciente, optica, saldo: cuenta.saldo })} size="icon" title="Recordar el saldo por WhatsApp" />
          {!abonando && (
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setAbonando(true)} className="h-9">
              Abonar
            </Button>
          )}
        </div>
      </div>
      {abonando && (
        <div className="mt-3">
          <FormAbono formulaId={formula.id} onListo={() => setAbonando(false)} onCancelar={() => setAbonando(false)} />
        </div>
      )}
    </li>
  )
}

export default function Cobros() {
  const { formulas, pagos, cuentas, optica, usuario, eliminarPago } = useStore()
  const [dia, setDia] = useState(hoyISO())

  const pendientes = useMemo(
    () => formulas.filter((f) => cuentas[f.id]?.saldo > 0).sort((a, b) => a.creada.localeCompare(b.creada)),
    [formulas, cuentas],
  )
  const porCobrar = pendientes.reduce((s, f) => s + cuentas[f.id].saldo, 0)
  const sinPrecio = formulas.filter((f) => f.precio <= 0 && f.estado !== 'entregada').length

  const nombrePorFormula = useMemo(() => Object.fromEntries(formulas.map((f) => [f.id, f])), [formulas])
  const delDia = pagos.filter((p) => diaLocal(p.fecha) === dia)
  const totalDia = delDia.reduce((s, p) => s + p.monto, 0)
  const totalHoy = pagos.filter((p) => diaLocal(p.fecha) === hoyISO()).reduce((s, p) => s + p.monto, 0)
  const totalMes = pagos.filter((p) => claveMes(p.fecha) === mesActual()).reduce((s, p) => s + p.monto, 0)

  const porMetodo = delDia.reduce((acc, p) => {
    acc[p.metodo] = (acc[p.metodo] ?? 0) + p.monto
    return acc
  }, {})

  const exportar = () => {
    const mes = claveMes(`${dia}T12:00:00`)
    exportarExcel(
      `pagos-${mes}`,
      [
        { label: 'Fecha', value: (p) => diaLocal(p.fecha) },
        { label: 'Paciente', value: (p) => nombrePorFormula[p.formula_id]?.paciente ?? '' },
        { label: 'Método', value: 'metodo' },
        { label: 'Valor', value: 'monto' },
        { label: 'Nota', value: 'nota' },
        { label: 'Registrado por', value: 'usuario' },
      ],
      pagos.filter((p) => claveMes(p.fecha) === mes).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Por cobrar" value={pesos(porCobrar)} icon={Wallet} tone="amber" />
        <StatCard label="Recaudado hoy" value={pesos(totalHoy)} icon={Banknote} tone="green" />
        <StatCard label="Recaudado este mes" value={pesos(totalMes)} icon={CalendarRange} tone="violet" />
      </div>

      <Card className="mt-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Saldos pendientes</h2>
          {sinPrecio > 0 && (
            <p className="text-xs text-muted">
              {sinPrecio} {sinPrecio === 1 ? 'fórmula activa no tiene' : 'fórmulas activas no tienen'} precio. Defínelo desde la ficha del paciente.
            </p>
          )}
        </div>
        {pendientes.length === 0 ? (
          <EmptyState icon={CircleCheck} title="Nadie debe nada" description="Las fórmulas con saldo pendiente aparecerán aquí." />
        ) : (
          <ul className="divide-y divide-line">
            {pendientes.map((f) => (
              <Pendiente key={f.id} formula={f} cuenta={cuentas[f.id]} optica={optica} />
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-bold">Caja</h2>
            <p className="text-sm text-muted">Pagos recibidos en el día.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Día">
              <input
                type="date"
                value={dia}
                max={hoyISO()}
                onChange={(e) => e.target.value && setDia(e.target.value)}
                className="h-10 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink focus:border-brand-500 focus:outline-none"
              />
            </Field>
            <Button variant="outline" icon={FileSpreadsheet} onClick={exportar}>
              Exportar pagos del mes
            </Button>
          </div>
        </div>

        {delDia.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No hay pagos registrados este día.</p>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {delDia.map((p) => {
                const f = nombrePorFormula[p.formula_id]
                return (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-14 shrink-0 text-xs text-muted">
                      {new Date(p.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{f?.paciente ?? 'Fórmula eliminada'}</p>
                      <p className="text-xs text-muted">
                        {p.metodo}
                        {p.nota ? ` · ${p.nota}` : ''}
                        {p.usuario ? ` · ${p.usuario}` : ''}
                      </p>
                    </div>
                    <p className="font-bold">{pesos(p.monto)}</p>
                    {esAdmin(usuario.rol) && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el pago de ${pesos(p.monto)}? Úsalo solo para corregir un error.`)) eliminarPago(p.id)
                        }}
                        className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-red-500"
                        aria-label="Eliminar pago"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
              {Object.entries(porMetodo).map(([m, v]) => (
                <span key={m} className="text-muted">
                  {m}: <span className="font-semibold text-ink">{pesos(v)}</span>
                </span>
              ))}
              <span className="ml-auto font-bold">Total: {pesos(totalDia)}</span>
            </div>
          </>
        )}
      </Card>
    </>
  )
}

import { useState } from 'react'
import { FileSpreadsheet, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Button, Card, Field } from '../components/ui/index.jsx'
import { estadoInfo, useStore } from '../lib/store.jsx'
import { claveMes, cx, exportarExcel, mesActual, mesAnterior, nombreMes } from '../lib/utils.js'

const mesCorto = (clave) => {
  const [y, m] = clave.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }).replace('.', '').replace(' de ', ' ')
}

function Variacion({ actual, anterior, menosEsMejor = false }) {
  if (!anterior) return <p className="mt-1 text-xs text-muted">Sin datos del mes anterior</p>
  const pct = Math.round(((actual - anterior) / anterior) * 100)
  const sube = pct > 0
  const bueno = menosEsMejor ? !sube : sube
  const Icon = pct === 0 ? Minus : sube ? TrendingUp : TrendingDown
  return (
    <p className={cx('mt-1 flex items-center gap-1 text-xs font-semibold', pct === 0 ? 'text-muted' : bueno ? 'text-emerald-500' : 'text-red-500')}>
      <Icon className="h-3.5 w-3.5" />
      {pct > 0 ? '+' : ''}
      {pct}% vs mes anterior
    </p>
  )
}

export default function Analiticas() {
  const { formulas, mermas, inventario } = useStore()
  const [mes, setMes] = useState(mesActual())
  const prev = mesAnterior(mes)

  const formulasDe = (k) => formulas.filter((f) => claveMes(f.creada) === k)
  const mermasDe = (k) => mermas.filter((m) => claveMes(`${m.fecha}T12:00:00`) === k).reduce((s, m) => s + Number(m.cantidad || 0), 0)

  // Últimos 12 meses terminando en el mes elegido
  const meses = []
  let k = mes
  for (let i = 0; i < 12; i++) {
    meses.unshift(k)
    k = mesAnterior(k)
  }
  const serie = meses.map((m) => ({ mes: m, total: formulasDe(m).length }))
  const total12 = serie.reduce((s, x) => s + x.total, 0)
  const max = Math.max(1, ...serie.map((x) => x.total))

  const exportar = () => {
    const fs = formulasDe(mes)
    exportarExcel(`reporte-${mes}`, [
      { label: 'Sección', value: 'seccion' },
      { label: 'Fecha', value: 'fecha' },
      { label: 'Detalle', value: 'detalle' },
      { label: 'Valor', value: 'valor' },
    ], [
      { seccion: 'Resumen', fecha: mes, detalle: 'Fórmulas del mes', valor: fs.length },
      { seccion: 'Resumen', fecha: mes, detalle: 'Mermas del mes (unidades)', valor: mermasDe(mes) },
      ...fs.map((f) => ({ seccion: 'Fórmula', fecha: f.creada.slice(0, 10), detalle: `${f.paciente} · ${f.tipoLente || ''}`, valor: estadoInfo(f.estado).label })),
      ...formulas.flatMap((f) =>
        f.historial
          .filter((h) => claveMes(h.fecha) === mes)
          .map((h) => ({ seccion: 'Cambio de estado', fecha: h.fecha.slice(0, 10), detalle: `${f.paciente} · ${h.usuario}`, valor: estadoInfo(h.estado).label })),
      ),
      ...mermas
        .filter((m) => claveMes(`${m.fecha}T12:00:00`) === mes)
        .map((m) => ({ seccion: 'Merma', fecha: m.fecha, detalle: `${m.tipo} · ${m.referencia || ''} · ${m.motivo || ''}`, valor: m.cantidad })),
      ...inventario.map((m) => ({ seccion: 'Inventario', fecha: '', detalle: `${m.marca} ${m.modelo} (${m.codigo})`, valor: m.cantidad * (m.costo || 0) })),
    ])
  }

  return (
    <>
      <Card>
        <h2 className="font-bold">Reportes para contabilidad</h2>
        <p className="mt-1 text-sm text-muted">
          Elige un mes y descarga un Excel con el resumen, las fórmulas capturadas, el historial de cambios de estado, las mermas y el inventario de monturas valorado.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-2">
          <Field label="Mes">
            <input
              type="month"
              value={mes}
              onChange={(e) => e.target.value && setMes(e.target.value)}
              className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-ink focus:border-brand-500 focus:outline-none"
            />
          </Field>
          <Button variant="outline" icon={FileSpreadsheet} onClick={exportar} className="h-11">
            Exportar reporte del mes
          </Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">Fórmulas · {mesCorto(mes)}</p>
          <p className="mt-2 text-3xl font-bold">{formulasDe(mes).length}</p>
          <Variacion actual={formulasDe(mes).length} anterior={formulasDe(prev).length} />
        </Card>
        <Card>
          <p className="text-sm text-muted">Mermas · {mesCorto(mes)}</p>
          <p className="mt-2 text-3xl font-bold">
            {mermasDe(mes)} <span className="text-base font-semibold text-muted">un.</span>
          </p>
          <Variacion actual={mermasDe(mes)} anterior={mermasDe(prev)} menosEsMejor />
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm text-muted">Fórmulas · 12 meses</p>
            <p className="mt-2 text-3xl font-bold">{total12}</p>
          </div>
          <p className="text-xs capitalize text-muted">hasta {nombreMes(mes)}</p>
        </div>
        <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
          {serie.map((x) => (
            <div key={x.mes} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted">{x.total || ''}</span>
              <div
                className={cx('w-full rounded-t-md', x.mes === mes ? 'bg-brand-500' : 'bg-brand-500/30')}
                style={{ height: `${Math.max(4, (x.total / max) * 120)}px` }}
                title={`${mesCorto(x.mes)}: ${x.total}`}
              />
              <span className="text-[10px] text-muted">{mesCorto(x.mes).split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

import { useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import { Badge, Button, Input, Select } from './ui/index.jsx'
import { METODOS_PAGO, useStore } from '../lib/store.jsx'
import { cx, pesos } from '../lib/utils.js'

// Etiqueta corta: "Debe $X" o "Pagado"
export function EtiquetaSaldo({ formulaId, className }) {
  const { cuentas } = useStore()
  const c = cuentas[formulaId]
  if (!c || c.precio <= 0) return null
  return c.saldo > 0 ? (
    <Badge tone="amber" className={className}>
      Debe {pesos(c.saldo)}
    </Badge>
  ) : (
    <Badge tone="green" className={className}>
      Pagado
    </Badge>
  )
}

export function FormAbono({ formulaId, onListo, onCancelar }) {
  const { cuentas, registrarPago } = useStore()
  const saldo = cuentas[formulaId]?.saldo ?? 0
  const [monto, setMonto] = useState(saldo > 0 ? String(saldo) : '')
  const [metodo, setMetodo] = useState(METODOS_PAGO[0])
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!(Number(monto) > 0)) return
    setGuardando(true)
    const ok = await registrarPago({ formulaId, monto, metodo })
    setGuardando(false)
    if (ok) onListo?.()
  }

  return (
    <form onSubmit={guardar} className="grid gap-3 rounded-xl border border-line bg-surface2/40 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Input label="Valor del abono" type="number" min="1" step="any" inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value)} autoFocus required />
      <Select label="Método" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
        {METODOS_PAGO.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </Select>
      <div className="flex gap-2">
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar} className="h-11">
            Cancelar
          </Button>
        )}
        <Button type="submit" icon={Plus} disabled={guardando || !(Number(monto) > 0)} className="h-11">
          {guardando ? 'Guardando…' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

function EditarPrecio({ formulaId, precio, onCerrar }) {
  const { actualizarPrecio } = useStore()
  const [valor, setValor] = useState(precio > 0 ? String(precio) : '')
  const guardar = async (e) => {
    e.preventDefault()
    if (await actualizarPrecio(formulaId, valor)) onCerrar()
  }
  return (
    <form onSubmit={guardar} className="flex items-end gap-2">
      <Input label="Precio total" type="number" min="0" step="any" inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
      <button type="submit" className="mb-0.5 rounded-lg p-2.5 text-emerald-500 hover:bg-surface2" aria-label="Guardar precio">
        <Check className="h-5 w-5" />
      </button>
      <button type="button" onClick={onCerrar} className="mb-0.5 rounded-lg p-2.5 text-muted hover:bg-surface2" aria-label="Cancelar">
        <X className="h-5 w-5" />
      </button>
    </form>
  )
}

// Precio, pagado y saldo de una fórmula, con abonos y su detalle
export function ResumenCobro({ formula }) {
  const { cuentas, pagos } = useStore()
  const [abonando, setAbonando] = useState(false)
  const [editando, setEditando] = useState(false)
  const c = cuentas[formula.id] ?? { precio: 0, pagado: 0, saldo: 0 }
  const suyos = pagos.filter((p) => p.formula_id === formula.id)

  return (
    <div className="mt-4 border-t border-line pt-4">
      {editando ? (
        <EditarPrecio formulaId={formula.id} precio={c.precio} onCerrar={() => setEditando(false)} />
      ) : (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-xs text-muted">Precio</p>
            <button onClick={() => setEditando(true)} className="group inline-flex items-center gap-1.5 font-bold">
              {c.precio > 0 ? pesos(c.precio) : <span className="text-sm font-semibold text-brand-500">Definir precio</span>}
              <Pencil className="h-3.5 w-3.5 text-muted opacity-60 group-hover:opacity-100" />
            </button>
          </div>
          <div>
            <p className="text-xs text-muted">Pagado</p>
            <p className="font-bold">{pesos(c.pagado)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Saldo</p>
            <p className={cx('font-bold', c.saldo > 0 ? 'text-amber-600 dark:text-amber-400' : c.precio > 0 && 'text-emerald-600 dark:text-emerald-400')}>
              {pesos(c.saldo)}
            </p>
          </div>
          {!abonando && (c.saldo > 0 || c.precio === 0) && (
            <Button variant="outline" size="sm" icon={Plus} className="ml-auto" onClick={() => setAbonando(true)}>
              Registrar abono
            </Button>
          )}
        </div>
      )}

      {abonando && (
        <div className="mt-3">
          <FormAbono formulaId={formula.id} onListo={() => setAbonando(false)} onCancelar={() => setAbonando(false)} />
        </div>
      )}

      {suyos.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {suyos.map((p) => (
            <li key={p.id} className="flex flex-wrap gap-x-2">
              <span>{new Date(p.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="font-semibold text-ink">{pesos(p.monto)}</span>
              <span>· {p.metodo}</span>
              {p.usuario && <span>· {p.usuario}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

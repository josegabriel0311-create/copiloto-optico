import { useMemo, useState } from 'react'
import { FileSpreadsheet, Minus, Plus, PackageSearch } from 'lucide-react'
import { Button, Card, IconButton, Input, SearchInput, EmptyState } from '../components/ui/index.jsx'
import { useStore } from '../lib/store.jsx'
import { exportarExcel, pesos } from '../lib/utils.js'

function NuevaMontura({ onGuardar, onCancelar }) {
  const [m, setM] = useState({ codigo: '', marca: '', modelo: '', color: '', cantidad: '1', costo: '' })
  const set = (k) => (e) => setM((x) => ({ ...x, [k]: e.target.value }))
  const guardar = (e) => {
    e.preventDefault()
    if (!m.marca.trim() || !m.modelo.trim()) return
    onGuardar({ ...m, cantidad: Number(m.cantidad) || 0, costo: Number(m.costo) || 0 })
  }
  return (
    <Card className="mb-6">
      <h2 className="mb-4 font-bold">Agregar montura</h2>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-3">
        <Input label="Marca" placeholder="Ray-Ban" value={m.marca} onChange={set('marca')} required />
        <Input label="Modelo" placeholder="RB5154" value={m.modelo} onChange={set('modelo')} required />
        <Input label="Código" placeholder="MT-1010" value={m.codigo} onChange={set('codigo')} />
        <Input label="Color" placeholder="Negro" value={m.color} onChange={set('color')} />
        <Input label="Cantidad" type="number" min="0" value={m.cantidad} onChange={set('cantidad')} />
        <Input label="Costo unitario" type="number" min="0" placeholder="150000" value={m.costo} onChange={set('costo')} />
        <div className="flex justify-end gap-2 sm:col-span-3">
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus}>
            Agregar
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default function Inventario() {
  const { inventario, ajustarStock, agregarMontura } = useStore()
  const [q, setQ] = useState('')
  const [agregando, setAgregando] = useState(false)

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return inventario
    return inventario.filter((m) => `${m.marca} ${m.modelo} ${m.codigo}`.toLowerCase().includes(t))
  }, [inventario, q])

  const exportar = () =>
    exportarExcel('inventario-monturas', [
      { label: 'Código', value: 'codigo' },
      { label: 'Marca', value: 'marca' },
      { label: 'Modelo', value: 'modelo' },
      { label: 'Color', value: 'color' },
      { label: 'Cantidad', value: 'cantidad' },
      { label: 'Costo unitario', value: 'costo' },
      { label: 'Valor total', value: (m) => m.cantidad * (m.costo || 0) },
    ], inventario)

  const valorTotal = inventario.reduce((s, m) => s + m.cantidad * (m.costo || 0), 0)

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-end gap-2">
        {!agregando && (
          <Button variant="outline" size="lg" icon={Plus} onClick={() => setAgregando(true)}>
            Agregar montura
          </Button>
        )}
        <Button variant="outline" size="lg" icon={FileSpreadsheet} onClick={exportar}>
          Exportar Excel
        </Button>
      </div>

      {agregando && (
        <NuevaMontura
          onCancelar={() => setAgregando(false)}
          onGuardar={(m) => {
            agregarMontura(m)
            setAgregando(false)
          }}
        />
      )}

      <Card>
        <div className="mb-5 text-center">
          <h2 className="font-bold">Existencias rápidas</h2>
          <p className="mt-1 text-sm text-muted">Busca una montura y suma o resta unidades con un toque.</p>
          <span className="mt-3 inline-block rounded-full border border-line bg-surface2 px-3 py-1 text-xs font-semibold text-muted">
            {visibles.length} de {inventario.length}
          </span>
        </div>

        <SearchInput placeholder="Buscar por marca, modelo o código..." value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {visibles.length === 0 && <EmptyState icon={PackageSearch} title="Sin resultados" description="Prueba con otra marca, modelo o código." />}
          {visibles.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg/40 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {m.marca} · {m.modelo}
                </p>
                <p className="text-xs text-muted">
                  {[m.codigo, m.color].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconButton icon={Minus} label="Restar una unidad" onClick={() => ajustarStock(m.id, -1)} disabled={m.cantidad === 0} />
                <span className={`w-8 text-center font-bold ${m.cantidad === 0 ? 'text-red-500' : ''}`}>{m.cantidad}</span>
                <IconButton icon={Plus} label="Sumar una unidad" onClick={() => ajustarStock(m.id, 1)} />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-right text-sm text-muted">
          Inventario valorado: <span className="font-bold text-ink">{pesos(valorTotal)}</span>
        </p>
      </Card>
    </>
  )
}

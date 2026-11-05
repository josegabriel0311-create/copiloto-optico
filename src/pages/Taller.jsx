import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { SearchInput, Select } from '../components/ui/index.jsx'
import { ESTADOS, siguienteEstado, useStore } from '../lib/store.jsx'
import { cx, fechaCorta } from '../lib/utils.js'

const contadorTono = {
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  violet: 'bg-brand-500 text-white',
  amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  neutral: 'bg-surface2 text-muted',
}

export default function Taller() {
  const { formulas, avanzarFormula } = useStore()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return formulas.filter((f) => (!t || f.paciente.toLowerCase().includes(t)) && (filtro === 'todos' || f.estado === filtro))
  }, [formulas, q, filtro])

  const columnas = filtro === 'todos' ? ESTADOS : ESTADOS.filter((e) => e.id === filtro)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput className="min-w-[220px] flex-1 sm:max-w-sm" placeholder="Buscar por paciente..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-48" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
        <p className="ml-auto text-sm text-muted">
          {visibles.length} {visibles.length === 1 ? 'fórmula' : 'fórmulas'}
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex gap-4">
          {columnas.map((col) => {
            const items = visibles.filter((f) => f.estado === col.id)
            return (
              <section key={col.id} className="flex w-[260px] shrink-0 flex-col rounded-2xl border border-line bg-surface p-3">
                <header className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold">{col.label}</h3>
                  <span className={cx('flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold', contadorTono[col.tone])}>
                    {items.length}
                  </span>
                </header>
                <div className="space-y-3">
                  {items.length === 0 && <p className="px-1 py-6 text-center text-xs text-muted">Sin fórmulas</p>}
                  {items.map((f) => {
                    const sig = siguienteEstado(f.estado)
                    return (
                      <article key={f.id} className="rounded-xl border border-line bg-bg/40 p-3">
                        <p className="font-bold">{f.paciente}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {fechaCorta(f.creada)} · {f.tipoLente || '—'}
                        </p>
                        {sig && (
                          <button
                            onClick={() => avanzarFormula(f.id)}
                            className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface2/60 px-3 py-2 text-left text-xs font-semibold hover:bg-surface2"
                          >
                            <span className="truncate">Avanzar a {sig.label}</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </button>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}

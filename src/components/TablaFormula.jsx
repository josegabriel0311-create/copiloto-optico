// Muestra la fórmula de ambos ojos en una tabla compacta
const COLUMNAS = [
  ['esfera', 'Esf.'],
  ['cilindro', 'Cil.'],
  ['eje', 'Eje'],
  ['adicion', 'Add.'],
  ['dp', 'DP'],
]

export default function TablaFormula({ od = {}, oi = {} }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-center text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="py-1.5 pr-2 text-left font-semibold" />
            {COLUMNAS.map(([k, label]) => (
              <th key={k} className="px-2 py-1.5 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {[
            ['OD', od],
            ['OI', oi],
          ].map(([ojo, v]) => (
            <tr key={ojo}>
              <td className="py-2 pr-2 text-left font-bold text-brand-500">{ojo}</td>
              {COLUMNAS.map(([k]) => (
                <td key={k} className="px-2 py-2 font-semibold tabular-nums">
                  {v?.[k] || <span className="text-muted">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const cx = (...c) => c.filter(Boolean).join(' ')

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export function haceCuanto(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'hace un momento'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day')
  return rtf.format(Math.round(diff / (86400 * 30)), 'month')
}

export function fechaCorta(iso) {
  const d = new Date(iso)
  const fecha = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '')
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fecha} · ${hora}`
}

export const pesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

// "2026-11" del mes de una fecha ISO o Date
export const claveMes = (fecha) => {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const mesActual = () => claveMes(new Date())

export const mesAnterior = (clave) => {
  const [y, m] = clave.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return claveMes(d)
}

export const nombreMes = (clave) => {
  const [y, m] = clave.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString()

// Exporta filas a un archivo que Excel abre directo (CSV con ; y BOM para tildes)
export function exportarExcel(nombreArchivo, columnas, filas) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lineas = [columnas.map((c) => esc(c.label)).join(';')]
  for (const f of filas) lineas.push(columnas.map((c) => esc(typeof c.value === 'function' ? c.value(f) : f[c.value])).join(';'))
  const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombreArchivo}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

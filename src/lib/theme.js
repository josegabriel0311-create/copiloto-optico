import { useEffect, useState } from 'react'

const EVENTO = 'co-theme-change'
const esOscuro = () => document.documentElement.classList.contains('dark')

function aplicar(dark) {
  document.documentElement.classList.toggle('dark', dark)
  try {
    localStorage.setItem('co-theme', dark ? 'dark' : 'light')
  } catch (e) {
    // ignorar
  }
  window.dispatchEvent(new Event(EVENTO))
}

// Todos los componentes que usan este hook se mantienen sincronizados
export function useTheme() {
  const [dark, setDark] = useState(esOscuro)

  useEffect(() => {
    const sync = () => setDark(esOscuro())
    window.addEventListener(EVENTO, sync)
    return () => window.removeEventListener(EVENTO, sync)
  }, [])

  return { dark, toggle: () => aplicar(!esOscuro()) }
}

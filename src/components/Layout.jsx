import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutGrid,
  Glasses,
  SquareKanban,
  CalendarDays,
  Scan,
  TriangleAlert,
  BarChart3,
  Bell,
  CreditCard,
  Settings,
  PanelLeft,
  Sun,
  Moon,
  ChevronDown,
  X,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import Logo, { LogoMark } from './Logo.jsx'
import { useTheme } from '../lib/theme.js'
import { useStore } from '../lib/store.jsx'
import { useAuth } from '../lib/auth.jsx'
import { cx } from '../lib/utils.js'

export const NAV = [
  { to: '/', label: 'Inicio', icon: LayoutGrid, end: true },
  { to: '/nueva-formula', label: 'Nueva fórmula', icon: Glasses },
  { to: '/taller', label: 'Taller', icon: SquareKanban },
  { to: '/citas', label: 'Citas', icon: CalendarDays },
  { to: '/inventario', label: 'Inventario', icon: Scan },
  { to: '/mermas', label: 'Mermas', icon: TriangleAlert },
  { to: '/analiticas', label: 'Analíticas', icon: BarChart3 },
  { to: '/avisos', label: 'Avisos', icon: Bell },
  { to: '/suscripcion', label: 'Suscripción', icon: CreditCard },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

function Sidebar({ collapsed, onNavigate }) {
  return (
    <div className="flex h-full flex-col border-r border-line bg-sidebar">
      <div className={cx('flex h-16 shrink-0 items-center border-b border-line', collapsed ? 'justify-center' : 'px-5')}>
        <Logo compact={collapsed} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'bg-brand-500/15 text-ink' : 'text-ink/80 hover:bg-surface2 hover:text-ink',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function UserMenu() {
  const { usuario, optica } = useStore()
  const { user, salir } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const cerrar = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  const inicial = (usuario?.nombre ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-surface2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-500 dark:text-brand-300">
          {inicial}
        </span>
        <span className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{usuario?.nombre}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
            {optica?.nombre && (
              <p className="mt-1 truncate text-xs text-muted">
                {optica.nombre} · {usuario?.rol}
              </p>
            )}
          </div>
          <div className="my-1 border-t border-line" />
          <Link
            to="/ajustes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface2"
          >
            <Settings className="h-4 w-4" /> Ajustes
          </Link>
          <button onClick={salir} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function ErrorBanner() {
  const { error, limpiarError, recargar } = useStore()
  if (!error) return null
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
      <p className="flex-1">{error}</p>
      <button
        onClick={() => {
          limpiarError()
          recargar()
        }}
        className="inline-flex items-center gap-1 font-semibold hover:underline"
      >
        <RefreshCw className="h-4 w-4" /> Reintentar
      </button>
      <button onClick={limpiarError} className="rounded-lg p-1 hover:bg-red-500/10" aria-label="Cerrar">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()
  const actual = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  const { cargando, optica } = useStore()
  const primeraCarga = cargando && !optica

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* Barra lateral escritorio */}
      <aside className={cx('fixed inset-y-0 left-0 z-30 hidden transition-[width] lg:block', collapsed ? 'w-[76px]' : 'w-64')}>
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Barra lateral móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute left-[16.75rem] top-4 rounded-xl bg-surface p-2"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={cx('transition-[padding]', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => (window.innerWidth >= 1024 ? setCollapsed((c) => !c) : setMobileOpen(true))}
            className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-ink"
            aria-label="Mostrar u ocultar menú"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <h2 className="font-bold">{actual?.label ?? 'Copiloto Óptico'}</h2>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/avisos" className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-ink" aria-label="Avisos">
              <Bell className="h-5 w-5" />
            </Link>
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-ink"
              aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <ErrorBanner />
          {primeraCarga ? (
            <div className="flex justify-center py-24">
              <LogoMark className="h-10 w-10 animate-pulse" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}

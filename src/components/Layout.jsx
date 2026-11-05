import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Eye, Wrench, Settings, Palette, Menu, X, Bell, Search } from 'lucide-react'

const nav = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/mostrador', label: 'Mostrador', icon: Store },
  { to: '/gabinete', label: 'Gabinete', icon: Eye },
  { to: '/taller', label: 'Taller', icon: Wrench },
]

const navSecondary = [
  { to: '/configuracion', label: 'Configuración', icon: Settings },
  { to: '/design-system', label: 'Design system', icon: Palette },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <circle cx="11" cy="16" r="5" fill="none" stroke="#fff" strokeWidth="2.5" />
          <circle cx="21" cy="16" r="5" fill="none" stroke="#fff" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-white">Copiloto</p>
        <p className="text-xs font-medium text-brand-300">Óptico</p>
      </div>
    </div>
  )
}

function NavItem({ item, onClick }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:bg-noite-light hover:text-white',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </NavLink>
  )
}

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-noite px-3 py-5">
      <Logo />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Módulos</p>
        {nav.map((item) => (
          <NavItem key={item.to} item={item} onClick={onNavigate} />
        ))}
      </nav>
      <div className="flex flex-col gap-1 border-t border-noite-light pt-4">
        {navSecondary.map((item) => (
          <NavItem key={item.to} item={item} onClick={onNavigate} />
        ))}
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = [...nav, ...navSecondary].find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

  return (
    <div className="min-h-screen">
      {/* Barra lateral escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Barra lateral móvil */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-noite/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
          <button
            onClick={() => setOpen(false)}
            className="absolute left-[17rem] top-4 rounded-xl bg-white p-2 text-slate-700"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-semibold text-slate-900 lg:hidden">{current?.label ?? 'Copiloto Óptico'}</p>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar cliente, orden o producto…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label="Notificaciones">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              JG
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

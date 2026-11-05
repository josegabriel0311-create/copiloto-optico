import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { LogoMark } from './components/Logo.jsx'
import { useAuth } from './lib/auth.jsx'
import { StoreProvider } from './lib/store.jsx'
import Login from './pages/Login.jsx'
import CrearOptica from './pages/CrearOptica.jsx'
import Inicio from './pages/Inicio.jsx'
import NuevaFormula from './pages/NuevaFormula.jsx'
import Taller from './pages/Taller.jsx'
import Citas from './pages/Citas.jsx'
import Inventario from './pages/Inventario.jsx'
import Mermas from './pages/Mermas.jsx'
import Analiticas from './pages/Analiticas.jsx'
import Avisos from './pages/Avisos.jsx'
import Suscripcion from './pages/Suscripcion.jsx'
import Ajustes from './pages/Ajustes.jsx'

export function Cargando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <LogoMark className="h-10 w-10 animate-pulse" />
    </div>
  )
}

export default function App() {
  const { session, membresia, cargando } = useAuth()

  if (cargando) return <Cargando />
  if (!session) return <Login />
  if (!membresia) return <CrearOptica />

  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="nueva-formula" element={<NuevaFormula />} />
          <Route path="taller" element={<Taller />} />
          <Route path="citas" element={<Citas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="mermas" element={<Mermas />} />
          <Route path="analiticas" element={<Analiticas />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}

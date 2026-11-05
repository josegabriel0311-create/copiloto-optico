import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
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

export default function App() {
  return (
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
  )
}

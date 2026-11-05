import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import Mostrador from './pages/Mostrador.jsx'
import Gabinete from './pages/Gabinete.jsx'
import Taller from './pages/Taller.jsx'
import Configuracion from './pages/Configuracion.jsx'
import DesignSystem from './pages/DesignSystem.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="mostrador" element={<Mostrador />} />
        <Route path="gabinete" element={<Gabinete />} />
        <Route path="taller" element={<Taller />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="design-system" element={<DesignSystem />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

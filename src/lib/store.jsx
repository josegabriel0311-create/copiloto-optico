// Estado de la app (versión demo, guardada en el navegador).
// En la etapa de Supabase este archivo se reemplaza por llamadas a la base de datos,
// manteniendo las mismas funciones para que las pantallas no cambien.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const ESTADOS = [
  { id: 'recibida', label: 'Recibida', tone: 'blue' },
  { id: 'gabinete', label: 'En gabinete', tone: 'violet' },
  { id: 'taller', label: 'En taller', tone: 'amber' },
  { id: 'lista', label: 'Lista para entrega', tone: 'green' },
  { id: 'entregada', label: 'Entregada', tone: 'neutral' },
]

export const estadoInfo = (id) => ESTADOS.find((e) => e.id === id) ?? ESTADOS[0]
export const siguienteEstado = (id) => {
  const i = ESTADOS.findIndex((e) => e.id === id)
  return i >= 0 && i < ESTADOS.length - 1 ? ESTADOS[i + 1] : null
}

const STORAGE_KEY = 'copiloto-optico-demo-v1'
const DIA = 24 * 60 * 60 * 1000
const uid = () => Math.random().toString(36).slice(2, 10)
const haceDias = (d) => new Date(Date.now() - d * DIA).toISOString()

function semilla() {
  const usuario = 'Recepción'
  const ojo = { esfera: '-1.25', cilindro: '-0.50', eje: '90', adicion: '', dp: '31' }
  const crear = (paciente, telefono, estado, dias) => {
    const creada = haceDias(dias)
    const historial = []
    for (const e of ESTADOS) {
      historial.push({ estado: e.id, fecha: creada, usuario })
      if (e.id === estado) break
    }
    return {
      id: uid(),
      paciente,
      telefono,
      creada,
      estado,
      od: { ...ojo },
      oi: { ...ojo, eje: '85' },
      tipoLente: 'Monofocal',
      montura: '',
      notas: '',
      historial,
    }
  }

  return {
    optica: { nombre: 'Mi óptica', nit: '', telefono: '', ciudad: '' },
    usuario: { nombre: 'josegabriel0311', rol: 'Administrador' },
    formulas: [
      crear('Sofía Restrepo', '300 111 2233', 'recibida', 1),
      crear('Camila Torres', '301 222 3344', 'recibida', 2),
      crear('Jorge Iván Mejía', '302 333 4455', 'gabinete', 3),
      crear('Valentina Suárez', '310 444 5566', 'gabinete', 4),
      crear('Ana María Cárdenas', '311 555 6677', 'taller', 6),
      crear('Patricia Ríos', '312 666 7788', 'taller', 6),
      crear('Carlos Andrés Pérez', '313 777 8899', 'taller', 7),
      crear('Luisa Gómez', '314 888 9900', 'lista', 7),
      crear('Néstor Acosta', '315 999 0011', 'lista', 7),
      crear('María Fernanda Rojas', '316 000 1122', 'lista', 8),
      crear('Andrés Felipe Gil', '317 123 4567', 'entregada', 20),
      crear('Daniela Ospina', '318 234 5678', 'entregada', 40),
    ],
    inventario: [
      { id: uid(), codigo: 'MT-1001', marca: 'Ray-Ban', modelo: 'RB5154', color: 'Negro', cantidad: 4, costo: 180000 },
      { id: uid(), codigo: 'MT-1002', marca: 'Oakley', modelo: 'OX8156', color: 'Gris', cantidad: 3, costo: 210000 },
      { id: uid(), codigo: 'MT-1003', marca: 'Carrera', modelo: 'CA8824', color: 'Azul', cantidad: 2, costo: 160000 },
      { id: uid(), codigo: 'MT-1004', marca: 'Guess', modelo: 'GU50125', color: 'Vino', cantidad: 1, costo: 150000 },
      { id: uid(), codigo: 'MT-1005', marca: 'Kids Vision', modelo: 'KV-310', color: 'Turquesa', cantidad: 12, costo: 45000 },
      { id: uid(), codigo: 'MT-1006', marca: 'Vogue', modelo: 'VO5286', color: 'Carey', cantidad: 5, costo: 140000 },
    ],
    mermas: [],
    citas: [],
  }
}

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // sin acceso al almacenamiento: se usan los datos de ejemplo
  }
  return semilla()
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(cargar)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      // ignorar
    }
  }, [data])

  const acciones = useMemo(() => {
    const quien = () => data.usuario?.nombre ?? 'Usuario'
    return {
      crearFormula(campos) {
        const ahora = new Date().toISOString()
        const nueva = {
          id: uid(),
          creada: ahora,
          estado: 'recibida',
          historial: [{ estado: 'recibida', fecha: ahora, usuario: quien() }],
          ...campos,
        }
        setData((d) => ({ ...d, formulas: [nueva, ...d.formulas] }))
        return nueva
      },
      avanzarFormula(id) {
        setData((d) => ({
          ...d,
          formulas: d.formulas.map((f) => {
            if (f.id !== id) return f
            const sig = siguienteEstado(f.estado)
            if (!sig) return f
            return {
              ...f,
              estado: sig.id,
              historial: [...f.historial, { estado: sig.id, fecha: new Date().toISOString(), usuario: quien() }],
            }
          }),
        }))
      },
      ajustarStock(id, delta) {
        setData((d) => ({
          ...d,
          inventario: d.inventario.map((m) => (m.id === id ? { ...m, cantidad: Math.max(0, m.cantidad + delta) } : m)),
        }))
      },
      agregarMontura(campos) {
        setData((d) => ({ ...d, inventario: [...d.inventario, { id: uid(), cantidad: 0, costo: 0, ...campos }] }))
      },
      registrarMerma(campos) {
        setData((d) => ({
          ...d,
          mermas: [{ id: uid(), creada: new Date().toISOString(), usuario: quien(), ...campos }, ...d.mermas],
        }))
      },
      crearCita(campos) {
        setData((d) => ({ ...d, citas: [...d.citas, { id: uid(), ...campos }] }))
      },
      eliminarCita(id) {
        setData((d) => ({ ...d, citas: d.citas.filter((c) => c.id !== id) }))
      },
      guardarOptica(campos) {
        setData((d) => ({ ...d, optica: { ...d.optica, ...campos } }))
      },
      reiniciarDemo() {
        setData(semilla())
      },
    }
  }, [data.usuario])

  return <StoreContext.Provider value={{ ...data, ...acciones }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

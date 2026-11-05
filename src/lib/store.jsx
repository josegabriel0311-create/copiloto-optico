// Datos de la óptica, guardados en Supabase.
// Las pantallas usan useStore() y no necesitan saber cómo se guardan los datos.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './auth.jsx'

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

// --- Conversión entre la base de datos (snake_case) y la app ---
const aFormula = (r, historial = []) => ({
  id: r.id,
  paciente: r.paciente,
  telefono: r.telefono ?? '',
  estado: r.estado,
  od: r.od ?? {},
  oi: r.oi ?? {},
  tipoLente: r.tipo_lente ?? '',
  montura: r.montura ?? '',
  notas: r.notas ?? '',
  creada: r.creada,
  historial,
})
const aHistorial = (h) => ({ estado: h.estado, fecha: h.fecha, usuario: h.usuario })

const vacio = { optica: null, formulas: [], inventario: [], mermas: [], citas: [] }

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const { membresia, user } = useAuth()
  const opticaId = membresia?.optica_id
  const [data, setData] = useState(vacio)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const usuario = useMemo(
    () => ({ nombre: membresia?.nombre || user?.email || 'Usuario', rol: membresia?.rol === 'admin' ? 'Administrador' : membresia?.rol ?? '' }),
    [membresia, user],
  )

  const fallo = useCallback((e, mensaje) => {
    if (!e) return false
    console.error(mensaje, e)
    setError(`${mensaje}. ${e.message ?? ''}`.trim())
    return true
  }, [])

  const cargar = useCallback(async () => {
    if (!opticaId) return
    setCargando(true)
    const [o, f, h, i, m, c] = await Promise.all([
      supabase.from('opticas').select('*').eq('id', opticaId).single(),
      supabase.from('formulas').select('*').eq('optica_id', opticaId).order('creada', { ascending: false }),
      supabase.from('formula_historial').select('formula_id, estado, fecha, usuario').eq('optica_id', opticaId).order('fecha', { ascending: true }),
      supabase.from('inventario').select('*').eq('optica_id', opticaId).order('marca'),
      supabase.from('mermas').select('*').eq('optica_id', opticaId).order('fecha', { ascending: false }),
      supabase.from('citas').select('*').eq('optica_id', opticaId).order('fecha'),
    ])
    const primerError = [o, f, h, i, m, c].find((r) => r.error)?.error
    if (fallo(primerError, 'No se pudieron cargar los datos')) {
      setCargando(false)
      return
    }
    const porFormula = {}
    for (const x of h.data) (porFormula[x.formula_id] ||= []).push(aHistorial(x))
    setData({
      optica: o.data,
      formulas: f.data.map((r) => aFormula(r, porFormula[r.id] ?? [])),
      inventario: i.data,
      mermas: m.data,
      citas: c.data,
    })
    setCargando(false)
  }, [opticaId, fallo])

  useEffect(() => {
    cargar()
  }, [cargar])

  const acciones = useMemo(
    () => ({
      async crearFormula(campos) {
        const { data: r, error: e } = await supabase
          .from('formulas')
          .insert({
            optica_id: opticaId,
            paciente: campos.paciente,
            telefono: campos.telefono,
            od: campos.od,
            oi: campos.oi,
            tipo_lente: campos.tipoLente,
            montura: campos.montura,
            notas: campos.notas,
          })
          .select()
          .single()
        if (fallo(e, 'No se pudo guardar la fórmula')) return null
        const { data: hr } = await supabase
          .from('formula_historial')
          .insert({ formula_id: r.id, optica_id: opticaId, estado: 'recibida', usuario: usuario.nombre })
          .select('estado, fecha, usuario')
          .single()
        const nueva = aFormula(r, hr ? [aHistorial(hr)] : [])
        setData((d) => ({ ...d, formulas: [nueva, ...d.formulas] }))
        return nueva
      },

      async avanzarFormula(id) {
        const f = data.formulas.find((x) => x.id === id)
        const sig = f && siguienteEstado(f.estado)
        if (!sig) return
        const { error: e } = await supabase.from('formulas').update({ estado: sig.id }).eq('id', id)
        if (fallo(e, 'No se pudo cambiar el estado')) return
        const { data: hr } = await supabase
          .from('formula_historial')
          .insert({ formula_id: id, optica_id: opticaId, estado: sig.id, usuario: usuario.nombre })
          .select('estado, fecha, usuario')
          .single()
        const paso = hr ? aHistorial(hr) : { estado: sig.id, fecha: new Date().toISOString(), usuario: usuario.nombre }
        setData((d) => ({
          ...d,
          formulas: d.formulas.map((x) => (x.id === id ? { ...x, estado: sig.id, historial: [...x.historial, paso] } : x)),
        }))
      },

      async ajustarStock(id, delta) {
        // Cambio inmediato en pantalla; se corrige con el valor real que devuelve la base de datos
        setData((d) => ({ ...d, inventario: d.inventario.map((m) => (m.id === id ? { ...m, cantidad: Math.max(0, m.cantidad + delta) } : m)) }))
        const { data: cantidad, error: e } = await supabase.rpc('ajustar_stock', { p_id: id, p_delta: delta })
        if (fallo(e, 'No se pudo actualizar el inventario')) return cargar()
        if (typeof cantidad === 'number') {
          setData((d) => ({ ...d, inventario: d.inventario.map((m) => (m.id === id ? { ...m, cantidad } : m)) }))
        }
      },

      async agregarMontura(campos) {
        const { data: r, error: e } = await supabase
          .from('inventario')
          .insert({ optica_id: opticaId, ...campos })
          .select()
          .single()
        if (fallo(e, 'No se pudo agregar la montura')) return
        setData((d) => ({ ...d, inventario: [...d.inventario, r] }))
      },

      async registrarMerma(campos) {
        const { data: r, error: e } = await supabase
          .from('mermas')
          .insert({ optica_id: opticaId, usuario: usuario.nombre, ...campos })
          .select()
          .single()
        if (fallo(e, 'No se pudo registrar la merma')) return
        setData((d) => ({ ...d, mermas: [r, ...d.mermas] }))
      },

      async crearCita(campos) {
        const { data: r, error: e } = await supabase
          .from('citas')
          .insert({ optica_id: opticaId, ...campos })
          .select()
          .single()
        if (fallo(e, 'No se pudo agendar la cita')) return
        setData((d) => ({ ...d, citas: [...d.citas, r] }))
      },

      async eliminarCita(id) {
        const { error: e } = await supabase.from('citas').delete().eq('id', id)
        if (fallo(e, 'No se pudo eliminar la cita')) return
        setData((d) => ({ ...d, citas: d.citas.filter((c) => c.id !== id) }))
      },

      async guardarOptica(campos) {
        const { nombre, nit, telefono, ciudad } = campos
        const { data: r, error: e } = await supabase
          .from('opticas')
          .update({ nombre, nit, telefono, ciudad })
          .eq('id', opticaId)
          .select()
          .single()
        if (fallo(e, 'No se pudieron guardar los datos de la óptica')) return false
        setData((d) => ({ ...d, optica: r }))
        return true
      },

      recargar: cargar,
      limpiarError: () => setError(''),
    }),
    [opticaId, usuario, data.formulas, fallo, cargar],
  )

  return (
    <StoreContext.Provider value={{ ...data, usuario, cargando, error, ...acciones }}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

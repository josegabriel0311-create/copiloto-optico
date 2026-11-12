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
  pacienteId: r.paciente_id ?? null,
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

const vacio = { optica: null, pacientes: [], formulas: [], inventario: [], mermas: [], citas: [] }

// La tabla de pacientes llega con una actualización de la base de datos (supabase/02_pacientes.sql)
const faltaTabla = (e) => e && (e.code === '42P01' || e.code === 'PGRST205' || /pacientes/i.test(e.message ?? ''))
const AVISO_PACIENTES =
  'Falta actualizar la base de datos para usar Pacientes: ejecuta el archivo 02_pacientes.sql en el SQL Editor de Supabase.'

const limpiarPaciente = (c) => ({
  nombre: (c.nombre ?? '').trim(),
  documento: (c.documento ?? '').trim(),
  telefono: (c.telefono ?? '').trim(),
  email: (c.email ?? '').trim(),
  fecha_nacimiento: c.fecha_nacimiento || null,
  notas: c.notas ?? '',
})

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
    const [p, o, f, h, i, m, c] = await Promise.all([
      supabase.from('pacientes').select('*').eq('optica_id', opticaId).order('nombre'),
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
    if (p.error) {
      console.error('No se pudieron cargar los pacientes', p.error)
      setError(faltaTabla(p.error) ? AVISO_PACIENTES : `No se pudieron cargar los pacientes. ${p.error.message ?? ''}`)
    }
    setData({
      optica: o.data,
      pacientes: p.data ?? [],
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
      async crearPaciente(campos) {
        const { data: r, error: e } = await supabase
          .from('pacientes')
          .insert({ optica_id: opticaId, ...limpiarPaciente(campos) })
          .select()
          .single()
        if (e) {
          if (faltaTabla(e)) setError(AVISO_PACIENTES)
          else fallo(e, 'No se pudo guardar el paciente')
          return null
        }
        setData((d) => ({ ...d, pacientes: [...d.pacientes, r].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }))
        return r
      },

      async actualizarPaciente(id, campos) {
        const limpio = limpiarPaciente(campos)
        const { data: r, error: e } = await supabase.from('pacientes').update(limpio).eq('id', id).select().single()
        if (fallo(e, 'No se pudieron guardar los datos del paciente')) return false
        // Las fórmulas guardan una copia del nombre y teléfono para mostrarlos en el taller
        await supabase.from('formulas').update({ paciente: r.nombre, telefono: r.telefono }).eq('paciente_id', id)
        setData((d) => ({
          ...d,
          pacientes: d.pacientes.map((x) => (x.id === id ? r : x)),
          formulas: d.formulas.map((f) => (f.pacienteId === id ? { ...f, paciente: r.nombre, telefono: r.telefono } : f)),
        }))
        return true
      },

      // campos.pacienteId: paciente existente. Si no viene, se crea el paciente con campos.nuevoPaciente.
      async crearFormula(campos) {
        let pac = data.pacientes.find((x) => x.id === campos.pacienteId)
        if (!pac) {
          pac = await acciones.crearPaciente(campos.nuevoPaciente)
          if (!pac) return null
        }
        const { data: r, error: e } = await supabase
          .from('formulas')
          .insert({
            optica_id: opticaId,
            paciente_id: pac.id,
            paciente: pac.nombre,
            telefono: pac.telefono,
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
    [opticaId, usuario, data.formulas, data.pacientes, fallo, cargar],
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

// Datos de la óptica, guardados en Supabase.
// Las pantallas usan useStore() y no necesitan saber cómo se guardan los datos.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './auth.jsx'
import { ROLES } from './permisos.js'

export const ESTADOS = [
  { id: 'recibida', label: 'Recibida', tone: 'blue' },
  { id: 'gabinete', label: 'En gabinete', tone: 'violet' },
  { id: 'taller', label: 'En taller', tone: 'amber' },
  { id: 'lista', label: 'Lista para entrega', tone: 'green' },
  { id: 'entregada', label: 'Entregada', tone: 'neutral' },
]

export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'Daviplata', 'Otro']

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
  precio: Number(r.precio ?? 0),
  avisadoEn: r.avisado_en ?? null,
  creada: r.creada,
  historial,
})
const aHistorial = (h) => ({ estado: h.estado, fecha: h.fecha, usuario: h.usuario })
const aPago = (p) => ({ ...p, monto: Number(p.monto) })

const vacio = { optica: null, pacientes: [], formulas: [], pagos: [], inventario: [], mermas: [], citas: [] }

// Tablas o columnas que llegan con actualizaciones de la base de datos (carpeta supabase/)
const faltaEnBD = (e) => e && ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(e.code)
const AVISO_PACIENTES =
  'Falta actualizar la base de datos para usar Pacientes: ejecuta el archivo 02_pacientes.sql en el SQL Editor de Supabase.'
const AVISO_03 =
  'Falta actualizar la base de datos para usar Cobros, WhatsApp y Equipo: ejecuta el archivo 03_cobros_whatsapp_equipo.sql en el SQL Editor de Supabase.'

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
  const rol = membresia?.rol ?? 'admin'
  const [data, setData] = useState(vacio)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const dataRef = useRef(data)
  dataRef.current = data

  const usuario = useMemo(
    () => ({ nombre: membresia?.nombre || user?.email || 'Usuario', rol, rolNombre: ROLES[rol] ?? rol }),
    [membresia, user, rol],
  )

  const fallo = useCallback((e, mensaje) => {
    if (!e) return false
    console.error(mensaje, e)
    setError(faltaEnBD(e) ? AVISO_03 : `${mensaje}. ${e.message ?? ''}`.trim())
    return true
  }, [])

  const cargar = useCallback(async () => {
    if (!opticaId) return
    setCargando(true)
    const [p, pg, o, f, h, i, m, c] = await Promise.all([
      supabase.from('pacientes').select('*').eq('optica_id', opticaId).order('nombre'),
      supabase.from('pagos').select('*').eq('optica_id', opticaId).order('fecha', { ascending: false }),
      supabase.from('opticas').select('*').eq('id', opticaId).single(),
      supabase.from('formulas').select('*').eq('optica_id', opticaId).order('creada', { ascending: false }),
      supabase.from('formula_historial').select('formula_id, estado, fecha, usuario').eq('optica_id', opticaId).order('fecha', { ascending: true }),
      supabase.from('inventario').select('*').eq('optica_id', opticaId).order('marca'),
      supabase.from('mermas').select('*').eq('optica_id', opticaId).order('fecha', { ascending: false }),
      supabase.from('citas').select('*').eq('optica_id', opticaId).order('fecha'),
    ])
    const primerError = [o, f, h, i, m, c].find((r) => r.error)?.error
    if (primerError) {
      console.error('No se pudieron cargar los datos', primerError)
      setError(`No se pudieron cargar los datos. ${primerError.message ?? ''}`.trim())
      setCargando(false)
      return
    }
    const porFormula = {}
    for (const x of h.data) (porFormula[x.formula_id] ||= []).push(aHistorial(x))
    if (p.error) {
      console.error('No se pudieron cargar los pacientes', p.error)
      setError(faltaEnBD(p.error) ? AVISO_PACIENTES : `No se pudieron cargar los pacientes. ${p.error.message ?? ''}`)
    } else if (pg.error) {
      console.error('No se pudieron cargar los pagos', pg.error)
      setError(faltaEnBD(pg.error) ? AVISO_03 : `No se pudieron cargar los pagos. ${pg.error.message ?? ''}`)
    }
    setData({
      optica: o.data,
      pacientes: p.data ?? [],
      pagos: (pg.data ?? []).map(aPago),
      formulas: f.data.map((r) => aFormula(r, porFormula[r.id] ?? [])),
      inventario: i.data,
      mermas: m.data,
      citas: c.data,
    })
    setCargando(false)
  }, [opticaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Pagado y saldo de cada fórmula
  const cuentas = useMemo(() => {
    const pagado = {}
    for (const p of data.pagos) pagado[p.formula_id] = (pagado[p.formula_id] ?? 0) + p.monto
    const r = {}
    for (const f of data.formulas) {
      const pg = pagado[f.id] ?? 0
      r[f.id] = { precio: f.precio, pagado: pg, saldo: Math.max(0, f.precio - pg) }
    }
    return r
  }, [data.pagos, data.formulas])

  const acciones = useMemo(() => {
    const a = {
      async crearPaciente(campos) {
        const { data: r, error: e } = await supabase
          .from('pacientes')
          .insert({ optica_id: opticaId, ...limpiarPaciente(campos) })
          .select()
          .single()
        if (e) {
          if (faltaEnBD(e)) setError(AVISO_PACIENTES)
          else fallo(e, 'No se pudo guardar el paciente')
          return null
        }
        setData((d) => ({ ...d, pacientes: [...d.pacientes, r].sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')) }))
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

      // campos.pacienteId: paciente existente. Si no viene, se crea con campos.nuevoPaciente.
      // campos.precio y campos.abono ({ monto, metodo }) son opcionales.
      async crearFormula(campos) {
        let pac = dataRef.current.pacientes.find((x) => x.id === campos.pacienteId)
        if (!pac) {
          pac = await a.crearPaciente(campos.nuevoPaciente)
          if (!pac) return null
        }
        const fila = {
          optica_id: opticaId,
          paciente_id: pac.id,
          paciente: pac.nombre,
          telefono: pac.telefono,
          od: campos.od,
          oi: campos.oi,
          tipo_lente: campos.tipoLente,
          montura: campos.montura,
          notas: campos.notas,
        }
        // Solo se envía el precio si hay uno, así la app funciona aunque falte la actualización 03
        if (Number(campos.precio) > 0) fila.precio = Number(campos.precio)
        const { data: r, error: e } = await supabase.from('formulas').insert(fila).select().single()
        if (fallo(e, 'No se pudo guardar la fórmula')) return null
        const { data: hr } = await supabase
          .from('formula_historial')
          .insert({ formula_id: r.id, optica_id: opticaId, estado: 'recibida', usuario: usuario.nombre })
          .select('estado, fecha, usuario')
          .single()
        const nueva = aFormula(r, hr ? [aHistorial(hr)] : [])
        setData((d) => ({ ...d, formulas: [nueva, ...d.formulas] }))
        if (Number(campos.abono?.monto) > 0) {
          await a.registrarPago({ formulaId: r.id, monto: campos.abono.monto, metodo: campos.abono.metodo, nota: 'Abono inicial' })
        }
        return nueva
      },

      async avanzarFormula(id) {
        const f = dataRef.current.formulas.find((x) => x.id === id)
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

      // Se llama al abrir WhatsApp para avisar que la fórmula está lista
      async marcarAvisado(id) {
        const ahora = new Date().toISOString()
        setData((d) => ({ ...d, formulas: d.formulas.map((x) => (x.id === id ? { ...x, avisadoEn: ahora } : x)) }))
        const { error: e } = await supabase.from('formulas').update({ avisado_en: ahora }).eq('id', id)
        if (e) console.error('No se pudo marcar como avisado', e)
      },

      async actualizarPrecio(id, precio) {
        const valor = Math.max(0, Number(precio) || 0)
        const { error: e } = await supabase.from('formulas').update({ precio: valor }).eq('id', id)
        if (fallo(e, 'No se pudo guardar el precio')) return false
        setData((d) => ({ ...d, formulas: d.formulas.map((x) => (x.id === id ? { ...x, precio: valor } : x)) }))
        return true
      },

      async registrarPago({ formulaId, monto, metodo, nota }) {
        const valor = Number(monto) || 0
        if (valor <= 0) return false
        const { data: r, error: e } = await supabase
          .from('pagos')
          .insert({ optica_id: opticaId, formula_id: formulaId, monto: valor, metodo: metodo || 'Efectivo', nota: nota ?? '', usuario: usuario.nombre })
          .select()
          .single()
        if (fallo(e, 'No se pudo registrar el pago')) return false
        setData((d) => ({ ...d, pagos: [aPago(r), ...d.pagos] }))
        return true
      },

      async eliminarPago(id) {
        const { error: e } = await supabase.from('pagos').delete().eq('id', id)
        if (fallo(e, 'No se pudo eliminar el pago')) return false
        setData((d) => ({ ...d, pagos: d.pagos.filter((p) => p.id !== id) }))
        return true
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

      // Solo se envían los campos que vienen, así la app funciona aunque falte la actualización 03
      async guardarOptica(campos) {
        const permitidos = ['nombre', 'nit', 'telefono', 'ciudad', 'mensaje_lista']
        const cambios = Object.fromEntries(Object.entries(campos).filter(([k]) => permitidos.includes(k)))
        const { data: r, error: e } = await supabase.from('opticas').update(cambios).eq('id', opticaId).select().single()
        if (fallo(e, 'No se pudieron guardar los datos de la óptica')) return false
        setData((d) => ({ ...d, optica: r }))
        return true
      },

      recargar: cargar,
      limpiarError: () => setError(''),
    }
    return a
  }, [opticaId, usuario, fallo, cargar])

  return (
    <StoreContext.Provider value={{ ...data, cuentas, usuario, cargando, error, ...acciones }}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
